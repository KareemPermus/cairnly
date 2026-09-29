import type { NextApiRequest, NextApiResponse } from 'next';
import { listProjects, createProject, validateInput, ValidationError, STATUSES, PRIORITIES } from '../../../lib/projectsRepo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const status = typeof req.query.status === 'string' && req.query.status ? req.query.status : undefined;
      const priority = typeof req.query.priority === 'string' && req.query.priority ? req.query.priority : undefined;
      if (status && !(STATUSES as readonly string[]).includes(status)) return res.status(400).json({ error: 'Invalid status filter' });
      if (priority && !(PRIORITIES as readonly string[]).includes(priority)) return res.status(400).json({ error: 'Invalid priority filter' });
      return res.status(200).json(await listProjects({ status, priority }));
    }
    if (req.method === 'POST') {
      const input = validateInput(req.body, false);
      return res.status(201).json(await createProject(input));
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    if (/unique/i.test(err?.message || '')) return res.status(409).json({ error: 'A project with this name already exists' });
    console.error('[api/projects]', err?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}