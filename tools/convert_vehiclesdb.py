#!/usr/bin/env python3
"""Convert VehiclesDB's compact open release into an AutoParts Explorer pack.

Input is a user-provided VehiclesDB vehicles.min.json file. This converter only
uses the compact catalog's car nameplates; it does not invent model years,
generations, markets, engine codes, parts, diagrams, or fitment.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

SOURCE_HOME = "https://vehiclesdb.com"
ATTRIBUTION = "Vehicle data by VehiclesDB (vehiclesdb.com), CC BY 4.0; retain data/packs/vehiclesdb/ATTRIBUTION.md for upstream source notices."


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="VehiclesDB vehicles.min.json")
    parser.add_argument("output", type=Path, help="AutoParts Explorer JSON pack output")
    args = parser.parse_args()

    source_bytes = args.input.read_bytes()
    source = json.loads(source_bytes.decode("utf-8"))
    if not isinstance(source, dict) or not isinstance(source.get("makes"), list) or not isinstance(source.get("models"), list):
        raise SystemExit("Input must be a VehiclesDB compact catalog with makes and models arrays")
    version = str(source.get("v") or "unknown")
    source_manifest_path = args.input.with_name("source-manifest.json")
    release_manifest = json.loads(source_manifest_path.read_text(encoding="utf-8")) if source_manifest_path.exists() else {}
    countries = release_manifest.get("countries", [])
    make_names = {row[0]: row[1] for row in source["makes"] if isinstance(row, list) and len(row) >= 2}
    cars = []
    for row in source["models"]:
        if not isinstance(row, list) or len(row) < 4:
            continue
        make_slug, model_slug, model_name, kind = row[:4]
        body_type = row[4] if len(row) > 4 else None
        if kind != "car" or make_slug not in make_names:
            continue
        make_name = make_names[make_slug]
        cars.append({
            "id": f"vehiclesdb:car:{make_slug}:{model_slug}",
            "sourceId": f"vehiclesdb:{version}",
            "sourceModelId": f"{make_slug}/{model_slug}",
            "make": make_name,
            "model": model_name,
            "label": f"{make_name} {model_name}",
            "kind": "car",
            "bodyStyle": body_type,
            "generation": None,
            "yearFrom": None,
            "yearTo": None,
            "market": None,
            "engineIds": []
        })
    if not cars:
        raise SystemExit("No car model records found in input")
    country_count = len(countries)
    cars.sort(key=lambda item: (item["make"].casefold(), item["model"].casefold(), item["id"]))
    source_manifest = {
        "packId": f"vehiclesdb.open.cars.{version}",
        "version": version,
        "schemaVersion": 1,
        "title": f"VehiclesDB open car make/model names {version}",
        "builtAt": release_manifest.get("built_at"),
        "coverage": {
            "catalogKind": "car nameplates only",
            "sourceCountryCodes": countries,
            "countryCodesAreNotPerModelAvailability": True,
            "yearsGenerationsEnginesPartsAndFitment": "not included"
        },
        "recordCounts": {"vehicles": len(cars), "engines": 0, "systems": 0, "assemblies": 0, "parts": 0, "diagrams": 0, "diagramItems": 0},
        "sources": [{
            "id": f"vehiclesdb:{version}",
            "name": f"VehiclesDB open dataset v{version}",
            "url": f"https://github.com/vehiclesdb/vehiclesdb/releases/tag/v{version}",
            "license": "CC BY 4.0",
            "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
            "attribution": ATTRIBUTION
        }],
        "sha256Input": hashlib.sha256(source_bytes).hexdigest()
    }
    notice = {
        "ar": f"حزمة أسماء سيارات مفتوحة من VehiclesDB إصدار {version}: {len(cars)} طرازاً اسمياً. تغطية المصدر الإجمالية تشمل {country_count} دولة ولا تعني توفر كل طراز في كل دولة. لا تتضمن سنوات أو أجيالاً أو محركات أو قطعاً أو رسومات أو توافقاً.",
        "en": f"VehiclesDB open car-nameplate pack {version}: {len(cars)} nameplates. Source coverage spans {country_count} countries but does not mean each model is available in each country. No years, generations, engines, parts, diagrams, or fitment are included.",
        "fr": f"Paquet ouvert de modèles automobiles VehiclesDB {version} : {len(cars)} modèles nominatifs. La couverture globale comprend {country_count} pays, sans garantir chaque modèle dans chaque pays. Années, générations, moteurs, pièces, schémas et compatibilités ne sont pas inclus."
    }
    pack = {
        "manifest": source_manifest,
        "db": {
            "meta": {"name": source_manifest["title"], "version": 1, "demo": False, "sourceId": f"vehiclesdb:{version}", "notice": notice},
            "vehicles": cars,
            "engines": [],
            "systems": [],
            "assemblies": [],
            "parts": [],
            "diagrams": [],
            "diagramItems": []
        }
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(cars)} car nameplates to {args.output}")
    print(f"Input SHA-256: {source_manifest['sha256Input']}")
    print("Reminder: include the VehiclesDB LICENSE and ATTRIBUTION notices; upstream licenses remain in force.")


if __name__ == "__main__":
    main()
