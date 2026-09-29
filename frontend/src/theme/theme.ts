export const themeTokens = {
  colors: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primarySoft: '#EFF6FF',
    accent: '#F97316',
    accentSoft: '#FFF7ED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textMuted: '#64748B',
  },
  gradients: {
    headerPrimary: 'var(--gradient-header-primary)',
    panelDark: 'var(--gradient-panel-dark)',
    softSurface: 'var(--gradient-soft-surface)',
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontSize: '1.5rem', fontWeight: 700 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem', fontWeight: 400 },
    label: { fontSize: '0.75rem', fontWeight: 500 },
  },
  radius: { md: '12px', lg: '16px' },
};

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: '#EFF6FF', text: '#2563EB', label: 'Planning' },
  active: { bg: '#ECFDF5', text: '#059669', label: 'Active' },
  on_hold: { bg: '#FFF7ED', text: '#EA580C', label: 'On Hold' },
  completed: { bg: '#F1F5F9', text: '#475569', label: 'Completed' },
};

export const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: '#F1F5F9', text: '#475569', label: 'Low' },
  medium: { bg: '#EFF6FF', text: '#2563EB', label: 'Medium' },
  high: { bg: '#FEF2F2', text: '#DC2626', label: 'High' },
};

export default themeTokens;