import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Projects from '@/pages/projects';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const push = jest.fn();
jest.mock('next/router', () => ({ useRouter: () => ({ push }) }));

const mocked = apiClient as unknown as { get: jest.Mock; post: jest.Mock };

const sample = {
  id: 1, name: 'Website Redesign', description: 'Refresh', status: 'active', priority: 'high',
  progress: 40, owner: 'Ava', startDate: '2024-01-01T00:00:00Z', dueDate: '2024-06-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z',
};

beforeEach(() => { jest.clearAllMocks(); });

test('renders projects from API', async () => {
  mocked.get.mockResolvedValue({ data: [sample] });
  render(<Projects />);
  expect(await screen.findByText('Website Redesign')).toBeInTheDocument();
  expect(screen.getByText('40%')).toBeInTheDocument();
});

test('shows error state on failure', async () => {
  mocked.get.mockRejectedValue(new Error('x'));
  render(<Projects />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load projects.');
});

test('search filters and row click navigates', async () => {
  mocked.get.mockResolvedValue({ data: [sample, { ...sample, id: 2, name: 'Mobile App' }] });
  render(<Projects />);
  await screen.findByText('Mobile App');
  fireEvent.change(screen.getByLabelText('Search projects'), { target: { value: 'mobile' } });
  expect(screen.queryByText('Website Redesign')).not.toBeInTheDocument();
  fireEvent.click(screen.getByTestId('project-row-2'));
  expect(push).toHaveBeenCalledWith('/projects/2');
});

test('creates a project via modal', async () => {
  mocked.get.mockResolvedValue({ data: [] });
  mocked.post.mockResolvedValue({ data: { ...sample, id: 3, name: 'New One' } });
  render(<Projects />);
  await screen.findByText('No projects found.');
  fireEvent.click(screen.getByText('New Project', { selector: 'button' }));
  fireEvent.click(screen.getByText('Create Project'));
  expect(await screen.findByText('Name is required')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New One' } });
  fireEvent.click(screen.getByText('Create Project'));
  await waitFor(() => expect(mocked.post).toHaveBeenCalledWith('/api/projects', expect.objectContaining({ name: 'New One' })));
  expect(await screen.findByText('New One')).toBeInTheDocument();
});