import type { Project } from '@/types';
import styles from './ProjectDetail.module.css';

const fmt = (d?: string | null) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
};

export default function ProjectInfoPanel({ project }: { project: Project }) {
  const row = (label: string, value: string | null | undefined, full = false) => (
    <div className={`${styles.item} ${full ? styles.full : ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${value ? '' : styles.muted}`}>{value || '—'}</span>
    </div>
  );
  return (
    <section className={styles.panel}>
      {row('Description', project.description, true)}
      {row('Owner', project.owner)}
      {row('Status', project.status.replace('_', ' '))}
      {row('Start date', fmt(project.startDate))}
      {row('Due date', fmt(project.dueDate))}
      {row('Created', fmt(project.createdAt))}
      {row('Updated', fmt(project.updatedAt))}
    </section>
  );
}