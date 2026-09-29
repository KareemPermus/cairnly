import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/dashboard';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href, ...rest }: any) => <span data-href={href} {...rest}>{children}</span> }));

const mockGet = (apiClient as any).get as jest.Mock;

const stats = {
  activeProjects: 2,
  averageProgress: 47.5,
  completedProjects: 1,
  onHoldProjects: 1,
  overdueProjects: 1,
  planningProjects: 3,
  recentProjects: [{ id: 1, name: 'Website Redesign', progress: 60, status: 'active', updatedAt: '2024-05-01T00:00:00Z' }],
  totalProjects: 7,
  upcomingDeadlines: [{ dueDate: '2024-06-01T00:00:00Z', id: 2, name: 'Mobile App', priority: 'high', status: 'planning' }],
};

describe('Dashboard page', () => {
  beforeEach(() => mockGet.mockReset());

  it('renders stats from /api/dashboard/stats', async () => {
    mockGet.mockResolvedValueOnce({ data: stats });
    render(<Dashboard />);
    expect(await screen.findByText('Website Redesign')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/api/dashboard/stats');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('48%')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();
  });

  it('shows error and retries on click', async () => {
    mockGet.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce({ data: stats });
    render(<Dashboard />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load');
    fireEvent.click(screen.getByText('Retry'));
    await waitFor(() => expect(screen.getByText('Website Redesign')).toBeInTheDocument());
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});