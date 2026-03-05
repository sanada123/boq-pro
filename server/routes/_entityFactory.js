import { Router } from 'express';
import { randomUUID } from 'crypto';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

/**
 * Creates a standard CRUD router for any entity table.
 *
 * @param {string} table - SQLite table name
 * @param {object} opts
 * @param {string[]} opts.jsonFields - Fields stored as JSON TEXT in SQLite
 * @param {string} opts.ownerField - Column used for user scoping (default: 'created_by')
 * @param {boolean} opts.projectScoped - If true, also filter by project_id
 */
export default function createEntityRouter(table, opts = {}) {
  const {
    jsonFields = [],
    ownerField = 'created_by',
    projectScoped = false
  } = opts;

  const router = Router();
  router.use(authenticateToken);

  // Helper: parse JSON fields from DB row
  function parseRow(row) {
    if (!row) return row;
    const parsed = { ...row };
    for (const field of jsonFields) {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try { parsed[field] = JSON.parse(parsed[field]); } catch { /* keep as string */ }
      }
    }
    return parsed;
  }

  // Helper: stringify JSON fields for DB insert/update
  function stringifyFields(data) {
    const result = { ...data };
    for (const field of jsonFields) {
      if (result[field] !== undefined && typeof result[field] !== 'string') {
        result[field] = JSON.stringify(result[field]);
      }
    }
    return result;
  }

  // GET / — list with optional filtering and sorting
  router.get('/', (req, res) => {
    try {
      let where = `WHERE ${ownerField} = ?`;
      const params = [req.user.id];

      // Support query params as filters
      const skipParams = new Set(['sort', 'limit', 'offset', ownerField]);
      for (const [key, value] of Object.entries(req.query)) {
        if (skipParams.has(key)) continue;
        where += ` AND ${key} = ?`;
        params.push(value);
      }

      // Sort
      let orderBy = 'ORDER BY created_date DESC';
      if (req.query.sort) {
        const sortField = req.query.sort.startsWith('-')
          ? req.query.sort.slice(1)
          : req.query.sort;
        const dir = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
        orderBy = `ORDER BY ${sortField} ${dir}`;
      }

      // Limit/offset
      let limitClause = '';
      if (req.query.limit) {
        limitClause = `LIMIT ${parseInt(req.query.limit)}`;
        if (req.query.offset) {
          limitClause += ` OFFSET ${parseInt(req.query.offset)}`;
        }
      }

      const rows = db.prepare(
        `SELECT * FROM ${table} ${where} ${orderBy} ${limitClause}`
      ).all(...params);

      res.json(rows.map(parseRow));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /:id — single row
  router.get('/:id', (req, res) => {
    try {
      const row = db.prepare(
        `SELECT * FROM ${table} WHERE id = ? AND ${ownerField} = ?`
      ).get(req.params.id, req.user.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(parseRow(row));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST / — create
  router.post('/', (req, res) => {
    try {
      const id = randomUUID();
      const data = stringifyFields({ ...req.body, id, [ownerField]: req.user.id });

      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(c => data[c]);

      db.prepare(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
      ).run(...values);

      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      res.status(201).json(parseRow(row));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /bulk — bulk create
  router.post('/bulk', (req, res) => {
    try {
      const items = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected an array' });
      }

      const results = [];
      const insertMany = db.transaction((items) => {
        for (const item of items) {
          const id = randomUUID();
          const data = stringifyFields({ ...item, id, [ownerField]: req.user.id });
          const columns = Object.keys(data);
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(c => data[c]);

          db.prepare(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
          ).run(...values);

          const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
          results.push(parseRow(row));
        }
      });

      insertMany(items);
      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /:id — partial update
  router.patch('/:id', (req, res) => {
    try {
      // Verify ownership
      const existing = db.prepare(
        `SELECT id FROM ${table} WHERE id = ? AND ${ownerField} = ?`
      ).get(req.params.id, req.user.id);
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const data = stringifyFields(req.body);
      // Remove id and created_by from update
      delete data.id;
      delete data[ownerField];
      delete data.created_date;

      if (Object.keys(data).length === 0) {
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
        return res.json(parseRow(row));
      }

      const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const values = Object.values(data);

      db.prepare(
        `UPDATE ${table} SET ${sets} WHERE id = ?`
      ).run(...values, req.params.id);

      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      res.json(parseRow(row));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /:id
  router.delete('/:id', (req, res) => {
    try {
      const result = db.prepare(
        `DELETE FROM ${table} WHERE id = ? AND ${ownerField} = ?`
      ).run(req.params.id, req.user.id);

      if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
