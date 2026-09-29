import React from 'react';
import { Plus } from 'lucide-react';
import styles from './CreateProjectButton.module.css';

export default function CreateProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.btn} onClick={onClick}>
      <Plus size={16} /> New Project
    </button>
  );
}