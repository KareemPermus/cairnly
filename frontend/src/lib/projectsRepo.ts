import { getDb, isSupabase } from './db';

export const STATUSES = ['planning', 'active', 'on_hold', 'completed'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;

export interface ProjectRow {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  owner: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Partial<Omit<ProjectRow, 'id' | 'createdAt' | 'updatedAt'>>;

const COLUMNS = ['name', 'description', 'status', 'priority', 'progress', 'owner', 'startDate', 'dueDate'] as const;

function toIso(v: any): string | null {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function normalize(r: any): ProjectRow {
  return {
    id: Number(r.id),
    name: String(r.name),
    description: r.description ?? null,
    status: r.status ?? 'planning',
    priority: r.priority ?? 'medium',
    progress: Number(r.progress ?? 0),
    owner: r.owner ?? null,
    startDate: toIso(r.startDate),
    dueDate: toIso(r.dueDate),
    createdAt: toIso(r.createdAt) || new Date().toISOString(),
    updatedAt: toIso(r.updatedAt) || new Date().toISOString(),
  };
}

export class ValidationError extends Error {}

export function validateInput(body: any, partial: boolean): ProjectInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('Request body must be a JSON object');
  const out: ProjectInput = {};
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) throw new ValidationError('name is required');
    if (body.name.length > 255) throw new ValidationError('name must be at most 255 characters');
    out.name = body.name.trim();
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') throw new ValidationError('description must be a string');
    out.description = body.description;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw new ValidationError(`status must be one of ${STATUSES.join(', ')}`);
    out.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) throw new ValidationError(`priority must be one of ${PRIORITIES.join(', ')}`);
    out.priority = body.priority;
  }
  if (body.progress !== undefined) {
    const p = parseInt(String(body.progress), 10);
    if (isNaN(p) || p < 0 || p > 100) throw new ValidationError('progress must be an integer between 0 and 100');
    out.progress = p;
  }
  if (body.owner !== undefined) {
    if (body.owner !== null && typeof body.owner !== 'string') throw new ValidationError('owner must be a string');
    if (typeof body.owner === 'string' && body.owner.length > 120) throw new ValidationError('owner must be at most 120 characters');
    out.owner = body.owner;
  }
  for (const f of ['startDate', 'dueDate'] as const) {
    if (body[f] !== undefined) {
      if (body[f] === null || body[f] === '') { out[f] = null; continue; }
      const iso = toIso(body[f]);
      if (!iso) throw new ValidationError(`${f} must be a valid datetime`);
      out[f] = iso;
    }
  }
  if (!partial) {
    out.status = out.status ?? 'planning';
    out.priority = out.priority ?? 'medium';
    out.progress = out.progress ?? 0;
  }
  return out;
}

export async function listProjects(filters: { status?: string; priority?: string } = {}): Promise<ProjectRow[]> {
  const db = getDb();
  if (isSupabase()) {
    let q = db.from('projects').select('*').order('updatedAt', { ascending: false });
    if (filters.status) q = q.eq('status', filters.status);
    if (filters.priority) q = q.eq('priority', filters.priority);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data || []).map(normalize);
  }
  const where: string[] = [];
  const params: any[] = [];
  if (filters.status) { where.push('status = ?'); params.push(filters.status); }
  if (filters.priority) { where.push('priority = ?'); params.push(filters.priority); }
  const sql = `SELECT * FROM projects ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updatedAt DESC`;
  return db.prepare(sql).all(...params).map(normalize);
}

export async function getProject(id: number): Promise<ProjectRow | null> {
  const db = getDb();
  if (isSupabase()) {
    const { data, error } = await db.from('projects').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? normalize(data) : null;
  }
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return row ? normalize(row) : null;
}

export async function createProject(input: ProjectInput): Promise<ProjectRow> {
  const db = getDb();
  const now = new Date().toISOString();
  const record: any = { createdAt: now, updatedAt: now };
  for (const c of COLUMNS) if (input[c] !== undefined) record[c] = input[c];
  if (isSupabase()) {
    const { data, error } = await db.from('projects').insert(record).select('*').single();
    if (error) throw new Error(error.message);
    return normalize(data);
  }
  const keys = Object.keys(record);
  const info = db
    .prepare(`INSERT INTO projects (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`)
    .run(...keys.map((k) => record[k]));
  return normalize(db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid));
}

export async function updateProject(id: number, input: ProjectInput): Promise<ProjectRow | null> {
  const db = getDb();
  const patch: any = { updatedAt: new Date().toISOString() };
  for (const c of COLUMNS) if (input[c] !== undefined) patch[c] = input[c];
  if (isSupabase()) {
    const { data, error } = await db.from('projects').update(patch).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return data ? normalize(data) : null;
  }
  const keys = Object.keys(patch);
  const info = db
    .prepare(`UPDATE projects SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
    .run(...keys.map((k) => patch[k]), id);
  if (info.changes === 0) return null;
  return normalize(db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
}

export async function deleteProject(id: number): Promise<boolean> {
  const db = getDb();
  if (isSupabase()) {
    const { data, error } = await db.from('projects').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    return Array.isArray(data) && data.length > 0;
  }
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
}

export function computeStats(projects: ProjectRow[], now: Date = new Date()) {
  const count = (s: string) => projects.filter((p) => p.status === s).length;
  const total = projects.length;
  const avg = total ? Math.round((projects.reduce((a, p) => a + p.progress, 0) / total) * 10) / 10 : 0;
  const overdue = projects.filter((p) => p.dueDate && p.status !== 'completed' && new Date(p.dueDate) < now).length;
  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name, progress: p.progress, status: p.status, updatedAt: p.updatedAt }));
  const upcomingDeadlines = projects
    .filter((p) => p.dueDate && p.status !== 'completed' && new Date(p.dueDate) >= now)
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
    .slice(0, 5)
    .map((p) => ({ dueDate: p.dueDate as string, id: p.id, name: p.name, priority: p.priority, status: p.status }));
  return {
    activeProjects: count('active'),
    averageProgress: avg,
    completedProjects: count('completed'),
    onHoldProjects: count('on_hold'),
    overdueProjects: overdue,
    planningProjects: count('planning'),
    recentProjects,
    totalProjects: total,
    upcomingDeadlines,
  };
}

export async function getStats() {
  return computeStats(await listProjects());
}