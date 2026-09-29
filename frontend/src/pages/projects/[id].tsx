import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '@/api/client';
import type { Project } from '@/types';
import ProjectHeader from '@/components/ProjectHeader';
import ProjectProgressBar from '@/components/ProjectProgressBar';
import ProjectInfoPanel from '@/components/ProjectInfoPanel';
import EditProjectForm from '@/components/EditProjectForm';
import DeleteProjectButton from '@/components/DeleteProjectButton';
import styles from './ProjectDetail.module.css';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!id || Array.isArray(id)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/projects/${id}`);
      setProject(res?.data ?? null);
    } catch (e: any) {
      setError(e?.response?.status === 404 ? 'Project not found.' : 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady) load();
  }, [router.isReady, load]);

  const handleSave = async (payload: Partial<Project>) => {
    if (!project) return;
    const res = await apiClient.put(`/api/projects/${project.id}`, payload);
    setProject(res.data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!project) return;
    await apiClient.delete(`/api/projects/${project.id}`);
    router.push('/projects');
  };

  if (loading) return <div className={styles.state}>Loading project…</div>;
  if (error || !project)
    return (
      <div className={styles.state}>
        <p className={styles.error}>{error || 'Project not found.'}</p>
        <Link href="/projects" className={styles.back}>← Back to projects</Link>
      </div>
    );

  return (
    <div className={styles.page}>
      <Link href="/projects" className={styles.back}>← Back to projects</Link>
      <ProjectHeader
        project={project}
        onEdit={() => setEditing((v) => !v)}
        editing={editing}
        actions={<DeleteProjectButton onDelete={handleDelete} />}
      />
      <div className={styles.card}>
        <ProjectProgressBar progress={project.progress} />
      </div>
      {editing ? (
        <div className={styles.card}>
          <EditProjectForm project={project} onSave={handleSave} onCancel={() => setEditing(false)} />
        </div>
      ) : (
        <ProjectInfoPanel project={project} />
      )}
    </div>
  );
}