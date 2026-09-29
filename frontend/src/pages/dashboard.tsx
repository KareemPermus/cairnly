import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Activity, CheckCircle2, PauseCircle, AlertTriangle, ClipboardList, Gauge, CalendarClock, RefreshCw } from 'lucide-react';
import apiClient from '@/api/client';
import styles from '@/components/DashboardPage.module.css';

type RecentProject = { id: number; name: string; progress: number; status: string; updatedAt: string };
type UpcomingDeadline = { dueDate: string; id: number; name: string; priority: string; status: string };
type DashboardStats = {
  activeProjects: number;
  averageProgress: number;
  completedProjects: number;
  onHoldProjects: number;
  overdueProjects: number;
  planningProjects: number;
  recentProjects: RecentProject[];
  totalProjects: number;
  upcomingDeadlines: UpcomingDeadline[];
};

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
};

function fmtDate(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/dashboard/stats');
      setStats(res?.data ?? null);
    } catch {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = stats
    ? [
        { label: 'Total Projects', value: stats.totalProjects ?? 0, icon: FolderKanban, color: '#3B82F6' },
        { label: 'Active', value: stats.activeProjects ?? 0, icon: Activity, color: '#10B981' },
        { label: 'Planning', value: stats.planningProjects ?? 0, icon: ClipboardList, color: '#8B5CF6' },
        { label: 'On Hold', value: stats.onHoldProjects ?? 0, icon: PauseCircle, color: '#F59E0B' },
        { label: 'Completed', value: stats.completedProjects ?? 0, icon: CheckCircle2, color: '#14B8A6' },
        { label: 'Overdue', value: stats.overdueProjects ?? 0, icon: AlertTriangle, color: '#EF4444' },
        { label: 'Avg. Progress', value: `${Math.round(Number(stats.averageProgress) || 0)}%`, icon: Gauge, color: '#F97316' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Your project portfolio at a glance</p>
        </div>
        <button className={styles.refresh} onClick={load} aria-label="Refresh">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading && <div className={styles.state}>Loading dashboard…</div>}
      {!loading && error && (
        <div className={styles.error} role="alert">
          {error}
          <button className={styles.retry} onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className={styles.grid}>
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={styles.card} style={{ borderLeftColor: c.color }}>
                  <div>
                    <div className={styles.cardLabel}>{c.label}</div>
                    <div className={styles.cardValue}>{c.value}</div>
                  </div>
                  <div className={styles.iconWrap} style={{ background: `${c.color}1A`, color: c.color }}>
                    <Icon size={20} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.panels}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}><Activity size={16} /> Recently Updated</h2>
              {(stats.recentProjects ?? []).length === 0 ? (
                <p className={styles.empty}>No projects yet.</p>
              ) : (
                <ul className={styles.list}>
                  {(stats.recentProjects ?? []).map((p) => (
                    <li key={p.id} className={styles.item}>
                      <div className={styles.itemTop}>
                        <Link href={`/projects/${p.id}`} className={styles.itemName}>{p.name}</Link>
                        <span className={`${styles.badge} ${styles[`s_${p.status}`] || ''}`}>{STATUS_LABEL[p.status] || p.status}</span>
                      </div>
                      <div className={styles.bar}>
                        <div className={styles.barFill} style={{ width: `${Math.min(100, Math.max(0, p.progress || 0))}%` }} />
                      </div>
                      <div className={styles.meta}>{p.progress ?? 0}% · Updated {fmtDate(p.updatedAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}><CalendarClock size={16} /> Upcoming Deadlines</h2>
              {(stats.upcomingDeadlines ?? []).length === 0 ? (
                <p className={styles.empty}>No upcoming deadlines.</p>
              ) : (
                <ul className={styles.list}>
                  {(stats.upcomingDeadlines ?? []).map((d) => (
                    <li key={d.id} className={styles.item}>
                      <div className={styles.itemTop}>
                        <Link href={`/projects/${d.id}`} className={styles.itemName}>{d.name}</Link>
                        <span className={`${styles.badge} ${styles[`p_${d.priority}`] || ''}`}>{d.priority}</span>
                      </div>
                      <div className={styles.meta}>Due {fmtDate(d.dueDate)} · {STATUS_LABEL[d.status] || d.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}