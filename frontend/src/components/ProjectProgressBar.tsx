import styles from './ProjectDetail.module.css';

export default function ProjectProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  return (
    <div>
      <div className={styles.progressLabel}><span>Progress</span><span>{pct}%</span></div>
      <div className={styles.track} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}