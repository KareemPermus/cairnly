import type { NextApiRequest, NextApiResponse } from 'next';
import { getStats } from '../../../lib/projectsRepo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    return res.status(200).json(await getStats());
  } catch (err: any) {
    console.error('[api/dashboard/stats]', err?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}