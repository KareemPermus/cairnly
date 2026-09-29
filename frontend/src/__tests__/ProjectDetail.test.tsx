import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectDetail from '@/pages/projects/[id]';
import apiClient from '@/api/client';

const push = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' }, isReady: true, push }),
}));
jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const project = {
  id: 1, name: 'Website Redesign', description: 'Refresh site', status: 'active',
  priority: 'high', progress: 40, owner: 'Ana', startDate: '2024-01-01T00:00:00Z',
  dueDate: '2024-06-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z',
};
const api = apiClient as unknown as { get: jest.Mock; put: jest.Mock; delete: jest.Mock };

beforeEach(() => jest.clearAllMocks());

test('renders project details', async () => {
  api.get.mockResolvedValue({ data: project });
  render(<ProjectDetail />);
  expect(await screen.findByText('Website Redesign')).toBeInTheDocument();
  expect(screen.getByText('40%')).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/api/projects/1');
});

test('shows error on not found', async () => {
  api.get.mockRejectedValue({ response: { status: 404 } });
  render(<ProjectDetail />);
  expect(await screen.findByText('Project not found.')).toBeInTheDocument();
});

test('edits and saves project', async () => {
  api.get.mockResolvedValue({ data: project });
  api.put.mockResolvedValue({ data: { ...project, name: 'New Name' } });
  render(<ProjectDetail />);
  fireEvent.click(await screen.findByText('Edit'));
  fireEvent.change(screen.getByDisplayValue('Website Redesign'), { target: { value: 'New Name' } });
  fireEvent.click(screen.getByText('Save changes'));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/api/projects/1', expect.objectContaining({ name: 'New Name' })));
  expect(await screen.findByText('New Name')).toBeInTheDocument();
});

test('deletes project and redirects', async () => {
  api.get.mockResolvedValue({ data: project });
  api.delete.mockResolvedValue({ data: { id: 1, success: true } });
  render(<ProjectDetail />);
  fireEvent.click(await screen.findByText('Delete'));
  fireEvent.click(screen.getByText('Confirm'));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/projects'));
});