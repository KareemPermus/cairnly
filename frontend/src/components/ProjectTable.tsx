import React from 'react';
import { useRouter } from 'next/router';
import type { Project } from '@/types';
import styles from './ProjectTable.module.css';

const statusLabel: Record<string, string> = { planning: 'Planning', active: 'Active', on_hold: 'On hold', completed: 'Completed' };

function fmt(d?: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString();
}

export default function ProjectTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Project</th><th>Status</th><th>Priority</th><th>Progress</th><th>Due</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className={styles.row} onClick={() => router.push(`/projects/${p.id}`)} data-testid={`project-row-${p.id}`}>
              <td>
                <div className={styles.nameCell}>
                  <div className={styles.avatar}>{(p.name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.muted}>{p.owner || 'Unassigned'}</div>
                  </div>
                </div>
              </td>
              <td><span className={`${styles.badge} ${styles[`s_${p.status}`] || ''}`}>{statusLabel[p.status] || p.status}</span></td>
              <td><span className={`${styles.badge} ${styles[`p_${p.priority}`] || ''}`}>{p.priority}</span></td>
              <td>
                <div className={styles.progress}>
                  <div className={styles.bar}><div className={styles.fill} style={{ width: `${Math.min(100, Math.max(0, p.progress || 0))}%` }} /></div>
                  <span className={styles.pct}>{p.progress ?? 0}%</span>
                </div>
              </td>
              <td className={styles.muted}>{fmt(p.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}