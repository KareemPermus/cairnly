/** @jest-environment node */
import { mockReqRes } from './testUtils';

jest.mock('../../lib/projectsRepo', () => {
  const actual = jest.requireActual('../../lib/projectsRepo');
  return { ...actual, getStats: jest.fn() };
});

import * as repo from '../../lib/projectsRepo';
import statsHandler from '../../pages/api/dashboard/stats';
import healthHandler from '../../pages/api/health';

const { computeStats } = jest.requireActual('../../lib/projectsRepo');

describe('GET /api/dashboard/stats', () => {
  it('returns stats', async () => {
    const stats = computeStats([]);
    (repo.getStats as jest.Mock).mockResolvedValue(stats);
    const { req, res } = mockReqRes({ method: 'GET' });
    await statsHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.totalProjects).toBe(0);
  });
  it('405 on POST', async () => {
    const { req, res } = mockReqRes({ method: 'POST' });
    await statsHandler(req, res);
    expect(res.statusCode).toBe(405);
  });
  it('500 on repo failure', async () => {
    (repo.getStats as jest.Mock).mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { req, res } = mockReqRes({ method: 'GET' });
    await statsHandler(req, res);
    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });
});

describe('computeStats', () => {
  it('aggregates counts, overdue and deadlines', () => {
    const base = { description: null, owner: null, startDate: null, createdAt: '2025-01-01T00:00:00.000Z' };
    const s = computeStats([
      { ...base, id: 1, name: 'A', status: 'active', priority: 'high', progress: 50, dueDate: '2025-01-01T00:00:00.000Z', updatedAt: '2025-02-01T00:00:00.000Z' },
      { ...base, id: 2, name: 'B', status: 'completed', priority: 'low', progress: 100, dueDate: null, updatedAt: '2025-03-01T00:00:00.000Z' },
      { ...base, id: 3, name: 'C', status: 'planning', priority: 'medium', progress: 0, dueDate: '2030-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    ], new Date('2026-01-01T00:00:00Z'));
    expect(s.totalProjects).toBe(3);
    expect(s.activeProjects).toBe(1);
    expect(s.completedProjects).toBe(1);
    expect(s.planningProjects).toBe(1);
    expect(s.onHoldProjects).toBe(0);
    expect(s.overdueProjects).toBe(1);
    expect(s.averageProgress).toBe(50);
    expect(s.recentProjects[0].id).toBe(2);
    expect(s.upcomingDeadlines).toEqual([{ dueDate: '2030-01-01T00:00:00.000Z', id: 3, name: 'C', priority: 'medium', status: 'planning' }]);
  });
});

describe('GET /api/health', () => {
  it('returns ok', () => {
    const { req, res } = mockReqRes({ method: 'GET' });
    healthHandler(req, res);
    expect(res.body).toEqual({ status: 'ok' });
  });
});