// ═══════════════════════════════════════════════════════════════════
// Unified Design System — Single source of truth
// ทุกหน้าต้อง import จากไฟล์นี้ ห้ามสร้าง color object เอง
// ═══════════════════════════════════════════════════════════════════

// ─── Core palette (matches CSS :root variables in index.css) ─────
export const colors = {
  // Brand primary
  primary:      '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryBg:    'rgba(37, 99, 235, 0.10)',

  // Accent (cyan)
  accent:       '#06B6D4',
  accentHover:  '#0891B2',
  accentGlow:   'rgba(6, 182, 212, 0.25)',
  accentBg:     'rgba(6, 182, 212, 0.10)',

  // Semantic
  success:      '#16A34A',
  successLight: '#F0FDF4',
  successBg:    'rgba(22, 163, 74, 0.10)',

  warning:      '#D97706',
  warningLight: '#FFFBEB',
  warningBg:    'rgba(217, 119, 6, 0.10)',

  danger:       '#DC2626',
  dangerLight:  '#FEF2F2',
  dangerBg:     'rgba(220, 38, 38, 0.10)',

  // Neutral
  gold:         '#F59E0B',
  purple:       '#7C3AED',
  purpleLight:  '#C084FC',
  purpleBg:     'rgba(124, 58, 237, 0.10)',

  // ─── Light mode ──────────────────────────────────
  textMain:     '#1E293B',
  textMuted:    '#64748B',
  textLight:    '#94A3B8',

  bgMain:       '#F8FAFC',
  bgCard:       '#FFFFFF',
  borderMain:   '#E2E8F0',
  borderLight:  '#F1F5F9',

  white:        '#FFFFFF',

  // ─── Dark mode (Navy) ────────────────────────────
  navy:         '#0B1929',
  navyMid:      '#132F4C',
  navyDeep:     '#081422',
  navyCard:     '#0F1D30',
  navyBorder:   '#1A2B42',
  navyBorderHi: '#243D5C',

  textWhite:    '#F8FAFC',
  textGray:     '#94A3B8',
  textDim:      '#64748B',

  // Glass / Card effects (dark mode)
  cardBg:       'rgba(255,255,255,0.04)',
  cardBorder:   'rgba(255,255,255,0.08)',
  glassBg:      'rgba(255,255,255,0.06)',
  glassBorder:  'rgba(255,255,255,0.12)',
};

// ─── Status colors (used across Factory Portal, Dashboard, etc.) ─
export const STATUS_COLORS = {
  DRAFT:           { label: 'Draft',           color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
  PREPARING:       { label: 'Preparing',       color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  READY:           { label: 'Ready',           color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  GENERATING:      { label: 'Generating',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  READY_TO_SUBMIT: { label: 'Ready to Submit', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  SUBMITTING:      { label: 'Submitting',      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  SUBMITTED:       { label: 'Submitted',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  NSW_PROCESSING:  { label: 'NSW Processing',  color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  CUSTOMS_REVIEW:  { label: 'Customs Review',  color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  CLEARED:         { label: 'Cleared',         color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  COMPLETED:       { label: 'Completed',       color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  REJECTED:        { label: 'Rejected',        color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

// ─── Typography ──────────────────────────────────────────────────
export const fonts = {
  sans: "'DM Sans', 'Sarabun', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  sm:  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md:  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: (color) => `0 0 20px ${color}`,
};

// ─── CSS variable shortcuts (for inline styles referencing :root) ─
export const cssVar = {
  primary:    'var(--primary)',
  primaryHover: 'var(--primary-hover)',
  success:    'var(--success)',
  warning:    'var(--warning)',
  danger:     'var(--danger)',
  textMain:   'var(--text-main)',
  textMuted:  'var(--text-muted)',
  textLight:  'var(--text-light)',
  bgMain:     'var(--bg-main)',
  bgCard:     'var(--bg-card)',
  borderMain: 'var(--border-main)',
  borderLight:'var(--border-light)',
  white:      '#fff',
  mono:       "'JetBrains Mono', 'Fira Code', monospace",
};
