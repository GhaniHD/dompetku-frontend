// src/components/layout/AppLayout.jsx
import { useState, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../styles/variables';
import Sidebar from '../ui/Sidebar';
import BottomNav from '../ui/BottomNav';
import { useIsMobile } from '../../hooks/useIsMobile';
import NotificationBell from '../ui/NotificationBell';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isMobile = useIsMobile();

  const date = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const pageTitles = {
    '/dashboard':  'Beranda',
    '/transaksi':  'Transaksi',
    '/wallets':    'Dompet',
    '/categories': 'Kategori',
    '/profile':    'Profil',
    '/analysis':   'Analisis',
    '/reports':    'Laporan',
    '/budget':     'Anggaran',
  };

  const pageTitle = pageTitles[location.pathname] ?? 'DompetKu';
  const isHome = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>

      {!isMobile && <Sidebar open={sidebarOpen} />}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        paddingBottom: isMobile ? 64 : 0,
        overflowX: 'hidden',
      }}>

        {/* ── Topbar ── */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: isMobile ? '0 16px' : '0 24px',
          height: isMobile ? 52 : 64,
          flexShrink: 0,
          background: colors.surface,
          borderBottom: `1.5px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>

          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1.5px solid ${colors.border}`,
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.textSecondary, flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            </button>
          )}

          {isMobile && (
            <div style={{
              fontFamily: fonts.sans, fontWeight: 800,
              fontSize: 15, color: colors.primary,
              letterSpacing: '-0.3px', flexShrink: 0,
            }}>
              💰 DompetKu
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {!isMobile && (
              <>
                <div style={{
                  fontFamily: fonts.sans, fontWeight: 800,
                  fontSize: 16, color: colors.text, lineHeight: 1.2,
                }}>
                  {isHome ? `Hai, ${user?.name ?? 'Pengguna'} 👋` : pageTitle}
                </div>
                <div style={{
                  fontFamily: fonts.sans, fontSize: 12,
                  color: colors.textSecondary, marginTop: 1,
                }}>
                  {date}
                </div>
              </>
            )}

            {isMobile && !isHome && (
              <div style={{
                fontFamily: fonts.sans, fontWeight: 700,
                fontSize: 15, color: colors.text,
                textAlign: 'center',
              }}>
                {pageTitle}
              </div>
            )}

            {isMobile && isHome && (
              <div style={{
                fontFamily: fonts.sans, fontWeight: 700,
                fontSize: 14, color: colors.text,
              }}>
                Hai, {user?.name ?? 'Pengguna'} 👋
              </div>
            )}
          </div>

          {/* ── Bell → NotificationBell component ── */}
          <NotificationBell />
        </header>

        <main style={{
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}>
          <Outlet />
        </main>

      </div>

      {isMobile && <BottomNav />}

    </div>
  );
}