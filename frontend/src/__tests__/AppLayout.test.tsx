import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppLayout from '../components/layout/AppLayout';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/projects' }) }));

describe('AppLayout', () => {
  it('renders brand, nav links and children', () => {
    render(<AppLayout><p>Hello content</p></AppLayout>);
    expect(screen.getByText('Hello content')).toBeInTheDocument();
    expect(screen.getAllByText('Cairnly').length).toBeGreaterThan(0);
    const projects = screen.getAllByRole('link', { name: /Projects/ })[0];
    expect(projects).toHaveAttribute('href', '/projects');
    expect(projects.className).toContain('text-primary');
  });

  it('opens and closes the mobile drawer', () => {
    render(<AppLayout><p>x</p></AppLayout>);
    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByTestId('backdrop')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close menu'));
    expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
  });
});