/**
 * Database migrations for BOQ Pro.
 * Adds columns that may be missing from older database versions.
 * Each migration is idempotent — safe to run multiple times.
 */

const MIGRATIONS = [
  // Projects table
  { table: 'projects', column: 'description', type: 'TEXT' },
  { table: 'projects', column: 'file_url', type: 'TEXT' },
  { table: 'projects', column: 'file_type', type: 'TEXT' },
  { table: 'projects', column: 'analysis_notes', type: 'TEXT' },

  // Plan readings
  { table: 'plan_readings', column: 'scale', type: 'TEXT' },
  { table: 'plan_readings', column: 'confidence_notes', type: 'TEXT' },
  { table: 'plan_readings', column: 'is_verified', type: 'INTEGER DEFAULT 0' },

  // Quantity items
  { table: 'quantity_items', column: 'section_name_he', type: 'TEXT' },
  { table: 'quantity_items', column: 'item_number', type: 'TEXT' },
  { table: 'quantity_items', column: 'unit_name_he', type: 'TEXT' },
  { table: 'quantity_items', column: 'standard_reference', type: 'TEXT' },

  // Engineer standards
  { table: 'engineer_standards', column: 'section_name_he', type: 'TEXT' },
  { table: 'engineer_standards', column: 'custom_notes', type: 'TEXT' },

  // Price items
  { table: 'price_items', column: 'unit_name_he', type: 'TEXT' },

  // Calculation formulas
  { table: 'calculation_formulas', column: 'element_name_he', type: 'TEXT' },
  { table: 'calculation_formulas', column: 'formula_description_he', type: 'TEXT' },
  { table: 'calculation_formulas', column: 'default_values', type: 'TEXT' },
  { table: 'calculation_formulas', column: 'waste_factor', type: 'REAL DEFAULT 0' },

  // Engineer profiles
  { table: 'engineer_profiles', column: 'preferred_concrete_grade', type: 'TEXT' },
  { table: 'engineer_profiles', column: 'preferred_steel_grade', type: 'TEXT' },
  { table: 'engineer_profiles', column: 'typical_slab_thickness', type: 'REAL' },
];

/**
 * Run all migrations against the database.
 * Uses PRAGMA table_info to check if columns exist before adding them.
 */
export function runMigrations(db) {
  let applied = 0;

  for (const { table, column, type } of MIGRATIONS) {
    try {
      // Check if column exists
      const cols = db.prepare(`PRAGMA table_info(${table})`).all();
      const exists = cols.some(c => c.name === column);

      if (!exists) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        applied++;
        console.log(`  [migration] Added ${table}.${column}`);
      }
    } catch (err) {
      // Column might already exist or table doesn't exist yet — both are fine
      console.log(`  [migration] Skipped ${table}.${column}: ${err.message}`);
    }
  }

  if (applied > 0) {
    console.log(`  [migration] Applied ${applied} column additions`);
  }
}
