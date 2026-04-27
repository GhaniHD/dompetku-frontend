import { useNavigate, useLocation } from 'react-router-dom';
import { colors, fonts } from '../../styles/variables';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Beranda',   icon: IconHome        },
  { path: '/transactions', label: 'Transaksi', icon: IconTransaction },
  { path: '/wallets',      label: 'Dompet',    icon: IconWallet      },
  { path: '/budget', label: 'Anggaran', icon: IconBudget },
  { path: '/reports',      label: 'Laporan',   icon: IconReport      },
  { path: '/profile', label: 'Profil', icon: IconProfile },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: '#fff',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'stretch',
      zIndex: 200,
      // Safe area untuk iPhone (notch bawah)
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path === '/dashboard' && location.pathname === '/');
        const Icon = item.icon;

        // Tombol tengah (Transaksi) dibuat menonjol
        const isCenter = item.path === '/transactions';

        if (isCenter) {
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                paddingBottom: 4,
              }}
            >
              {/* Tombol bulat menonjol */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: colors.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99,102,241,.45)',
                marginBottom: 2,
                position: 'absolute',
                top: -16,
              }}>
                <Icon active={true} size={20} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: colors.primary,
                fontFamily: fonts.sans,
                marginTop: 34,
              }}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, cursor: 'pointer', paddingBottom: 4,
              transition: 'opacity .15s',
            }}
          >
            {/* Indikator aktif */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: 24, height: 3,
                borderRadius: '0 0 4px 4px',
                background: colors.primary,
              }} />
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? `${colors.primary}15` : 'transparent',
              transition: 'background .15s',
            }}>
              <Icon active={isActive} size={18} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? colors.primary : colors.textSecondary,
              fontFamily: fonts.sans,
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────

const iconStyle = (active, size = 18) => ({
  width: size, height: size, flexShrink: 0,
  stroke: active ? (size > 18 ? '#fff' : colors.primary) : colors.textSecondary,
  fill: 'none', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round',
});

function IconHome({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <path d="M1 6.5L8 1l7 5.5V14a1 1 0 01-1 1H2a1 1 0 01-1-1V6.5z"/>
      <path d="M5 15V9h6v6"/>
    </svg>
  );
}
function IconTransaction({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <path d="M2 5h12M10 2l3 3-3 3M14 11H2M6 8l-3 3 3 3"/>
    </svg>
  );
}
function IconWallet({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <rect x="1" y="4" width="14" height="10" rx="2"/>
      <path d="M11 9h1M1 7h14M4 1l-3 3h14l-3-3"/>
    </svg>
  );
}
function IconBudget({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <path d="M1 12V5l5-4 4 3 5-2v10"/>
      <path d="M6 12V8M10 12V6"/>
    </svg>
  );
}
function IconProfile({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <circle cx="8" cy="5" r="3"/>
      <path d="M1.5 14c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/>
    </svg>
  );
}

function IconReport({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <path d="M2 3h12M2 7h12M2 11h12M4 15V7M8 15V5M12 15v-3"/>
    </svg>
  );
}