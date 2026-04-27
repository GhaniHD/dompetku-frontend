// src/pages/dashboard/OverviewTab.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCounter } from '../../hooks/useAnimations';
import { StatCard, TransactionItem } from '../../components/ui/index';
import { BarChart, DonutChart } from '../../components/charts/index';
import { fmt } from '../../constants/data';
import {
  colors, fonts, gradients,
  cardStyle, cardTitleStyle,
} from '../../styles/variables';
import { useTransactions } from '../../hooks/useTransactions';
import { useWallets } from '../../hooks/useWallets';
import { useBudgets } from '../../hooks/useBudgets';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowRight, Sparkles, List,
  CreditCard, ZoomIn, X,
  Target, AlertTriangle, CheckCircle2, ChevronRight,
} from 'lucide-react';

// ── Konstanta ──────────────────────────────────────────────────────────
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ── useWindowWidth ─────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function getDateStr(tx) { return String(tx.date ?? '').slice(0, 10); }

function fmtShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'rb';
  return String(n);
}

function normalise(tx) {
  return {
    id: tx.id,
    icon: tx.type === 'income' ? '💰' : '🛒',
    note: tx.note,
    label: tx.category_name ?? 'Transaksi',
    sub: tx.wallet_name ?? '',
    amount: tx.amount,
    type: tx.type === 'income' ? 'inc' : 'exp',
  };
}

// ══ Chart Modal ════════════════════════════════════════════════════════
function ChartModal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', backdropFilter: 'blur(4px)',
        animation: 'fadeInBg .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.surface, borderRadius: 20, padding: '24px',
          width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,.25)',
          animation: 'slideUp .25s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 20,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, fontFamily: fonts.sans }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `1.5px solid ${colors.border}`, background: colors.background,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={15} strokeWidth={2} color={colors.textSecondary} />
          </button>
        </div>
        <div style={{ minHeight: 280 }}>{children}</div>
      </div>
    </div>
  );
}

// ══ Budget Progress Item ═══════════════════════════════════════════════
function BudgetProgressItem({ budget, delay = 0 }) {
  // budget shape (sesuaikan dengan shape dari useBudgets):
  // { id, name, category_name, limit_amount, spent_amount, ... }
  const limit   = budget.limit_amount  ?? budget.amount ?? 0;
  const spent   = budget.spent_amount  ?? budget.used   ?? 0;
  const pct     = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const isOver  = spent > limit;
  const isWarn  = !isOver && pct >= 80;

  const barColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#6366f1';
  const bgColor  = isOver ? '#fef2f2' : isWarn ? '#fffbeb' : '#eef2ff';
  const textColor = isOver ? '#dc2626' : isWarn ? '#d97706' : '#4f46e5';

  const StatusIcon = isOver ? AlertTriangle : isWarn ? AlertTriangle : CheckCircle2;

  return (
    <div
      className="fade-in"
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        background: colors.surface,
        border: `1px solid ${isOver ? '#fecaca' : isWarn ? '#fde68a' : colors.border}`,
        animationDelay: `${delay}ms`,
        transition: 'box-shadow .15s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StatusIcon size={13} strokeWidth={2.5} color={textColor} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: colors.text,
              fontFamily: fonts.sans,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {budget.category?.name ?? budget.name ?? 'Anggaran'}
            </div>
            <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>
              {isOver ? 'Melebihi batas!' : isWarn ? 'Hampir habis' : 'Dalam batas'}
            </div>
          </div>
        </div>
        {/* Persentase badge */}
        <div style={{
          flexShrink: 0, marginLeft: 8,
          background: bgColor, borderRadius: 20,
          padding: '2px 8px',
          fontSize: 11, fontWeight: 700,
          color: textColor, fontFamily: fonts.mono,
        }}>
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 99,
        background: `${barColor}22`,
        overflow: 'hidden', marginBottom: 7,
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: isOver
            ? 'linear-gradient(90deg,#ef4444,#dc2626)'
            : isWarn
              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
              : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
          transition: 'width .6s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>

      {/* Nominal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono }}>
          {fmt(spent)}
        </span>
        <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
          / {fmt(limit)}
        </span>
      </div>
    </div>
  );
}

// ══ Budget Overview Section ════════════════════════════════════════════
function BudgetOverview({ budgets: _budgetsProp, isLoading, onNavigate }) {
  const budgets = Array.isArray(_budgetsProp) ? _budgetsProp : [];
  // Urutkan: over limit → warn → safe; ambil max 4
  const sorted = [...budgets].sort((a, b) => {
    const score = (bgt) => {
      const pct = bgt.limit_amount > 0
        ? (bgt.spent_amount ?? 0) / bgt.limit_amount : 0;
      return pct >= 1 ? 2 : pct >= 0.8 ? 1 : 0;
    };
    return score(b) - score(a);
  }).slice(0, 4);

  const overCount  = budgets.filter(b => (b.spent_amount ?? 0) > (b.limit_amount ?? 0)).length;
  const warnCount  = budgets.filter(b => {
    const p = b.limit_amount > 0 ? (b.spent_amount ?? 0) / b.limit_amount : 0;
    return p >= 0.8 && p < 1;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Summary chips */}
      {!isLoading && budgets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#eef2ff', borderRadius: 20, padding: '4px 10px',
            fontSize: 11, fontWeight: 600, color: '#4f46e5',
          }}>
            <Target size={11} strokeWidth={2.5} />
            {budgets.length} anggaran aktif
          </div>
          {overCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fef2f2', borderRadius: 20, padding: '4px 10px',
              fontSize: 11, fontWeight: 600, color: '#dc2626',
            }}>
              <AlertTriangle size={11} strokeWidth={2.5} />
              {overCount} melebihi batas
            </div>
          )}
          {warnCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fffbeb', borderRadius: 20, padding: '4px 10px',
              fontSize: 11, fontWeight: 600, color: '#d97706',
            }}>
              <AlertTriangle size={11} strokeWidth={2.5} />
              {warnCount} hampir habis
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        [1, 2, 3].map(i => (
          <div key={i} style={{
            height: 80, borderRadius: 12,
            background: colors.border,
            animation: 'pulse 1.5s infinite',
            animationDelay: `${i * 100}ms`,
          }} />
        ))
      )}

      {/* Empty state */}
      {!isLoading && budgets.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '28px 0',
          color: colors.textSecondary,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: colors.text }}>
            Belum ada anggaran
          </div>
          <div style={{ fontSize: 12, marginBottom: 16 }}>
            Buat anggaran untuk kontrol pengeluaranmu
          </div>
          <button
            onClick={() => onNavigate('budget')}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: colors.primary, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: fonts.sans,
            }}
          >
            + Buat Anggaran
          </button>
        </div>
      )}

      {/* Budget items */}
      {!isLoading && sorted.map((b, i) => (
        <BudgetProgressItem key={b.id} budget={b} delay={i * 80} />
      ))}

      {/* Lihat semua jika lebih dari 4 */}
      {!isLoading && budgets.length > 4 && (
        <button
          onClick={() => onNavigate('budget')}
          style={{
            marginTop: 2, width: '100%', padding: '8px',
            borderRadius: 8, border: `1px dashed ${colors.border}`,
            background: 'transparent', cursor: 'pointer',
            fontSize: 12, color: colors.textSecondary,
            fontFamily: fonts.sans,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          +{budgets.length - 4} anggaran lainnya
          <ChevronRight size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ══ Wallet Card — horizontal card untuk scroll mobile ══════════════════
function WalletCardH({ wallet, delay = 0 }) {
  const colorsMap = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  let hash = 0;
  for (let i = 0; i < (wallet.name ?? '').length; i++) {
    hash = wallet.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = colorsMap[Math.abs(hash) % colorsMap.length];

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      gap: 8, padding: '14px 14px',
      borderRadius: 14,
      background: `linear-gradient(135deg, ${bg}1a, ${bg}0d)`,
      border: `1.5px solid ${bg}33`,
      minWidth: 148, flexShrink: 0,
      animationDelay: `${delay}ms`,
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CreditCard size={14} strokeWidth={2} color="#fff" />
      </div>
      <div style={{ minWidth: 0, width: '100%' }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: colors.text,
          fontFamily: fonts.sans, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {wallet.name}
        </div>
        <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>
          {wallet.type ?? 'Dompet'}
        </div>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 800, fontFamily: fonts.mono, color: bg,
      }}>
        {fmt(wallet.balance ?? 0)}
      </div>
    </div>
  );
}

// ══ Wallet Card — list item biasa (desktop) ════════════════════════════
function WalletCardList({ wallet, delay = 0 }) {
  const colorsMap = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  let hash = 0;
  for (let i = 0; i < (wallet.name ?? '').length; i++) {
    hash = wallet.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = colorsMap[Math.abs(hash) % colorsMap.length];

  return (
    <div className="fade-in" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 12,
      background: colors.surface, border: `1px solid ${colors.border}`,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <CreditCard size={14} strokeWidth={2} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: colors.text,
          fontFamily: fonts.sans, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {wallet.name}
        </div>
        <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>
          {wallet.type ?? 'Dompet'}
        </div>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, fontFamily: fonts.mono,
        color: colors.text, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {fmt(wallet.balance ?? 0)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function OverviewTab({ onNavigate }) {
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();

  const isXs = windowWidth < 480;
  const isSm = windowWidth < 640;
  const isMd = windowWidth < 768;
  const isLg = windowWidth >= 768;

  const [chartModal, setChartModal] = useState(null);

  const { data: wallets = [] } = useWallets();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: _budgetsRaw, isLoading: budgetsLoading } = useBudgets();
  const _allBudgets = Array.isArray(_budgetsRaw)
    ? _budgetsRaw
    : Array.isArray(_budgetsRaw?.data)
      ? _budgetsRaw.data
      : Array.isArray(_budgetsRaw?.budgets)
        ? _budgetsRaw.budgets
        : [];

  // Filter anggaran sesuai bulan & tahun saat ini (sama dengan tanggal di header AppLayout)
  const _now = new Date();
  const _curMonth = _now.getMonth() + 1; // 1-12
  const _curYear  = _now.getFullYear();
  const budgets = _allBudgets.filter(b => {
    // Format "2025-04" atau "2025-04-01"
    if (b.period) {
      const [y, m] = String(b.period).split('-').map(Number);
      return y === _curYear && m === _curMonth;
    }
    // field month (1-12) + year
    if (b.month != null && b.year != null) {
      return Number(b.month) === _curMonth && Number(b.year) === _curYear;
    }
    // start_date / end_date — anggaran aktif jika mencakup bulan ini
    if (b.start_date) {
      const start = new Date(b.start_date);
      const end   = b.end_date ? new Date(b.end_date) : null;
      const startOk = start.getFullYear() < _curYear ||
        (start.getFullYear() === _curYear && start.getMonth() + 1 <= _curMonth);
      const endOk = !end || end.getFullYear() > _curYear ||
        (end.getFullYear() === _curYear && end.getMonth() + 1 >= _curMonth);
      return startOk && endOk;
    }
    // Tidak ada field tanggal — tampilkan semua (fallback)
    return true;
  });

  const totalBalance = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const animBalance = useCounter(totalBalance);

  const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSaving    = totalIncome - totalExpense;
  const recentTx     = transactions.slice(0, 5);

  const weeklyData = (() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const amount = transactions
        .filter(t => t.type === 'expense' && getDateStr(t) === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      return { day: DAY_NAMES[d.getDay()], amount };
    });
  })();

  const { categoryData, totalExpenseLabel } = (() => {
    const now = new Date();
    const exp = transactions.filter(t => {
      const d = new Date(getDateStr(t));
      return t.type === 'expense' && !isNaN(d) &&
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const total = exp.reduce((s, t) => s + t.amount, 0);
    if (!total) return { categoryData: [], totalExpenseLabel: '0' };
    const map = {};
    exp.forEach(t => { const k = t.category_name ?? 'Lainnya'; map[k] = (map[k] ?? 0) + t.amount; });
    const data = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, amt], i) => ({ name, pct: Math.round((amt / total) * 100), color: PALETTE[i % PALETTE.length] }));
    return { categoryData: data, totalExpenseLabel: fmtShort(total) };
  })();

  const go = (path) => { if (onNavigate) onNavigate(path); else navigate(`/${path}`); };

  const px = isXs ? 12 : isSm ? 16 : 20;

  const card = (extra = {}) => ({
    background: colors.surface, borderRadius: 16,
    border: `1px solid ${colors.border}`,
    padding: isXs ? '14px' : '16px 20px',
    ...extra,
  });

  return (
    <>
      <style>{`
        @keyframes fadeInBg { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Chart Modals ── */}
      {chartModal === 'bar' && (
        <ChartModal title="Pengeluaran 7 Hari Terakhir" onClose={() => setChartModal(null)}>
          {weeklyData.every(d => d.amount === 0)
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: colors.textMuted, fontSize: 13 }}>Belum ada data</div>
            : <BarChart data={weeklyData} />}
        </ChartModal>
      )}
      {chartModal === 'donut' && (
        <ChartModal title="Distribusi Pengeluaran Bulan Ini" onClose={() => setChartModal(null)}>
          {categoryData.length === 0
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: colors.textMuted, fontSize: 13 }}>Belum ada data</div>
            : <DonutChart categories={categoryData} totalLabel={totalExpenseLabel} />}
        </ChartModal>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: isXs ? 12 : 14,
        padding: `4px ${px}px ${isLg ? 24 : 16}px`,
        boxSizing: 'border-box', width: '100%', overflowX: 'hidden',
      }}>

        {/* ══ HERO CARD ══════════════════════════════════════════ */}
        <div style={{
          background: gradients.hero,
          borderRadius: isXs ? 16 : 20,
          padding: isXs ? '18px 16px' : isSm ? '20px 20px' : '24px 28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.07)', top:-60, right:-40, pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.04)', bottom:-40, left:80, pointerEvents:'none' }} />

          <div style={{
            display: 'flex', flexDirection: isXs ? 'column' : 'row',
            alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 10, position: 'relative', zIndex: 1,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginBottom: 4, fontFamily: fonts.sans }}>
                Total Saldo Semua Dompet
              </div>
              <div style={{
                fontSize: isXs ? 24 : isSm ? 28 : 34,
                fontWeight: 800, color: '#fff', fontFamily: fonts.mono,
                letterSpacing: -1, marginBottom: isXs ? 12 : 16,
                wordBreak: 'break-all', lineHeight: 1.2,
              }}>
                {isLoading ? '…' : `Rp ${animBalance.toLocaleString('id-ID')}`}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Pemasukan', val: totalIncome, Icon: TrendingUp, cls: 'up' },
                  { label: 'Pengeluaran', val: totalExpense, Icon: TrendingDown, cls: 'dn' },
                ].map(p => (
                  <div key={p.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,.14)', borderRadius: 10,
                    padding: '8px 12px', flex: isXs ? '1 1 0' : 'none', minWidth: 0,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: p.cls === 'up' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p.Icon size={13} strokeWidth={2.5} color={p.cls === 'up' ? '#6EE7B7' : '#FCA5A5'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: fonts.sans }}>{p.label}</div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, fontFamily: fonts.mono,
                        color: p.cls === 'up' ? '#6EE7B7' : '#FCA5A5',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {isLoading ? '…' : fmt(p.val)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isXs && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,.18)', borderRadius: 20,
                  padding: '4px 10px', fontSize: 11,
                  color: 'rgba(255,255,255,.9)', marginBottom: 6,
                }}>
                  <Sparkles size={12} strokeWidth={2} />
                  {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: fonts.sans }}>Diperbarui hari ini</div>
                {!isSm && <div style={{ marginTop: 12 }}><Wallet size={36} strokeWidth={1.2} color="rgba(255,255,255,0.25)" /></div>}
              </div>
            )}

            {isXs && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,.18)', borderRadius: 16,
                padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,.9)',
              }}>
                <Sparkles size={11} strokeWidth={2} />
                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        {/* ══ STAT CARDS ══════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMd ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isXs ? 8 : 10,
        }}>
          <StatCard icon={<PiggyBank size={18} strokeWidth={2} />}    label="Tabungan bersih" value={fmt(netSaving)}              badge={netSaving >= 0 ? 'Surplus' : 'Defisit'} badgeVariant={netSaving >= 0 ? 'up' : 'dn'} delay={100} />
          <StatCard icon={<CreditCard size={18} strokeWidth={2} />}   label="Jumlah dompet"   value={`${wallets.length} aktif`}      badge="Total"       badgeVariant="up" delay={150} />
          <StatCard icon={<List size={18} strokeWidth={2} />}         label="Transaksi"        value={`${transactions.length} data`}  badge="Semua waktu" badgeVariant="dn" delay={200} />
          <StatCard icon={<TrendingDown size={18} strokeWidth={2} />} label="Total keluar"     value={fmt(totalExpense)}               badge="Pengeluaran" badgeVariant="dn" delay={250} />
        </div>

        {/* ══ BUDGET OVERVIEW (mobile) ════════════════════════════ */}
        {!isLg && (
          <div style={card()}>
            <div style={{ ...cardTitleStyle, marginBottom: 10 }}>
              Anggaran Bulan Ini
              <button
                onClick={() => go('budget')}
                style={{
                  fontSize: 11, color: colors.primary, background: 'none',
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Kelola <ArrowRight size={13} strokeWidth={2} />
              </button>
            </div>
            <BudgetOverview
              budgets={budgets}
              isLoading={budgetsLoading}
              onNavigate={go}
            />
          </div>
        )}

        {/* ══ DOMPET SAYA (mobile) ════════════════════════════════ */}
        {!isLg && (
          <div style={card()}>
            <div style={{ ...cardTitleStyle, marginBottom: 10 }}>
              Dompet Saya
              <button onClick={() => go('wallets')} style={{ fontSize: 11, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Kelola <ArrowRight size={13} strokeWidth={2} />
              </button>
            </div>

            {wallets.length === 0 && !isLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: colors.textSecondary, fontSize: 13 }}>
                Belum ada dompet.{' '}
                <button onClick={() => go('wallets')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Tambah sekarang
                </button>
              </div>
            )}

            {wallets.length > 0 && (
              <div style={{
                display: 'flex', gap: 10,
                overflowX: 'auto', paddingBottom: 4,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
              }}>
                <style>{`.wallet-scroll::-webkit-scrollbar{display:none}`}</style>
                {wallets.map((w, i) => (
                  <WalletCardH key={w.id} wallet={w} delay={i * 60} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ BUDGET + DOMPET (Desktop side-by-side) ══════════════ */}
        {isLg && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Budget Overview */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>
                Anggaran Bulan Ini
                <button
                  onClick={() => go('budget')}
                  style={{
                    fontSize: 11, color: colors.primary, background: 'none',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Kelola <ArrowRight size={13} strokeWidth={2} />
                </button>
              </div>
              <BudgetOverview
                budgets={budgets}
                isLoading={budgetsLoading}
                onNavigate={go}
              />
            </div>

            {/* Dompet */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>
                Dompet Saya
                <button onClick={() => go('wallets')} style={{ fontSize: 11, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Kelola <ArrowRight size={13} strokeWidth={2} />
                </button>
              </div>
              {wallets.length === 0 && !isLoading && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: colors.textSecondary, fontSize: 13 }}>
                  Belum ada dompet.{' '}
                  <button onClick={() => go('wallets')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    Tambah sekarang
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wallets.slice(0, 5).map((w, i) => <WalletCardList key={w.id} wallet={w} delay={i * 60} />)}
              </div>
              {wallets.length > 5 && (
                <button onClick={() => go('wallets')} style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 8, border: `1px dashed ${colors.border}`, background: 'transparent', cursor: 'pointer', fontSize: 12, color: colors.textSecondary, fontFamily: fonts.sans }}>
                  +{wallets.length - 5} dompet lainnya
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ CHARTS ══════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMd ? '1fr' : '1fr 1fr',
          gap: isXs ? 10 : 14,
        }}>
          {[
            {
              key: 'bar',
              title: 'Pengeluaran 7 Hari',
              sub: '7 hari terakhir',
              empty: weeklyData.every(d => d.amount === 0),
              emptyMsg: 'Belum ada pengeluaran 7 hari terakhir',
              chart: <BarChart data={weeklyData} />,
            },
            {
              key: 'donut',
              title: 'Distribusi Pengeluaran',
              sub: 'Bulan ini',
              empty: categoryData.length === 0,
              emptyMsg: 'Belum ada pengeluaran bulan ini',
              chart: <DonutChart categories={categoryData} totalLabel={totalExpenseLabel} />,
            },
          ].map(({ key, title, sub, empty, emptyMsg, chart }) => (
            <div
              key={key}
              onClick={() => { if (!isLoading && !empty) setChartModal(key); }}
              style={{
                ...card(),
                cursor: (!isLoading && !empty) ? 'pointer' : 'default',
                transition: 'box-shadow .15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isLoading && !empty) e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,.13)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {!isLoading && !empty && (
                <div style={{
                  position: 'absolute', top: 13, right: 14,
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, color: colors.textMuted, fontFamily: fonts.sans,
                  userSelect: 'none',
                }}>
                  <ZoomIn size={11} strokeWidth={2} /> Perbesar
                </div>
              )}
              <div style={{ ...cardTitleStyle, marginBottom: 12, paddingRight: (!isLoading && !empty) ? 64 : 0 }}>
                {title}
                <span style={{ fontSize: 10, color: colors.textMuted, fontWeight: 500 }}>{sub}</span>
              </div>
              {isLoading
                ? <div style={{ height: 100, borderRadius: 8, background: colors.border, animation: 'pulse 1.5s infinite' }} />
                : empty
                  ? <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: 12 }}>{emptyMsg}</div>
                  : chart
              }
            </div>
          ))}
        </div>

        {/* ══ TRANSAKSI TERBARU ════════════════════════════════════ */}
        <div style={card()}>
          <div style={{ ...cardTitleStyle, marginBottom: 12 }}>
            Transaksi Terbaru
            <button onClick={() => go('transactions')} style={{ fontSize: 11, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat semua <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>

          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 52, borderRadius: 10, background: colors.border, animation: 'pulse 1.5s infinite' }} />)}
            </div>
          )}

          {!isLoading && recentTx.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px 0', color: colors.textSecondary }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Belum ada transaksi</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>Mulai catat keuanganmu sekarang</div>
              <button
                onClick={() => go('transactions')}
                style={{ padding: '8px 20px', borderRadius: 8, background: colors.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: fonts.sans }}
              >
                + Tambah Transaksi
              </button>
            </div>
          )}

          {!isLoading && recentTx.map((tx, i) => (
            <TransactionItem key={tx.id} tx={normalise(tx)} delay={300 + i * 60} />
          ))}
        </div>

      </div>
    </>
  );
}