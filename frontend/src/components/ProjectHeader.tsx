import type { ReactNode } from 'react';
import type { Project } from '@/types';
import styles from './ProjectDetail.module.css';

interface Props { project: Project; onEdit: () => void; editing: boolean; actions?: ReactNode }

export default function ProjectHeader({ project, onEdit, editing, actions }: Props) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{project.name}</h1>
        <div className={styles.badges}>
          <span className={styles.badge}>{project.status.replace('_', ' ')}</span>
          <span className={`${styles.badge} ${project.priority === 'high' ? styles.priorityHigh : ''}`}>
            {project.priority} priority
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onEdit}>{editing ? 'Close editor' : 'Edit'}</button>
        {actions}
      </div>
    </header>
  );
}