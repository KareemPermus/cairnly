import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/api/client';
import type { Project } from '@/types';
import ProjectFilters from '@/components/ProjectFilters';
import ProjectTable from '@/components/ProjectTable';
import CreateProjectButton from '@/components/CreateProjectButton';
import ProjectFormModal, { ProjectFormValues } from '@/components/ProjectFormModal';
import styles from './projects.module.css';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const res = await apiClient.get('/api/projects', { params });
      setProjects(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [status, priority]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.owner || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  const handleCreate = async (values: ProjectFormValues) => {
    setSaving(true);
    setFormError(null);
    try {
      const body = {
        name: values.name,
        description: values.description || undefined,
        owner: values.owner || undefined,
        status: values.status,
        priority: values.priority,
        progress: Number(values.progress) || 0,
        startDate: values.startDate || undefined,
        dueDate: values.dueDate || undefined,
      };
      const res = await apiClient.post('/api/projects', body);
      if (res?.data) setProjects((prev) => [res.data as Project, ...prev]);
      setModalOpen(false);
    } catch {
      setFormError('Could not create project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>Track status, priority and progress across all projects.</p>
        </div>
        <CreateProjectButton onClick={() => setModalOpen(true)} />
      </div>

      <div className={styles.card}>
        <ProjectFilters
          search={search}
          status={status}
          priority={priority}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
        />
        {loading ? (
          <div className={styles.state}>Loading projects…</div>
        ) : error ? (
          <div className={styles.error} role="alert">
            {error}{' '}
            <button className={styles.retry} onClick={load}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.state}>No projects found.</div>
        ) : (
          <ProjectTable projects={filtered} />
        )}
      </div>

      <ProjectFormModal
        open={modalOpen}
        saving={saving}
        error={formError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}