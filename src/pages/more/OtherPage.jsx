// src/pages/more/OtherPage.jsx
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { colors, fonts, radius, shadows } from '../../styles/variables';

/**
 * Halaman "Lainnya" — entry point untuk fitur-fitur yang tidak ada di BottomNav utama.
 *
 * Struktur:
 *  KELOLA KEUANGAN  → Anggaran, Kategori, Transfer*, Tagihan*
 *  AKUN & PENGATURAN → Profil saya (ProfilePage sudah include semua settings)
 *                      Notifikasi, Pengaturan, Ekspor data*
 *
 * (*) Tandai sebagai "Segera" jika belum ada halamannya, atau arahkan ke route yang ada.
 *
 * NOTE: Notifikasi & Pengaturan umum sudah ada DI DALAM ProfilePage
 *       (sebagai modal sheet). Untuk menghindari duplikasi, di sini kita
 *       navigasikan ke /profile dengan query ?tab=notifikasi / ?tab=pengaturan
 *       — ProfilePage sudah bisa membaca searchParams dan membuka modal yang sesuai.
 *       Jika belum diimplementasikan, cukup arahkan ke /profile saja.
 */

// ── Icon helpers ──────────────────────────────────────────────────────────────

const Svg = ({ children, size = 20, color }) => (
  <svg
    width={size} height={size} viewBox="0 0 20 20"
    fill="none" stroke={color} strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round"
  >
    {children}
  </svg>
);

const FINANCE_ITEMS = [
  {
    key: 'budget',
    label: 'Anggaran',
    sub: 'Atur batas pengeluaran',
    path: '/budget',
    bg: '#EEF0FE',
    color: '#4F46E5',
    icon: (c) => (
      <Svg color={c}>
        <path d="M3 15V8l5-5 4 3 5-3v12"/>
        <path d="M8 15v-5M12 15V9"/>
      </Svg>
    ),
  },
  {
    key: 'categories',
    label: 'Kategori',
    sub: 'Kelola kategori',
    path: '/categories',
    bg: '#E5F5F0',
    color: '#085041',
    icon: (c) => (
      <Svg color={c}>
        <circle cx="5.5" cy="5.5" r="2.5"/>
        <circle cx="14.5" cy="5.5" r="2.5"/>
        <circle cx="5.5" cy="14.5" r="2.5"/>
        <rect x="12" y="12" width="5" height="5" rx="1"/>
      </Svg>
    ),
  },
  {
    key: 'Dompet',
    label: 'Dompet',
    sub: 'Antar dompet',
    path: '/wallets',          // arahkan ke wallets yang punya fitur transfer
    bg: '#FEF3E5',
    color: '#92400E',
    icon: (c) => (
        <Svg color={c}>
            <rect x="2" y="4" width="16" height="12" rx="2" />
            <path d="M10 9h1M2 7h16M4 2l-3 3h18l-3-3" />
        </Svg>
    ),
  },
  {
    key: 'tagihan',
    label: 'Tagihan',
    sub: 'Pengingat bayar',
    path: null,               // belum ada, tampilkan "segera"
    bg: '#E5EEF5',
    color: '#1D4ED8',
    soon: true,
    icon: (c) => (
      <Svg color={c}>
        <rect x="3" y="2" width="14" height="16" rx="2"/>
        <path d="M7 6h6M7 10h6M7 14h4"/>
      </Svg>
    ),
  },
];

const ACCOUNT_ITEMS = [
  {
    key: 'profile',
    label: 'Profil saya',
    sub: 'Edit profil & keamanan akun',
    path: '/profile',
    bg: '#FDEAEA',
    color: '#DC2626',
    icon: (c) => (
      <Svg color={c}>
        <circle cx="10" cy="7" r="3.5"/>
        <path d="M3 18c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5"/>
      </Svg>
    ),
  },
  {
    key: 'analysis',
    label: 'Analisis',
    sub: 'Ringkasan & tren keuangan',
    path: '/analysis',
    bg: '#FEF9E5',
    color: '#92400E',
    icon: (c) => (
      <Svg color={c}>
        <path d="M2 16l4-5 4 3 4-7 4 4"/>
      </Svg>
    ),
  },
  {
    key: 'export',
    label: 'Ekspor data',
    sub: 'Unduh laporan Excel / PDF',
    path: '/reports',
    bg: '#FEF3E5',
    color: '#92400E',
    icon: (c) => (
      <Svg color={c}>
        <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1"/>
        <path d="M7 11l3 3 3-3M10 3v11"/>
      </Svg>
    ),
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const GridCard = ({ item, onClick }) => (
  <div
    onClick={item.soon ? undefined : onClick}
    style={{
      background: colors.surface,
      border: `1.5px solid ${colors.border}`,
      borderRadius: radius.lg || 12,
      padding: '14px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
      cursor: item.soon ? 'default' : 'pointer',
      position: 'relative',
      transition: 'transform .15s, box-shadow .15s',
      opacity: item.soon ? 0.65 : 1,
    }}
    onMouseEnter={e => { if (!item.soon) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = shadows.md || '0 4px 12px rgba(0,0,0,0.08)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
  >
    {item.soon && (
      <div style={{
        position: 'absolute', top: 8, right: 8,
        fontSize: 9, fontWeight: 700, letterSpacing: '.04em',
        background: colors.border, color: colors.textMuted,
        padding: '2px 6px', borderRadius: 99,
      }}>SEGERA</div>
    )}
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: item.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {item.icon(item.color)}
    </div>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
        {item.label}
      </div>
      <div style={{
        fontSize: 11.5, color: colors.textSecondary, marginTop: 2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {item.sub}
      </div>
    </div>
  </div>
);

const ListRow = ({ item, onClick }) => (
  <div
    onClick={item.soon ? undefined : onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 0',
      borderBottom: `1.5px solid ${colors.border}`,
      cursor: item.soon ? 'default' : 'pointer',
      opacity: item.soon ? 0.6 : 1,
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: radius.md || 10,
      background: item.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {item.icon(item.color)}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: colors.textPrimary }}>{item.label}</div>
      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{item.sub}</div>
    </div>
    {item.soon
      ? <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, background: colors.border, padding: '2px 7px', borderRadius: 99 }}>SEGERA</span>
      : <span style={{ color: colors.textMuted, fontSize: 20, lineHeight: 1 }}>›</span>
    }
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
    textTransform: 'uppercase', color: colors.textSecondary,
    opacity: .65, padding: '4px 0 10px',
  }}>
    {children}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OtherPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const go = (path) => {
    if (!path) return;
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background || '#F6F7F9',
      fontFamily: fonts.sans,
      padding: '1.25rem',
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
            Lainnya
          </h1>
          <p style={{ fontSize: 13, color: colors.textSecondary, margin: '4px 0 0' }}>
            Fitur &amp; pengaturan tambahan
          </p>
        </div>

        {/* ── KELOLA KEUANGAN (grid 2 col) ── */}
        <div style={{
          background: colors.surface,
          border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl || 16,
          padding: '1.25rem',
          marginBottom: 14,
          boxShadow: shadows.sm,
        }}>
          <SectionLabel>Kelola Keuangan</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FINANCE_ITEMS.map(item => (
              <GridCard key={item.key} item={item} onClick={() => go(item.path)} />
            ))}
          </div>
        </div>

        {/* ── AKUN & PENGATURAN (list) ── */}
        <div style={{
          background: colors.surface,
          border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl || 16,
          padding: '1.25rem 1.25rem 0.5rem',
          marginBottom: 14,
          boxShadow: shadows.sm,
        }}>
          <SectionLabel>Akun &amp; Pengaturan</SectionLabel>
          {ACCOUNT_ITEMS.map(item => (
            <ListRow key={item.key} item={item} onClick={() => go(item.path)} />
          ))}
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '13px',
            borderRadius: radius.lg || 12,
            border: `1.5px solid ${colors.danger}`,
            background: 'transparent',
            color: colors.danger,
            fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: fonts.sans,
          }}
        >
          Keluar dari akun
        </button>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: colors.textMuted, marginTop: 16 }}>
          DompetKu v1.0.0 · © 2026
        </div>

      </div>
    </div>
  );
}