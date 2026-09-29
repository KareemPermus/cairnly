import path from 'path';

let db: any = null;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0,
  owner VARCHAR(120),
  startDate TEXT,
  dueDate TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`;

const SEED_ROWS = [
  ['Website Redesign', 'Refresh the marketing site with the new brand system.', 'active', 'high', 65, 'Ava Chen', '2025-01-06T00:00:00.000Z', '2025-12-15T00:00:00.000Z'],
  ['Mobile App Launch', 'Ship v1 of the iOS and Android apps.', 'planning', 'high', 10, 'Marcus Lee', '2025-03-01T00:00:00.000Z', '2026-02-28T00:00:00.000Z'],
  ['Data Warehouse Migration', 'Move analytics workloads to the new warehouse.', 'on_hold', 'medium', 40, 'Priya Nair', '2025-02-10T00:00:00.000Z', '2025-09-30T00:00:00.000Z'],
  ['Customer Onboarding Flow', 'Streamline signup and first-run experience.', 'completed', 'medium', 100, 'Diego Ruiz', '2024-10-01T00:00:00.000Z', '2025-01-31T00:00:00.000Z'],
  ['Internal Wiki Cleanup', 'Archive stale docs and reorganize the knowledge base.', 'active', 'low', 30, 'Sam Patel', '2025-04-01T00:00:00.000Z', '2026-01-15T00:00:00.000Z'],
];

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  // VMSS preview only — Supabase env vars are absent.
  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(SQLITE_SCHEMA);

  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get();
  if (count.c === 0) {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO projects (name, description, status, priority, progress, owner, startDate, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const row of SEED_ROWS) insert.run(...row);
    });
    tx();
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}