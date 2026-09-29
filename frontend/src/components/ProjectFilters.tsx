import React from 'react';
import { Search } from 'lucide-react';
import styles from './ProjectFilters.module.css';

interface Props {
  search: string;
  status: string;
  priority: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
}

export default function ProjectFilters(p: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.icon} />
        <input
          className={styles.search}
          placeholder="Search projects…"
          aria-label="Search projects"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.selects}>
        <select aria-label="Filter by status" className={styles.select} value={p.status} onChange={(e) => p.onStatusChange(e.target.value)}>
          <option value="">All statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On hold</option>
          <option value="completed">Completed</option>
        </select>
        <select aria-label="Filter by priority" className={styles.select} value={p.priority} onChange={(e) => p.onPriorityChange(e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
}