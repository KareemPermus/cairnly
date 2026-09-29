export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high';

export const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed'];
export const PROJECT_PRIORITIES: ProjectPriority[] = ['low', 'medium', 'high'];

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  owner?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  status?: string;
  priority?: string;
  progress?: number;
  owner?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  progress?: number;
  owner?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface DeleteResult {
  id: number;
  success: boolean;
}

export interface RecentProject {
  id: number;
  name: string;
  progress: number;
  status: string;
  updatedAt: string;
}

export interface UpcomingDeadline {
  id: number;
  name: string;
  dueDate: string;
  priority: string;
  status: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  planningProjects: number;
  overdueProjects: number;
  averageProgress: number;
  recentProjects: RecentProject[];
  upcomingDeadlines: UpcomingDeadline[];
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
}