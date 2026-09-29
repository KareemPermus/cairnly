import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import styles from './ProjectFormModal.module.css';

export interface ProjectFormValues {
  name: string;
  description: string;
  owner: string;
  status: string;
  priority: string;
  progress: number;
  startDate: string;
  dueDate: string;
}

const empty: ProjectFormValues = {
  name: '', description: '', owner: '', status: 'planning', priority: 'medium', progress: 0, startDate: '', dueDate: '',
};

interface Props {
  open: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (v: ProjectFormValues) => void;
}

export default function ProjectFormModal({ open, saving, error, onClose, onSubmit }: Props) {
  const [v, setV] = useState<ProjectFormValues>(empty);
  const [nameErr, setNameErr] = useState('');

  useEffect(() => {
    if (open) { setV(empty); setNameErr(''); }
  }, [open]);

  if (!open) return null;

  const set = (k: keyof ProjectFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: k === 'progress' ? Number(e.target.value) : e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) { setNameErr('Name is required'); return; }
    onSubmit({ ...v, name: v.name.trim() });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-label="Create project" onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>New Project</h2>
          <button type="button" aria-label="Close" className={styles.close} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className={styles.form}>
          <label className={styles.field}>Name
            <input aria-label="Name" value={v.name} onChange={set('name')} maxLength={255} />
            {nameErr && <span className={styles.err}>{nameErr}</span>}
          </label>
          <label className={styles.field}>Description
            <textarea aria-label="Description" rows={3} value={v.description} onChange={set('description')} />
          </label>
          <label className={styles.field}>Owner
            <input aria-label="Owner" value={v.owner} onChange={set('owner')} maxLength={120} />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>Status
              <select aria-label="Status" value={v.status} onChange={set('status')}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className={styles.field}>Priority
              <select aria-label="Priority" value={v.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className={styles.field}>Progress: {v.progress}%
            <input aria-label="Progress" type="range" min={0} max={100} value={v.progress} onChange={set('progress')} />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>Start date
              <input aria-label="Start date" type="date" value={v.startDate} onChange={set('startDate')} />
            </label>
            <label className={styles.field}>Due date
              <input aria-label="Due date" type="date" value={v.dueDate} onChange={set('dueDate')} />
            </label>
          </div>
          {error && <div className={styles.err} role="alert">{error}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primary} disabled={saving}>{saving ? 'Saving…' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}