import { useAnimateIn } from '../../hooks/useAnimations';
import { colors, fonts, radius, shadows } from '../../styles/variables';


const fmt = (n) => 'Rp ' + Math.abs(n).toLocaleString('id-ID')

/* ─────────────────────────────────────────────
   Badge
   ───────────────────────────────────────────── */
export function Badge({ children, variant = 'up' }) {
  const styles = {
    up: { background: colors.successLight, color: colors.successText },
    dn: { background: colors.dangerLight,  color: colors.dangerText  },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, fontWeight: 600,
      padding: '3px 8px', borderRadius: 20,
      fontFamily: fonts.mono,
      ...styles[variant],
    }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   StatCard
   ───────────────────────────────────────────── */
export function StatCard({ icon, label, value, badge, badgeVariant, delay = 0 }) {
  const visible = useAnimateIn(delay);
  return (
    <div
      style={{
        background: colors.surface, borderRadius: radius.lg,
        border: `1.5px solid ${colors.border}`,
        padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity ${0.4}s ease, transform ${0.4}s ease`,
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = shadows.hover; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: radius.md, background: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: colors.textSecondary }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fonts.mono, color: colors.textPrimary }}>{value}</div>
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TransactionItem
   ───────────────────────────────────────────── */
export function TransactionItem({ tx, delay = 0 }) {
  const visible = useAnimateIn(delay);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 12px', borderRadius: radius.md, cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.35s ease, transform 0.35s ease, background 0.15s`,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FF')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 38, height: 38, borderRadius: radius.md,
        background: colors.primaryLight, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {tx.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.note}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{tx.cat} {tx.date}</div>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700, fontFamily: fonts.mono, flexShrink: 0,
        color: tx.type === 'inc' ? colors.success : colors.danger,
      }}>
        {tx.type === 'inc' ? '+' : '-'}{fmt(tx.amount)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WalletCard
   ───────────────────────────────────────────── */
export function WalletCard({ wallet, delay = 0 }) {
  const visible = useAnimateIn(delay);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: radius.md,
        background: colors.bg, border: `1.5px solid ${colors.border}`,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
        transition: `opacity 0.4s ease, transform 0.4s ease, border-color 0.2s`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderHover; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13,
        background: wallet.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {wallet.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 3 }}>{wallet.name}</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: fonts.mono, color: colors.textPrimary }}>
          {fmt(wallet.balance)}
        </div>
      </div>
      <span style={{ fontSize: 18, color: colors.textMuted }}>›</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BudgetBar
   ───────────────────────────────────────────── */
import { useState, useEffect } from 'react';

export function BudgetBar({ budget, index }) {
  const [width, setWidth] = useState(0);
  const pct  = Math.round((budget.used / budget.total) * 100);
  const warn = pct > 85;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), index * 100 + 300);
    return () => clearTimeout(t);
  }, [pct, index]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{budget.name}</span>
        <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>
          {fmt(budget.used)} / {fmt(budget.total)}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: colors.bg, border: `1.5px solid ${colors.border}`, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 8,
          background: budget.color,
          width: `${width}%`,
          transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, marginTop: 3, fontFamily: fonts.mono, color: warn ? colors.danger : colors.textMuted }}>
        {pct}%
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ActionButton
   ───────────────────────────────────────────── */
export function ActionButton({ icon, label, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '14px 8px', borderRadius: radius.lg,
        border: `1.5px solid ${colors.border}`, background: colors.surface,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderHover; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = shadows.hover; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary }}>{label}</span>
    </div>
  );
}
