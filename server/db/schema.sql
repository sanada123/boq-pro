-- BOQ Pro Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_date TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'new',
  work_type TEXT,
  work_categories TEXT, -- JSON array
  floors TEXT, -- JSON array
  file_url TEXT,
  file_type TEXT,
  quantities_data TEXT, -- JSON object
  total_estimated_cost REAL DEFAULT 0,
  analysis_notes TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS plan_readings (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  project_id TEXT,
  plan_type TEXT,
  plan_type_category TEXT,
  file_url TEXT,
  scale TEXT,
  title_info TEXT, -- JSON
  elements TEXT, -- JSON array
  legend TEXT, -- JSON object
  sections_cuts TEXT, -- JSON array
  reinforcement_details TEXT, -- JSON array
  tables TEXT, -- JSON array
  text_annotations TEXT, -- JSON array
  unclear_items TEXT, -- JSON array
  user_corrections TEXT, -- JSON array
  confidence_notes TEXT,
  is_verified INTEGER DEFAULT 0,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quantity_items (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  project_id TEXT,
  plan_reading_id TEXT,
  section TEXT,
  sub_section TEXT,
  section_name_he TEXT,
  item_number TEXT,
  description TEXT,
  unit TEXT,
  unit_name_he TEXT,
  quantity REAL DEFAULT 0,
  unit_price REAL DEFAULT 0,
  total_price REAL DEFAULT 0,
  formula_used TEXT,
  source_element TEXT,
  standard_reference TEXT,
  notes TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS engineer_standards (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  section TEXT,
  sub_section TEXT,
  section_name_he TEXT,
  standard_name TEXT,
  standard_reference TEXT,
  description TEXT,
  waste_factor REAL DEFAULT 0,
  custom_notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS price_items (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  item_name_he TEXT,
  item_name_en TEXT,
  section TEXT,
  unit TEXT,
  unit_name_he TEXT,
  price REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS calculation_formulas (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  element_type TEXT,
  element_name_he TEXT,
  formula_name TEXT,
  formula TEXT,
  formula_description_he TEXT,
  description TEXT,
  default_values TEXT,
  waste_factor REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS engineer_profiles (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  designer_name TEXT,
  company_name TEXT,
  preferred_concrete_grade TEXT,
  preferred_steel_grade TEXT,
  typical_slab_thickness REAL,
  common_patterns TEXT, -- JSON array
  correction_history TEXT, -- JSON array
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
