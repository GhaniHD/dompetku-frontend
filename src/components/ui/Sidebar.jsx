import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../styles/variables';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Ikhtisar',  icon: IconOverview   },
  { path: '/transactions', label: 'Transaksi', icon: IconTransaction },
  { path: '/wallets',      label: 'Dompet',    icon: IconWallet      },
  { path: '/categories',   label: 'Kategori',  icon: IconCategory    },
  { path: '/budget',       label: 'Anggaran',  icon: IconBudget      },
  { path: '/analysis',     label: 'Analisis',  icon: IconAnalysis    },
  { path: '/reports',      label: 'Laporan',   icon: IconReport      },
];

const BOTTOM_ITEMS = [
  { path: '/profile', label: 'Profil', icon: IconProfile },
];

export default function Sidebar({ open }) {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await new Promise(res => setTimeout(res, 600));
      logout();
    },
    onSuccess: () => navigate('/login'),
  });

  // Avatar helpers
  const getInitials = (name) => {
    if (!name) return '?';
    const w = name.trim().split(' ');
    return w.length === 1
      ? w[0][0].toUpperCase()
      : (w[0][0] + w[1][0]).toUpperCase();
  };
  const getColor = (name) => {
    if (!name) return '#6B7280';
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6'][Math.abs(h) % 6];
  };

  const navItemStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 10, border: 'none',
    cursor: 'pointer', fontFamily: fonts.sans,
    fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
    width: '100%', textAlign: 'left',
    transition: 'all .15s',
    background: isActive ? colors.primary : 'transparent',
    color:      isActive ? '#fff' : colors.textSecondary,
    boxShadow:  isActive ? '0 4px 12px rgba(99,102,241,.25)' : 'none',
  });

  return (
    <>
      <aside style={{
        width:    open ? 220 : 0,
        minWidth: open ? 220 : 0,
        overflow: 'hidden',
        background: colors.surface,
        borderRight: `1.5px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column',
        padding: open ? '16px 12px' : 0,
        gap: 2,
        transition: 'width .25s ease, min-width .25s ease, padding .25s ease',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: fonts.sans, fontWeight: 800, fontSize: 17,
          color: colors.primary, padding: '4px 10px 16px',
          whiteSpace: 'nowrap', letterSpacing: '-0.3px',
        }}>
          💰 DompetKu
        </div>

        {/* Avatar + nama user */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px 14px',
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 6,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: getColor(user?.name),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
            flexShrink: 0, overflow: 'hidden',
          }}>
            {user?.avatar_url
  ? <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  : getInitials(user?.name)
}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: fonts.sans, fontWeight: 700,
              fontSize: 13, color: colors.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.name ?? 'Pengguna'}
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, whiteSpace: 'nowrap' }}>
              {user?.email ?? ''}
            </div>
          </div>
        </div>

        {/* Label section */}
        <SectionLabel>Menu</SectionLabel>

        {/* Nav utama */}
       {NAV_ITEMS.map((item) => {
  const isActive = location.pathname === item.path ||
    (item.path === '/dashboard' && location.pathname === '/');
  const Icon = item.icon;
  return (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      style={navItemStyle(isActive)}
    >
      <Icon active={isActive} />
      {item.label}
    </button>
  );
})}
        {/* Spacer dorong ke bawah */}
        <div style={{ flex: 1 }} />

        <SectionLabel>Akun</SectionLabel>

        {/* Profil */}
        {BOTTOM_ITEMS.map((item) => {
  const isActive = location.pathname === item.path;
  const Icon = item.icon;
  return (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      style={navItemStyle(isActive)}
    >
      <Icon active={isActive} />
      {item.label}
    </button>
  );
})}
        {/* Tombol Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontFamily: fonts.sans,
            fontSize: 13, fontWeight: 600, width: '100%',
            background: logoutMutation.isPending ? colors.border : '#fee2e2',
            color: logoutMutation.isPending ? colors.textSecondary : '#991b1b',
            transition: 'all .15s', whiteSpace: 'nowrap', marginTop: 4,
          }}
        >
          <IconLogout />
          {logoutMutation.isPending ? 'Keluar...' : 'Keluar'}
        </button>

      </aside>

      {/* Loading overlay saat logout */}
      {logoutMutation.isPending && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            padding: '24px 32px', borderRadius: 16,
            background: '#fff', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div className="spinner" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Sedang keluar...
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ── Komponen kecil ────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
      color: colors.textSecondary, padding: '8px 12px 4px',
      whiteSpace: 'nowrap', opacity: .7,
    }}>
      {children.toUpperCase()}
    </div>
  );
}

// ── Ikon SVG sederhana ────────────────────────────────────────────────

const iconStyle = (active) => ({
  width: 16, height: 16, flexShrink: 0,
  stroke: active ? '#fff' : colors.textSecondary,
  fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
});

function IconOverview({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  );
}
function IconTransaction({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <path d="M2 5h12M10 2l3 3-3 3M14 11H2M6 8l-3 3 3 3"/>
    </svg>
  );
}
function IconWallet({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <rect x="1" y="4" width="14" height="10" rx="2"/>
      <path d="M11 9h1M1 7h14M4 1l-3 3h14l-3-3"/>
    </svg>
  );
}
function IconCategory({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <circle cx="4" cy="4" r="2.5"/>
      <circle cx="12" cy="4" r="2.5"/>
      <circle cx="4" cy="12" r="2.5"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
    </svg>
  );
}
function IconBudget({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <path d="M1 12V5l5-4 4 3 5-2v10"/>
      <path d="M6 12V8M10 12V6"/>
    </svg>
  );
}
function IconAnalysis({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 1.5V8l4.5 4.5"/>
    </svg>
  );
}
function IconReport({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <rect x="3" y="1" width="10" height="14" rx="1.5"/>
      <path d="M6 5h4M6 8h4M6 11h2"/>
    </svg>
  );
}
function IconProfile({ active }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active)}>
      <circle cx="8" cy="5" r="3"/>
      <path d="M1.5 14c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" style={{ flexShrink: 0 }}
         fill="none" stroke="#991b1b" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
    </svg>
  );
}