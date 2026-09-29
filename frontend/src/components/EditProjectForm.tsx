import { FormEvent, useState } from 'react';
import type { Project } from '@/types';
import styles from './ProjectDetail.module.css';

interface Props { project: Project; onSave: (p: Partial<Project>) => Promise<void>; onCancel: () => void }

const toDateInput = (d?: string | null) => (d ? String(d).slice(0, 10) : '');

export default function EditProjectForm({ project, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    priority: project.priority,
    progress: String(project.progress ?? 0),
    owner: project.owner ?? '',
    startDate: toDateInput(project.startDate),
    dueDate: toDateInput(project.dueDate),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    const progress = parseInt(form.progress, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) { setError('Progress must be 0–100.'); return; }
    setSaving(true); setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        progress,
        owner: form.owner || null,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
      } as Partial<Project>);
    } catch {
      setError('Failed to save changes.');
    } finally { setSaving(false); }
  };

  return (
    <form className={styles.form} onSubmit={submit} aria-label="Edit project">
      <label className={`${styles.field} ${styles.full}`}>Name<input value={form.name} onChange={set('name')} maxLength={255} /></label>
      <label className={`${styles.field} ${styles.full}`}>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
      <label className={styles.field}>Status
        <select value={form.status} onChange={set('status')}>
          <option value="planning">Planning</option><option value="active">Active</option>
          <option value="on_hold">On hold</option><option value="completed">Completed</option>
        </select>
      </label>
      <label className={styles.field}>Priority
        <select value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </label>
      <label className={styles.field}>Progress (%)<input type="number" min={0} max={100} value={form.progress} onChange={set('progress')} /></label>
      <label className={styles.field}>Owner<input value={form.owner} onChange={set('owner')} maxLength={120} /></label>
      <label className={styles.field}>Start date<input type="date" value={form.startDate} onChange={set('startDate')} /></label>
      <label className={styles.field}>Due date<input type="date" value={form.dueDate} onChange={set('dueDate')} /></label>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <div className={styles.formActions}>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  );
}