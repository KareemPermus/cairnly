import axios from 'axios';
import type {
  CreateProjectDto,
  DashboardStats,
  DeleteResult,
  Project,
  ProjectFilters,
  UpdateProjectDto,
} from '../types';

// Same-origin: all calls use the /api prefix and are served by Next.js API routes.
export const apiClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

export const projectsApi = {
  list: async (filters: ProjectFilters = {}): Promise<Project[]> => {
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    const res = await apiClient.get<Project[]>('/api/projects', { params });
    return Array.isArray(res.data) ? res.data : [];
  },
  get: async (id: number | string): Promise<Project> =>
    (await apiClient.get<Project>(`/api/projects/${id}`)).data,
  create: async (body: CreateProjectDto): Promise<Project> =>
    (await apiClient.post<Project>('/api/projects', body)).data,
  update: async (id: number | string, body: UpdateProjectDto): Promise<Project> =>
    (await apiClient.put<Project>(`/api/projects/${id}`, body)).data,
  remove: async (id: number | string): Promise<DeleteResult> =>
    (await apiClient.delete<DeleteResult>(`/api/projects/${id}`)).data,
};

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> =>
    (await apiClient.get<DashboardStats>('/api/dashboard/stats')).data,
};

export default apiClient;