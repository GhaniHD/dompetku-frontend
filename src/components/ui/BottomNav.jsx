import { useNavigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { colors, fonts } from '../../styles/variables';

/**
 * Bottom Nav – 5 items
 *
 * Beranda | Dompet | [Transaksi FAB] | Laporan | Lainnya
 *
 * "Lainnya" → /more  (halaman baru OtherPage)
 * Semua halaman lama (budget, categories, profile, reports) tetap ada,
 * hanya entry-point-nya dipindah ke OtherPage.
 */

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Beranda',  icon: IconHome   },
  { path: '/wallets',    label: 'Dompet',   icon: IconWallet },
  { path: '/transactions', label: 'Transaksi', icon: IconTransaction, isCenter: true },
  { path: '/reports',    label: 'Laporan',  icon: IconReport  },
  { path: '/more',       label: 'Lainnya',  icon: IconMore    },
];

/* ── Ripple ── */
function spawnRipple(e, btnEl) {
  const rect = btnEl.getBoundingClientRect();
  const size = 48;
  const el = document.createElement('span');
  Object.assign(el.style, {
    position: 'absolute', borderRadius: '50%',
    background: 'rgba(99,102,241,0.15)',
    width: size + 'px', height: size + 'px',
    left: (e.clientX - rect.left - size / 2) + 'px',
    top:  (e.clientY - rect.top  - size / 2) + 'px',
    transform: 'scale(0)',
    animation: 'navRipple .45s linear forwards',
    pointerEvents: 'none',
  });
  btnEl.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const btnRefs  = useRef({});

  if (typeof document !== 'undefined' && !document.getElementById('nav-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'nav-ripple-style';
    s.textContent = `@keyframes navRipple { to { transform: scale(3.5); opacity: 0; } }`;
    document.head.appendChild(s);
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(60px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: '#fff',
      borderTop: `0.5px solid ${colors.border}`,
      display: 'flex', alignItems: 'stretch',
      zIndex: 200,
    }}>
      {NAV_ITEMS.map((item) => {
        // "Lainnya" aktif bila berada di /more ATAU di halaman yang sudah dipindahkan ke sana
        const moreRoutes = ['/more', '/budget', '/categories', '/profile', '/analysis'];
        const isActive =
          item.path === '/more'
            ? moreRoutes.some(r => location.pathname.startsWith(r))
            : location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/');

        const Icon = item.icon;

        const handleClick = (e) => {
          if (btnRefs.current[item.path]) spawnRipple(e, btnRefs.current[item.path]);
          navigate(item.path);
        };

        /* ── Center FAB ── */
        if (item.isCenter) {
          return (
            <button
              key={item.path}
              ref={el => btnRefs.current[item.path] = el}
              onClick={handleClick}
              style={{
                flex: 1, minWidth: 0, border: 'none', background: 'transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                paddingBottom: 4, overflow: 'visible',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 'clamp(40px,12vw,48px)', height: 'clamp(40px,12vw,48px)',
                borderRadius: '50%', background: colors.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99,102,241,.38)',
                position: 'absolute', top: -18,
                transition: 'transform .18s, box-shadow .18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,.38)'; }}
              >
                <Icon active={true} size={20} />
              </div>
              <span style={{
                fontSize: 'clamp(8px,2.5vw,10px)', fontWeight: 700,
                color: colors.primary, fontFamily: fonts.sans, marginTop: 34,
              }}>{item.label}</span>
            </button>
          );
        }

        /* ── Regular item ── */
        return (
          <button
            key={item.path}
            ref={el => btnRefs.current[item.path] = el}
            onClick={handleClick}
            style={{
              flex: 1, minWidth: 0, border: 'none', background: 'transparent',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, cursor: 'pointer', padding: '6px 2px',
              position: 'relative', overflow: 'hidden',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0,
                left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 2.5,
                borderRadius: '0 0 3px 3px',
                background: colors.primary,
              }} />
            )}
            <div style={{
              width: 'clamp(28px,9vw,34px)', height: 'clamp(28px,9vw,34px)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? `${colors.primary}18` : 'transparent',
              transition: 'background .18s, transform .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${colors.primary}18`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${colors.primary}18` : 'transparent'; e.currentTarget.style.transform = ''; }}
            >
              <Icon active={isActive} size={17} />
            </div>
            <span style={{
              fontSize: 'clamp(8px,2.5vw,10px)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? colors.primary : colors.textSecondary,
              fontFamily: fonts.sans, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: '100%', lineHeight: 1,
              transition: 'color .18s',
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

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
function IconReport({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <path d="M2 3h12M2 7h12M2 11h12M4 15V7M8 15V5M12 15v-3"/>
    </svg>
  );
}
function IconMore({ active, size }) {
  return (
    <svg viewBox="0 0 16 16" style={iconStyle(active, size)}>
      <circle cx="3" cy="8" r="1.25" fill={active ? colors.primary : colors.textSecondary} stroke="none"/>
      <circle cx="8" cy="8" r="1.25" fill={active ? colors.primary : colors.textSecondary} stroke="none"/>
      <circle cx="13" cy="8" r="1.25" fill={active ? colors.primary : colors.textSecondary} stroke="none"/>
    </svg>
  );
}