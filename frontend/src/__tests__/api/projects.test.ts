/** @jest-environment node */
import { mockReqRes } from './testUtils';

jest.mock('../../lib/projectsRepo', () => {
  const actual = jest.requireActual('../../lib/projectsRepo');
  return {
    ...actual,
    listProjects: jest.fn(),
    createProject: jest.fn(),
    getProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };
});

import * as repo from '../../lib/projectsRepo';
import indexHandler from '../../pages/api/projects/index';
import idHandler from '../../pages/api/projects/[id]';

const sample = {
  id: 1, name: 'Website Redesign', description: null, status: 'active', priority: 'high', progress: 65,
  owner: 'Ava', startDate: null, dueDate: null, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('GET /api/projects', () => {
  it('returns list', async () => {
    (repo.listProjects as jest.Mock).mockResolvedValue([sample]);
    const { req, res } = mockReqRes({ method: 'GET', query: { status: 'active' } });
    await indexHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([sample]);
    expect(repo.listProjects).toHaveBeenCalledWith({ status: 'active', priority: undefined });
  });
  it('rejects invalid filter', async () => {
    const { req, res } = mockReqRes({ method: 'GET', query: { status: 'bogus' } });
    await indexHandler(req, res);
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/projects', () => {
  it('creates with defaults', async () => {
    (repo.createProject as jest.Mock).mockResolvedValue(sample);
    const { req, res } = mockReqRes({ method: 'POST', body: { name: 'Website Redesign' } });
    await indexHandler(req, res);
    expect(res.statusCode).toBe(201);
    expect(repo.createProject).toHaveBeenCalledWith({ name: 'Website Redesign', status: 'planning', priority: 'medium', progress: 0 });
  });
  it('rejects missing name', async () => {
    const { req, res } = mockReqRes({ method: 'POST', body: { status: 'active' } });
    await indexHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(repo.createProject).not.toHaveBeenCalled();
  });
});

describe('GET /api/projects/{id}', () => {
  it('returns project', async () => {
    (repo.getProject as jest.Mock).mockResolvedValue(sample);
    const { req, res } = mockReqRes({ method: 'GET', query: { id: '1' } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });
  it('404 when missing', async () => {
    (repo.getProject as jest.Mock).mockResolvedValue(null);
    const { req, res } = mockReqRes({ method: 'GET', query: { id: '99' } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(404);
  });
  it('400 on bad id', async () => {
    const { req, res } = mockReqRes({ method: 'GET', query: { id: 'abc' } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /api/projects/{id}', () => {
  it('updates', async () => {
    (repo.updateProject as jest.Mock).mockResolvedValue({ ...sample, progress: 80 });
    const { req, res } = mockReqRes({ method: 'PUT', query: { id: '1' }, body: { progress: 80 } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(repo.updateProject).toHaveBeenCalledWith(1, { progress: 80 });
  });
  it('rejects out-of-range progress', async () => {
    const { req, res } = mockReqRes({ method: 'PUT', query: { id: '1' }, body: { progress: 150 } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/projects/{id}', () => {
  it('deletes', async () => {
    (repo.deleteProject as jest.Mock).mockResolvedValue(true);
    const { req, res } = mockReqRes({ method: 'DELETE', query: { id: '1' } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, success: true });
  });
  it('404 when missing', async () => {
    (repo.deleteProject as jest.Mock).mockResolvedValue(false);
    const { req, res } = mockReqRes({ method: 'DELETE', query: { id: '5' } });
    await idHandler(req, res);
    expect(res.statusCode).toBe(404);
  });
});