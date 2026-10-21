PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS data_source (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  license_name TEXT,
  license_url TEXT,
  attribution TEXT,
  coverage_json TEXT NOT NULL DEFAULT '{}',
  retrieved_at TEXT,
  terms_checked_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS catalog_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS make (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  names_json TEXT NOT NULL DEFAULT '{}',
  source_id TEXT REFERENCES data_source(id),
  UNIQUE(canonical_name, source_id)
);
CREATE INDEX IF NOT EXISTS idx_make_name ON make(canonical_name);

CREATE TABLE IF NOT EXISTS model (
  id TEXT PRIMARY KEY,
  make_id TEXT NOT NULL REFERENCES make(id) ON DELETE CASCADE,
  canonical_name TEXT NOT NULL,
  names_json TEXT NOT NULL DEFAULT '{}',
  aliases_json TEXT NOT NULL DEFAULT '[]',
  source_id TEXT REFERENCES data_source(id),
  UNIQUE(make_id, canonical_name)
);
CREATE INDEX IF NOT EXISTS idx_model_make_name ON model(make_id, canonical_name);

CREATE TABLE IF NOT EXISTS generation (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES model(id) ON DELETE CASCADE,
  name TEXT,
  code TEXT,
  year_from INTEGER,
  year_to INTEGER,
  source_id TEXT REFERENCES data_source(id),
  CHECK(year_from IS NULL OR year_to IS NULL OR year_from <= year_to)
);
CREATE INDEX IF NOT EXISTS idx_generation_model_year ON generation(model_id, year_from, year_to);

CREATE TABLE IF NOT EXISTS market (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  names_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS vehicle_variant (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL REFERENCES generation(id) ON DELETE CASCADE,
  market_id TEXT REFERENCES market(id),
  trim_name TEXT,
  body_style TEXT,
  year_from INTEGER,
  year_to INTEGER,
  source_id TEXT REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT,
  CHECK(year_from IS NULL OR year_to IS NULL OR year_from <= year_to)
);
CREATE INDEX IF NOT EXISTS idx_vehicle_variant_lookup ON vehicle_variant(generation_id, market_id, year_from, year_to);

CREATE TABLE IF NOT EXISTS engine (
  id TEXT PRIMARY KEY,
  code TEXT,
  names_json TEXT NOT NULL DEFAULT '{}',
  displacement_cc INTEGER,
  fuel_type TEXT,
  aspiration TEXT,
  cylinder_count INTEGER,
  source_id TEXT REFERENCES data_source(id),
  evidence_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_engine_code ON engine(code);

CREATE TABLE IF NOT EXISTS vehicle_engine (
  vehicle_variant_id TEXT NOT NULL REFERENCES vehicle_variant(id) ON DELETE CASCADE,
  engine_id TEXT NOT NULL REFERENCES engine(id) ON DELETE CASCADE,
  year_from INTEGER,
  year_to INTEGER,
  source_id TEXT REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT,
  PRIMARY KEY(vehicle_variant_id, engine_id),
  CHECK(year_from IS NULL OR year_to IS NULL OR year_from <= year_to)
);

CREATE TABLE IF NOT EXISTS vehicle_system (
  id TEXT PRIMARY KEY,
  vehicle_variant_id TEXT REFERENCES vehicle_variant(id) ON DELETE CASCADE,
  system_code TEXT NOT NULL,
  names_json TEXT NOT NULL DEFAULT '{}',
  description_json TEXT NOT NULL DEFAULT '{}',
  source_id TEXT REFERENCES data_source(id)
);
CREATE INDEX IF NOT EXISTS idx_system_variant ON vehicle_system(vehicle_variant_id, system_code);

CREATE TABLE IF NOT EXISTS assembly (
  id TEXT PRIMARY KEY,
  system_id TEXT NOT NULL REFERENCES vehicle_system(id) ON DELETE CASCADE,
  parent_assembly_id TEXT REFERENCES assembly(id) ON DELETE CASCADE,
  names_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_id TEXT REFERENCES data_source(id)
);
CREATE INDEX IF NOT EXISTS idx_assembly_parent ON assembly(system_id, parent_assembly_id, sort_order);

CREATE TABLE IF NOT EXISTS part (
  id TEXT PRIMARY KEY,
  names_json TEXT NOT NULL DEFAULT '{}',
  function_json TEXT NOT NULL DEFAULT '{}',
  location_json TEXT NOT NULL DEFAULT '{}',
  source_id TEXT REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT
);

CREATE TABLE IF NOT EXISTS part_number (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  number_value TEXT NOT NULL,
  number_type TEXT NOT NULL CHECK(number_type IN ('OEM','aftermarket','manufacturer','other')),
  brand TEXT,
  source_id TEXT REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_part_number_value ON part_number(number_value);
CREATE INDEX IF NOT EXISTS idx_part_number_part ON part_number(part_id);

CREATE TABLE IF NOT EXISTS cross_reference (
  from_number_id TEXT NOT NULL REFERENCES part_number(id) ON DELETE CASCADE,
  to_number_id TEXT NOT NULL REFERENCES part_number(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT,
  PRIMARY KEY(from_number_id, to_number_id),
  CHECK(from_number_id <> to_number_id)
);

CREATE TABLE IF NOT EXISTS fitment (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  vehicle_variant_id TEXT NOT NULL REFERENCES vehicle_variant(id) ON DELETE CASCADE,
  engine_id TEXT REFERENCES engine(id),
  year_from INTEGER,
  year_to INTEGER,
  source_id TEXT NOT NULL REFERENCES data_source(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_status IN ('unverified','source-listed','verified')),
  evidence_url TEXT NOT NULL,
  verified_at TEXT,
  CHECK(year_from IS NULL OR year_to IS NULL OR year_from <= year_to)
);
CREATE INDEX IF NOT EXISTS idx_fitment_part ON fitment(part_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_fitment_vehicle ON fitment(vehicle_variant_id, engine_id, verification_status);

CREATE TABLE IF NOT EXISTS diagram (
  id TEXT PRIMARY KEY,
  assembly_id TEXT NOT NULL REFERENCES assembly(id) ON DELETE CASCADE,
  title TEXT,
  asset_path TEXT,
  mime_type TEXT,
  view_box TEXT,
  source_id TEXT NOT NULL REFERENCES data_source(id),
  license_name TEXT NOT NULL,
  attribution TEXT,
  verification_status TEXT NOT NULL DEFAULT 'source-listed',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_diagram_assembly ON diagram(assembly_id);

CREATE TABLE IF NOT EXISTS diagram_item (
  id TEXT PRIMARY KEY,
  diagram_id TEXT NOT NULL REFERENCES diagram(id) ON DELETE CASCADE,
  part_id TEXT NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  callout TEXT NOT NULL,
  geometry_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(diagram_id, callout)
);
CREATE INDEX IF NOT EXISTS idx_diagram_item_part ON diagram_item(part_id);

CREATE TABLE IF NOT EXISTS part_image (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  asset_path TEXT NOT NULL,
  caption_json TEXT NOT NULL DEFAULT '{}',
  source_id TEXT NOT NULL REFERENCES data_source(id),
  license_name TEXT NOT NULL,
  attribution TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_part_image_part ON part_image(part_id, sort_order);

CREATE TABLE IF NOT EXISTS offline_pack (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  manifest_json TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  content_hash TEXT
);

CREATE TABLE IF NOT EXISTS favorite (
  entity_type TEXT NOT NULL CHECK(entity_type IN ('vehicle','assembly','diagram','part')),
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(entity_type, entity_id)
);

-- Optional FTS5 index. The import process should populate translated names and part numbers.
CREATE VIRTUAL TABLE IF NOT EXISTS catalog_search USING fts5(
  entity_type UNINDEXED,
  entity_id UNINDEXED,
  language UNINDEXED,
  search_text,
  tokenize='unicode61 remove_diacritics 2'
);
