import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './migrations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'boqpro.db');
const schemaPath = join(__dirname, 'schema.sql');

/**
 * Wrapper around sql.js to provide a better-sqlite3 compatible API.
 * All route code can use: db.prepare(sql).get(...), .all(...), .run(...)
 */
class Database {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  exec(sql) {
    this._db.run(sql);
    this._save();
  }

  pragma(pragmaStr) {
    try {
      this._db.run(`PRAGMA ${pragmaStr}`);
    } catch {
      // Some pragmas may not be supported in sql.js
    }
  }

  prepare(sql) {
    const db = this._db;
    const save = () => this._save();

    return {
      get(...params) {
        const stmt = db.prepare(sql);
        if (params.length) stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const values = stmt.get();
          stmt.free();
          const row = {};
          cols.forEach((col, i) => { row[col] = values[i]; });
          return row;
        }
        stmt.free();
        return undefined;
      },

      all(...params) {
        const stmt = db.prepare(sql);
        if (params.length) stmt.bind(params);
        const rows = [];
        const cols = stmt.getColumnNames();
        while (stmt.step()) {
          const values = stmt.get();
          const row = {};
          cols.forEach((col, i) => { row[col] = values[i]; });
          rows.push(row);
        }
        stmt.free();
        return rows;
      },

      run(...params) {
        db.run(sql, params);
        save();
        const changes = db.getRowsModified();
        return { changes };
      }
    };
  }

  transaction(fn) {
    return (...args) => {
      this._db.run('BEGIN TRANSACTION');
      try {
        fn(...args);
        this._db.run('COMMIT');
        this._save();
      } catch (err) {
        this._db.run('ROLLBACK');
        throw err;
      }
    };
  }

  _save() {
    const data = this._db.export();
    writeFileSync(dbPath, Buffer.from(data));
  }
}

// Initialize
const SQL = await initSqlJs();

let sqlDb;
if (existsSync(dbPath)) {
  const fileBuffer = readFileSync(dbPath);
  sqlDb = new SQL.Database(fileBuffer);
} else {
  sqlDb = new SQL.Database();
}

const db = new Database(sqlDb);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = readFileSync(schemaPath, 'utf-8');
// sql.js exec only runs one statement at a time; split and run each
for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
  db.exec(stmt + ';');
}

// Run migrations (adds missing columns to existing databases)
runMigrations(db);

export default db;
