import apiClient, { apiClient as named, projectsApi, dashboardApi, getErrorMessage } from '../api/client';

describe('api client', () => {
  afterEach(() => jest.restoreAllMocks());

  it('exports same instance as default and named with empty baseURL', () => {
    expect(apiClient).toBe(named);
    expect(apiClient.defaults.baseURL).toBe('');
  });

  it('lists projects with filters', async () => {
    const project = { id: 1, name: 'Site', description: null, status: 'active', priority: 'high', progress: 40, owner: 'Ana', startDate: null, dueDate: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' };
    const spy = jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [project] } as any);
    const out = await projectsApi.list({ status: 'active' });
    expect(spy).toHaveBeenCalledWith('/api/projects', { params: { status: 'active' } });
    expect(out[0].name).toBe('Site');
  });

  it('returns empty array for non-array response', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: null } as any);
    expect(await projectsApi.list()).toEqual([]);
  });

  it('fetches dashboard stats and deletes', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: { totalProjects: 3, activeProjects: 1, completedProjects: 1, onHoldProjects: 0, planningProjects: 1, overdueProjects: 0, averageProgress: 50, recentProjects: [], upcomingDeadlines: [] } } as any);
    expect((await dashboardApi.stats()).totalProjects).toBe(3);
    jest.spyOn(apiClient, 'delete').mockResolvedValue({ data: { id: 1, success: true } } as any);
    expect(await projectsApi.remove(1)).toEqual({ id: 1, success: true });
  });

  it('getErrorMessage handles plain errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage('x')).toBe('Something went wrong');
  });
});