// src/components/ui/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { colors, fonts } from '../../styles/variables';
import { Check, CheckCheck, Trash2, X, BellOff } from 'lucide-react';

// ── Format waktu relatif ───────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

// ── Single notification item ───────────────────────────────────────────
function NotifItem({ notif, onRead, onDelete }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px',
        background: notif.read ? 'transparent' : `${colors.primary}08`,
        borderBottom: `1px solid ${colors.border}`,
        transition: 'background .15s',
      }}
    >
      {/* Dot unread */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: notif.read ? 'transparent' : colors.primary,
      }} />

      {/* Konten */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: notif.read ? 500 : 700,
          color: colors.text, fontFamily: fonts.sans,
          marginBottom: 2,
        }}>
          {notif.title}
        </div>
        <div style={{
          fontSize: 11, color: colors.textSecondary,
          lineHeight: 1.4, marginBottom: 4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {notif.message}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted }}>
          {timeAgo(notif.created_at)}
        </div>
      </div>

      {/* Aksi */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {!notif.read && (
          <button
            onClick={() => onRead(notif.id)}
            title="Tandai dibaca"
            style={iconBtn}
          >
            <Check size={12} strokeWidth={2.5} color={colors.primary} />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Hapus"
          style={iconBtn}
        >
          <Trash2 size={12} strokeWidth={2} color={colors.textMuted} />
        </button>
      </div>
    </div>
  );
}

const iconBtn = {
  width: 24, height: 24, borderRadius: 6,
  border: `1px solid ${colors.border}`,
  background: 'transparent', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
};

// ══ MAIN COMPONENT ═════════════════════════════════════════════════════
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef        = useRef(null);
  const btnRef          = useRef(null);

  const {
    notifications, totalUnread, loading,
    markAsRead, markAllAsRead, remove, clearAll,
  } = useNotifications();

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Bell button ── */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative',
          width: 34, height: 34, borderRadius: 10,
          border: `1.5px solid ${open ? colors.primary : colors.border}`,
          background: open ? `${colors.primary}10` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'border-color .15s, background .15s',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>🔔</span>
        {totalUnread > 0 && (
          <div style={{
            position: 'absolute', top: 5, right: 5,
            minWidth: 16, height: 16, borderRadius: 99,
            background: colors.danger,
            border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: fonts.mono,
            padding: '0 3px',
            transform: 'translate(4px, -4px)',
          }}>
            {totalUnread > 99 ? '99+' : totalUnread}
          </div>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 320, maxHeight: 480,
            background: colors.surface,
            borderRadius: 14, border: `1px solid ${colors.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,.12)',
            display: 'flex', flexDirection: 'column',
            zIndex: 999, overflow: 'hidden',
            animation: 'notifSlideDown .18s ease',
          }}
        >
          <style>{`
            @keyframes notifSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderBottom: `1px solid ${colors.border}`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: colors.text, fontFamily: fonts.sans }}>
                Notifikasi
              </span>
              {totalUnread > 0 && (
                <span style={{
                  background: colors.primary, color: '#fff',
                  borderRadius: 99, padding: '1px 7px',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {totalUnread}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {totalUnread > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Tandai semua dibaca"
                  style={{ ...iconBtn, width: 'auto', padding: '3px 8px', gap: 4, display: 'flex', alignItems: 'center', fontSize: 10, color: colors.primary, fontFamily: fonts.sans, fontWeight: 600, borderColor: `${colors.primary}40` }}
                >
                  <CheckCheck size={11} strokeWidth={2.5} />
                  Baca semua
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Hapus semua"
                  style={iconBtn}
                >
                  <Trash2 size={12} strokeWidth={2} color={colors.textMuted} />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={iconBtn}>
                <X size={13} strokeWidth={2} color={colors.textMuted} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted, fontSize: 12 }}>
                Memuat…
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <BellOff size={28} strokeWidth={1.5} color={colors.textMuted} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                  Tidak ada notifikasi
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  Semua aktivitas kamu akan muncul di sini
                </div>
              </div>
            )}

            {!loading && notifications.map(n => (
              <NotifItem
                key={n.id}
                notif={n}
                onRead={markAsRead}
                onDelete={remove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}