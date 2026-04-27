/* ─────────────────────────────────────────────
   DompetKu — Theme Tokens (JS)
   Gunakan ini di komponen yang perlu inline style.
   Untuk Tailwind, lihat tailwind.config.js
   ───────────────────────────────────────────── */

export const colors = {
  primary:       '#6366F1',
  primaryHover:  '#4F46E5',
  primaryLight:  '#EEF2FF',
  primaryRing:   '#C7D2FE',

  success:       '#10B981',
  successLight:  '#ECFDF5',
  successText:   '#047857',

  warning:       '#F59E0B',
  warningLight:  '#FFFBEB',

  danger:        '#EF4444',
  dangerLight:   '#FEF2F2',
  dangerText:    '#B91C1C',

  purple:        '#8B5CF6',
  purpleLight:   '#F5F3FF',

  bg:            '#F8F9FF',
  surface:       '#FFFFFF',
  border:        '#E5E7EB',
  borderHover:   '#C7D2FE',

  textPrimary:   '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
};

export const gradients = {
  hero: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
};

export const fonts = {
  sans: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const radius = {
  sm:  '8px',
  md:  '12px',
  lg:  '16px',
  xl:  '20px',
  xxl: '24px',
};

export const shadows = {
  card:   '0 1px 4px rgba(0,0,0,0.06)',
  hover:  '0 8px 24px rgba(99,102,241,0.1)',
  button: '0 4px 14px rgba(99,102,241,0.3)',
};

/** Style preset untuk Card biasa */
export const cardStyle = {
  background:   colors.surface,
  borderRadius: radius.lg,
  border:       `1.5px solid ${colors.border}`,
  padding:      '20px',
};

/** Style preset untuk judul Card */
export const cardTitleStyle = {
  fontSize:       '13px',
  fontWeight:     700,
  color:          colors.textPrimary,
  marginBottom:   '16px',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
};
