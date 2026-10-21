#!/usr/bin/env python3
"""Validate AutoParts Explorer JSON packs using only Python's standard library.

This checks structure and traceability fields; it does not establish that a license
statement is legally correct or that the source data is factually accurate.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

MAX_BYTES = 25 * 1024 * 1024
TABLES = ("vehicles", "engines", "systems", "assemblies", "parts", "diagrams", "diagramItems")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def ids(rows: list, table: str) -> set[str]:
    if not isinstance(rows, list):
        fail(f"{table} must be an array")
    seen: set[str] = set()
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or not isinstance(row.get("id"), str) or not row["id"].strip():
            fail(f"{table}[{index}] must have a non-empty string id")
        if row["id"] in seen:
            fail(f"duplicate {table} id: {row['id']}")
        seen.add(row["id"])
    return seen


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pack", type=Path, help="JSON data pack to validate")
    args = parser.parse_args()
    if not args.pack.is_file():
        fail(f"file not found: {args.pack}")
    size = args.pack.stat().st_size
    if size > MAX_BYTES:
        fail(f"file is {size} bytes; limit is {MAX_BYTES} bytes")
    try:
        payload = json.loads(args.pack.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        fail(f"invalid UTF-8 JSON: {exc}")
    if not isinstance(payload, dict):
        fail("top-level JSON value must be an object")

    manifest = payload.get("manifest")
    if not isinstance(manifest, dict):
        fail("missing manifest object")
    for field in ("packId", "version", "schemaVersion"):
        if not manifest.get(field):
            fail(f"manifest.{field} is required")
    if int(manifest["schemaVersion"]) != 1:
        fail("unsupported schemaVersion; this tool supports version 1")
    sources = manifest.get("sources")
    if not isinstance(sources, list) or not sources:
        fail("manifest.sources must contain at least one source")
    for index, source in enumerate(sources):
        if not isinstance(source, dict) or not all(source.get(field) for field in ("id", "name", "url", "license")):
            fail(f"manifest.sources[{index}] must include id, name, url, and exact license name")

    data = payload.get("db", payload.get("data"))
    if not isinstance(data, dict):
        fail("db object is required")
    table_ids = {table: ids(data.get(table), table) for table in TABLES}
    for vehicle in data["vehicles"]:
        for engine_id in vehicle.get("engineIds", []):
            if engine_id not in table_ids["engines"]:
                fail(f"vehicle {vehicle['id']} references missing engine {engine_id}")
    for system in data["systems"]:
        for assembly_id in system.get("assemblyIds", []):
            if assembly_id not in table_ids["assemblies"]:
                fail(f"system {system['id']} references missing assembly {assembly_id}")
    for assembly in data["assemblies"]:
        if assembly.get("systemId") not in table_ids["systems"]:
            fail(f"assembly {assembly['id']} references missing system")
        if assembly.get("diagramId") not in table_ids["diagrams"]:
            fail(f"assembly {assembly['id']} references missing diagram")
    assemblies_by_id = {assembly["id"]: assembly for assembly in data["assemblies"]}
    for assembly in data["assemblies"]:
        parent_id = assembly.get("parentId")
        if parent_id and (parent_id not in assemblies_by_id or assemblies_by_id[parent_id].get("systemId") != assembly.get("systemId")):
            fail(f"assembly {assembly['id']} has an invalid parent")
        seen = {assembly["id"]}
        while parent_id:
            if parent_id in seen:
                fail(f"assembly hierarchy contains a cycle at {assembly['id']}")
            seen.add(parent_id)
            parent_id = assemblies_by_id[parent_id].get("parentId")
    for item in data["diagramItems"]:
        if item.get("diagramId") not in table_ids["diagrams"] or item.get("partId") not in table_ids["parts"]:
            fail(f"diagram item {item['id']} references a missing diagram or part")

    for diagram in data["diagrams"]:
        if not diagram.get("license") and not diagram.get("licenseName"):
            fail(f"diagram {diagram['id']} has no license field")
        if not (diagram.get("source") or diagram.get("sourceId") or diagram.get("sourceUrl")):
            fail(f"diagram {diagram['id']} has no source field")
    for part in data["parts"]:
        for image in part.get("images", []):
            if isinstance(image, str) or not isinstance(image, dict) or not (image.get("license") or image.get("licenseName")):
                fail(f"part {part['id']} has an image without an explicit license")
            if not (image.get("source") or image.get("sourceId") or image.get("sourceUrl")):
                fail(f"part {part['id']} has an image without a source")
        for fitment in part.get("fitments", []):
            if fitment.get("verificationStatus") == "verified" or fitment.get("verified") is True:
                if not fitment.get("source") or not fitment.get("evidenceUrl"):
                    fail(f"verified fitment on {part['id']} must include source and evidenceUrl")

    expected_counts = manifest.get("recordCounts")
    if isinstance(expected_counts, dict):
        for table in TABLES:
            if table in expected_counts and expected_counts[table] != len(data[table]):
                fail(f"manifest recordCounts.{table} does not match data")
    print(f"OK: {manifest['packId']} v{manifest['version']}")
    print("Records: " + ", ".join(f"{table}={len(data[table])}" for table in TABLES))
    print(f"Sources with license fields: {len(sources)}")
    print("Note: validation checks schema and declarations only; verify factual accuracy, rights, and redistribution terms independently.")


if __name__ == "__main__":
    main()
