import type { NextApiRequest, NextApiResponse } from 'next';
import { getProject, updateProject, deleteProject, validateInput, ValidationError } from '../../../lib/projectsRepo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid project id' });
  try {
    if (req.method === 'GET') {
      const p = await getProject(id);
      return p ? res.status(200).json(p) : res.status(404).json({ error: 'Project not found' });
    }
    if (req.method === 'PUT') {
      const input = validateInput(req.body, true);
      const p = await updateProject(id, input);
      return p ? res.status(200).json(p) : res.status(404).json({ error: 'Project not found' });
    }
    if (req.method === 'DELETE') {
      const ok = await deleteProject(id);
      return ok ? res.status(200).json({ id, success: true }) : res.status(404).json({ error: 'Project not found' });
    }
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    if (/unique/i.test(err?.message || '')) return res.status(409).json({ error: 'A project with this name already exists' });
    console.error('[api/projects/[id]]', err?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}