// src/pages/profile/ProfilePage.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { useAnimateIn } from '../../hooks/useAnimations';
import { AuthContext } from '../../context/AuthContext';
import { colors, fonts, radius, shadows } from '../../styles/variables';

// ─── Komponen Kecil ──────────────────────────────────────────────────────────

const Avatar = ({ src, name, size = 80, uploading, onClick }) => {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', width: size, height: size, cursor: 'pointer', flexShrink: 0 }}
      title="Klik untuk ganti foto"
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          style={{
            width: size, height: size, borderRadius: '50%',
            objectFit: 'cover', border: `2px solid ${colors.border}`,
          }}
        />
      ) : (
        <div
          style={{
            width: size, height: size, borderRadius: '50%',
            background: colors.primaryLight || '#E1F5EE',
            color: colors.primary || '#085041',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 600, fontFamily: fonts.sans,
          }}
        >
          {initials}
        </div>
      )}
      <div
        className="avatar-hover-overlay"
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: uploading ? 1 : 0, transition: 'opacity .2s',
        }}
      >
        {uploading
          ? <div style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
        }
      </div>
      <div style={{
        position: 'absolute', bottom: 2, right: 2, width: 24, height: 24,
        borderRadius: '50%', background: colors.primary, border: `2px solid ${colors.surface}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <style>{`
        div:hover .avatar-hover-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const StatCardTheme = ({ label, value, sub, color = 'teal' }) => {
  const visible = useAnimateIn(0);
  const colorMap = {
    green: { bg: colors.successLight, text: colors.success },
    teal:  { bg: colors.primaryLight, text: colors.primary },
    amber: { bg: colors.warningLight || '#FAEEDA', text: colors.warning || '#633806' },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <div style={{
      background: c.bg, borderRadius: radius.lg, padding: '14px 12px',
      border: `1.5px solid ${colors.border}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: c.text, fontFamily: fonts.mono }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
};

const Alert = ({ type, msg, onClose }) => {
  if (!msg) return null;
  const styles = {
    success: { bg: colors.successLight, border: colors.success, text: colors.success },
    error:   { bg: colors.dangerLight,  border: colors.danger,  text: colors.danger },
    warning: { bg: colors.warningLight || '#FAEEDA', border: '#FAC775', text: '#633806' },
  };
  const s = styles[type] || styles.success;

  return (
    <div style={{
      background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: radius.lg,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, color: s.text, fontSize: 13, fontWeight: 500,
    }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.text, fontSize: 18 }}
      >×</button>
    </div>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    {label ? (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginBottom: 6 }}>
        {label}
      </label>
    ) : null}
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      style={{
        width: '100%', padding: '12px 14px',
        border: `1.5px solid ${colors.border}`, borderRadius: radius.lg,
        fontSize: 14, background: colors.surface, color: colors.textPrimary,
        outline: 'none', fontFamily: fonts.sans, opacity: disabled ? 0.7 : 1,
        boxSizing: 'border-box',
      }}
    />
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', disabled, loading: isLoading }) => {
  const variants = {
    primary: { bg: colors.primary,   color: '#fff',               border: 'none' },
    danger:  { bg: 'transparent',    color: colors.danger,        border: `1.5px solid ${colors.danger}` },
    ghost:   { bg: 'transparent',    color: colors.textSecondary, border: `1.5px solid ${colors.border}` },
  };
  const v = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        flex: 1, padding: '12px 16px', borderRadius: radius.lg,
        fontSize: 14, fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        fontFamily: fonts.sans, transition: 'all .2s',
        opacity: disabled || isLoading ? 0.75 : 1,
        background: v.bg, color: v.color, border: v.border,
      }}
    >
      {isLoading ? 'Menyimpan...' : children}
    </button>
  );
};

// ─── Modal Konfirmasi ─────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, confirmLabel, onConfirm, onCancel, loading, variant = 'primary' }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }}>
    <div style={{
      background: colors.surface, borderRadius: radius.xl,
      padding: '1.75rem', maxWidth: 360, width: '100%',
      border: `1.5px solid ${colors.border}`,
      boxShadow: shadows.lg,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: variant === 'danger' ? colors.dangerLight : colors.primaryLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        {variant === 'danger' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.65, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} disabled={loading}>Batal</Btn>
        <Btn variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Btn>
      </div>
    </div>
  </div>
);

// ─── Settings Modal ───────────────────────────────────────────────────────────

const ModalShell = ({ title, icon, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 1001, padding: 0,
  }}>
    <div style={{
      background: colors.surface, borderRadius: '20px 20px 0 0',
      width: '100%', maxWidth: 520, maxHeight: '85vh',
      border: `1.5px solid ${colors.border}`,
      boxShadow: shadows.lg,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Handle bar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
        <div style={{ width: 40, height: 4, borderRadius: 9999, background: colors.border }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderBottom: `1.5px solid ${colors.border}`,
      }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, flex: 1 }}>{title}</div>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1.5px solid ${colors.border}`,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.textSecondary, fontSize: 18, fontFamily: fonts.sans,
          }}
        >×</button>
      </div>

      {/* Content */}
      <div style={{ overflow: 'auto', padding: '20px', flex: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: 44, height: 24, borderRadius: 9999,
      background: value ? colors.primary : colors.border,
      position: 'relative', cursor: 'pointer',
      transition: 'background .2s', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', top: 3, left: value ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%',
      background: '#fff', transition: 'left .2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </div>
);

const SettingRow = ({ label, sub, value, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 0', borderBottom: `1.5px solid ${colors.border}`,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{sub}</div>}
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
    color: colors.textSecondary, opacity: .7,
    padding: '16px 0 8px', textTransform: 'uppercase',
  }}>
    {children}
  </div>
);

const RadioRow = ({ label, sub, selected, onSelect }) => (
  <div
    onClick={onSelect}
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 0', borderBottom: `1.5px solid ${colors.border}`,
      cursor: 'pointer',
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{sub}</div>}
    </div>
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      border: `2px solid ${selected ? colors.primary : colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {selected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary }} />}
    </div>
  </div>
);

// Panel Notifikasi
const NotifikasiPanel = () => {
  const [settings, setSettings] = useState({
    transaksi: true,
    anggaran: true,
    laporan: false,
    promo: false,
    email: true,
    push: true,
  });
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <SectionTitle>Notifikasi Transaksi</SectionTitle>
      <SettingRow label="Transaksi masuk & keluar" sub="Notifikasi setiap ada transaksi baru" value={settings.transaksi} onChange={() => toggle('transaksi')} />
      <SettingRow label="Peringatan anggaran" sub="Notifikasi saat anggaran hampir habis" value={settings.anggaran} onChange={() => toggle('anggaran')} />
      <SettingRow label="Laporan bulanan" sub="Ringkasan keuangan setiap akhir bulan" value={settings.laporan} onChange={() => toggle('laporan')} />
      <SectionTitle>Saluran Notifikasi</SectionTitle>
      <SettingRow label="Email" sub="Kirim notifikasi via email" value={settings.email} onChange={() => toggle('email')} />
      <SettingRow label="Push Notification" sub="Notifikasi di perangkat" value={settings.push} onChange={() => toggle('push')} />
      <SettingRow label="Promosi & info" sub="Update fitur dan penawaran" value={settings.promo} onChange={() => toggle('promo')} />
      <div style={{ marginTop: 20, padding: '12px 16px', background: colors.primaryLight, borderRadius: radius.lg, fontSize: 13, color: colors.primary }}>
        💡 Perubahan notifikasi disimpan otomatis ke perangkat ini.
      </div>
    </>
  );
};

// Panel Privasi
const PrivasiPanel = () => {
  const [settings, setSettings] = useState({
    biometrik: false,
    sembunyikanSaldo: false,
    sessionAlert: true,
    dataAnalitik: true,
  });
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <SectionTitle>Keamanan Akun</SectionTitle>
      <SettingRow label="Login biometrik" sub="Gunakan sidik jari atau Face ID" value={settings.biometrik} onChange={() => toggle('biometrik')} />
      <SettingRow label="Peringatan login baru" sub="Notifikasi jika ada login dari perangkat lain" value={settings.sessionAlert} onChange={() => toggle('sessionAlert')} />
      <SectionTitle>Privasi Data</SectionTitle>
      <SettingRow label="Sembunyikan saldo" sub="Tampilkan saldo sebagai ****" value={settings.sembunyikanSaldo} onChange={() => toggle('sembunyikanSaldo')} />
      <SettingRow label="Izinkan analitik" sub="Bantu kami tingkatkan layanan" value={settings.dataAnalitik} onChange={() => toggle('dataAnalitik')} />
      <SectionTitle>Sesi Aktif</SectionTitle>
      <div style={{ padding: '14px', background: colors.successLight, borderRadius: radius.lg, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Perangkat ini</div>
        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Chrome · Windows · Aktif sekarang</div>
      </div>
      <button style={{
        width: '100%', padding: '12px', borderRadius: radius.lg,
        border: `1.5px solid ${colors.danger}`, background: 'transparent',
        color: colors.danger, fontSize: 14, fontWeight: 600,
        cursor: 'pointer', fontFamily: fonts.sans,
      }}>
        Keluar dari semua perangkat lain
      </button>
    </>
  );
};

// Panel Preferensi
const PreferensiPanel = () => {
  const [bahasa, setBahasa] = useState('id');
  const [tema, setTema] = useState('system');
  const [matauang, setMatauang] = useState('IDR');

  return (
    <>
      <SectionTitle>Bahasa</SectionTitle>
      <RadioRow label="Bahasa Indonesia" selected={bahasa === 'id'} onSelect={() => setBahasa('id')} />
      <RadioRow label="English" selected={bahasa === 'en'} onSelect={() => setBahasa('en')} />
      <SectionTitle>Tema Tampilan</SectionTitle>
      <RadioRow label="🌞 Terang" sub="Tampilan latar putih" selected={tema === 'light'} onSelect={() => setTema('light')} />
      <RadioRow label="🌙 Gelap" sub="Tampilan latar hitam" selected={tema === 'dark'} onSelect={() => setTema('dark')} />
      <RadioRow label="⚙️ Ikuti sistem" sub="Otomatis sesuai pengaturan perangkat" selected={tema === 'system'} onSelect={() => setTema('system')} />
      <SectionTitle>Mata Uang Default</SectionTitle>
      <RadioRow label="🇮🇩 IDR — Rupiah" selected={matauang === 'IDR'} onSelect={() => setMatauang('IDR')} />
      <RadioRow label="🇺🇸 USD — US Dollar" selected={matauang === 'USD'} onSelect={() => setMatauang('USD')} />
      <RadioRow label="🇸🇬 SGD — Singapore Dollar" selected={matauang === 'SGD'} onSelect={() => setMatauang('SGD')} />
    </>
  );
};

// Panel Bantuan
const BantuanPanel = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'Bagaimana cara menambah transaksi?', a: 'Buka menu Transaksi lalu klik tombol + di pojok kanan bawah. Pilih jenis transaksi, isi nominal, kategori, dan dompet, lalu simpan.' },
    { q: 'Apakah data saya aman?', a: 'Ya, semua data dienkripsi end-to-end dan disimpan di server yang aman. Kami tidak menjual data kamu ke pihak ketiga.' },
    { q: 'Bagaimana cara mengatur anggaran?', a: 'Buka menu Anggaran, klik Tambah Anggaran, pilih kategori dan tentukan batas pengeluaran per bulan.' },
    { q: 'Bisa export laporan ke Excel?', a: 'Ya, buka menu Laporan lalu klik ikon download di pojok kanan atas untuk mengunduh laporan dalam format Excel atau PDF.' },
  ];

  return (
    <>
      <SectionTitle>FAQ</SectionTitle>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: `1.5px solid ${colors.border}` }}>
          <div
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{faq.q}</div>
            <span style={{
              color: colors.textMuted, fontSize: 18,
              transform: openFaq === i ? 'rotate(90deg)' : 'none',
              transition: 'transform .2s', display: 'inline-block',
            }}>›</span>
          </div>
          {openFaq === i && (
            <div style={{ fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.65, paddingBottom: 14 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
      <SectionTitle>Hubungi Kami</SectionTitle>
      {[
        { icon: '📧', label: 'Email Support', sub: 'support@dompetku.id' },
        { icon: '💬', label: 'Live Chat', sub: 'Senin–Jumat, 09.00–17.00 WIB' },
        { icon: '📋', label: 'Laporkan Bug', sub: 'Temukan masalah? Beritahu kami' },
      ].map((item) => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '13px 0', borderBottom: `1.5px solid ${colors.border}`, cursor: 'pointer',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: radius.md,
            background: colors.primaryLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{item.label}</div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{item.sub}</div>
          </div>
          <span style={{ color: colors.textMuted, fontSize: 20 }}>›</span>
        </div>
      ))}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
        DompetKu v1.0.0 · © 2026 DompetKu
      </div>
    </>
  );
};

// Settings Modal Router
const SETTINGS_CONFIG = {
  notifikasi: { title: 'Notifikasi',          icon: '🔔', Panel: NotifikasiPanel },
  privasi:    { title: 'Privasi & Keamanan',  icon: '🛡️', Panel: PrivasiPanel    },
  preferensi: { title: 'Preferensi Aplikasi', icon: '⚙️', Panel: PreferensiPanel },
  bantuan:    { title: 'Bantuan & Dukungan',  icon: '💬', Panel: BantuanPanel    },
};

const SettingsModal = ({ type, onClose }) => {
  const config = SETTINGS_CONFIG[type];
  if (!config) return null;
  const { title, icon, Panel } = config;
  return (
    <ModalShell title={title} icon={icon} onClose={onClose}>
      <Panel />
    </ModalShell>
  );
};

// ─── Halaman Utama ────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    profile, avatarPreview, loading, saving, uploadingAvatar,
    error, successMsg, fetchProfile, updateProfile,
    changePassword, uploadAvatar, clearMessages,
  } = useProfile();

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('edit');

  const [form, setForm] = useState({
    name:  '',
    email: '',
  });

  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [activeSettings, setActiveSettings] = useState(null);

  const pendingAvatarFile = useRef(null);

  // Sync form dengan profile yang sudah di-fetch
  useEffect(() => {
    if (profile) {
      setForm({
        name:  profile.name  || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Avatar ──────────────────────────────────────────────────────────────────

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingAvatarFile.current = file;
    setConfirmDialog({ type: 'avatar' });
    e.target.value = '';
  };

  // ── Simpan Profil ───────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    if (!form.name.trim()) return;
    setConfirmDialog({ type: 'save' });
  };

  // ── Eksekusi setelah konfirmasi ─────────────────────────────────────────────

  const handleConfirm = async () => {
    try {
      if (confirmDialog?.type === 'save') {
        await updateProfile({ name: form.name.trim(), email: form.email.trim() });
      } else if (confirmDialog?.type === 'avatar') {
        const file = pendingAvatarFile.current;
        if (file) {
          await uploadAvatar(file);
          pendingAvatarFile.current = null;
        }
      }
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleCancelConfirm = () => {
    pendingAvatarFile.current = null;
    setConfirmDialog(null);
  };

  // ── Ganti Password ──────────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    await changePassword({
      oldPassword:     pwForm.old,
      newPassword:     pwForm.new,
      confirmPassword: pwForm.confirm,
    });
    if (!error) setPwForm({ old: '', new: '', confirm: '' });
  };

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Format helpers ──────────────────────────────────────────────────────────

  const formatRp = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const displayName  = profile?.name  || form.name  || 'Nama pengguna';
  const displayEmail = profile?.email || form.email;

  return (
    <div style={{ minHeight: '100vh', background: colors.background || 'var(--color-background-tertiary)', padding: '1.25rem', fontFamily: fonts.sans }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Input file tersembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Alert type="success" msg={successMsg} onClose={clearMessages} />
        <Alert
          type={error?.startsWith('Offline') ? 'warning' : 'error'}
          msg={error}
          onClose={clearMessages}
        />

        {/* ── KARTU PROFIL ─────────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl || 16, padding: '1.5rem',
          marginBottom: 16, boxShadow: shadows.sm,
        }}>
          {loading && !profile ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
              Memuat profil...
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                paddingBottom: '1.25rem', borderBottom: `1.5px solid ${colors.border}`,
                marginBottom: '1.25rem',
              }}>
                <Avatar
                  src={avatarPreview || profile?.avatar_url}
                  name={displayName}
                  size={76}
                  uploading={uploadingAvatar}
                  onClick={handleAvatarClick}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 19, fontWeight: 700, color: colors.textPrimary }}>{displayName}</div>
                  <div style={{ fontSize: 13.5, color: colors.textSecondary, marginTop: 3 }}>{displayEmail}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                    Bergabung sejak {formatDate(profile?.created_at)}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: colors.primaryLight, color: colors.primary,
                    fontSize: 11.5, fontWeight: 600, padding: '4px 11px',
                    borderRadius: 9999, marginTop: 8,
                  }}>
                    <div style={{ width: 8, height: 8, background: colors.primary, borderRadius: '50%' }} />
                    Akun Aktif
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <StatCardTheme
                  label="Total Saldo"
                  value={profile?.balance != null ? formatRp(profile.balance).replace('Rp\xa0', '') : '-'}
                  sub={profile?.balance != null ? formatRp(profile.balance) : ''}
                  color="green"
                />
                <StatCardTheme label="Transaksi" value={profile?.transactions ?? '-'} sub="Semua waktu"  color="teal" />
                <StatCardTheme label="Wallet"     value={profile?.wallet ?? '-'}       sub="Dompet aktif" color="amber" />
              </div>
            </>
          )}
        </div>

        {/* ── FORM EDIT / KEAMANAN ─────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl || 16, padding: '1.5rem',
          marginBottom: 16, boxShadow: shadows.sm,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            {[
              { key: 'edit',     label: 'Edit Profil' },
              { key: 'security', label: 'Keamanan' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '8px 18px', borderRadius: 9999, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: fonts.sans,
                  background: activeTab === t.key ? colors.primary : 'transparent',
                  color:      activeTab === t.key ? '#fff' : colors.textSecondary,
                  border:     activeTab === t.key ? 'none' : `1.5px solid ${colors.border}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'edit' && (
            <>
              <div
                onClick={handleAvatarClick}
                style={{
                  background: colors.primaryLight, border: `1.5px dashed ${colors.primary}`,
                  borderRadius: radius.lg, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 20, cursor: 'pointer',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.25">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div style={{ fontSize: 13, color: colors.primary, fontWeight: 500 }}>
                  Upload foto profil — JPG, PNG, WebP (maks 2 MB)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Nama lengkap"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  disabled={saving}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  disabled={saving}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Btn onClick={handleSaveProfile} loading={saving} disabled={!form.name.trim()}>
                  Simpan perubahan
                </Btn>
                <Btn variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Hapus akun
                </Btn>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <Input
                label="Password saat ini"
                type="password"
                value={pwForm.old}
                onChange={(e) => setPwForm((p) => ({ ...p, old: e.target.value }))}
                placeholder="Masukkan password lama"
                disabled={saving}
              />
              <Input
                label="Password baru"
                type="password"
                value={pwForm.new}
                onChange={(e) => setPwForm((p) => ({ ...p, new: e.target.value }))}
                placeholder="Min. 8 karakter"
                disabled={saving}
              />
              <Input
                label="Konfirmasi password baru"
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Ulangi password baru"
                disabled={saving}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Btn
                  onClick={handleChangePassword}
                  loading={saving}
                  disabled={!pwForm.old || !pwForm.new || !pwForm.confirm}
                >
                  Perbarui password
                </Btn>
                <Btn variant="ghost" onClick={() => setPwForm({ old: '', new: '', confirm: '' })}>
                  Batal
                </Btn>
              </div>
            </>
          )}
        </div>

        {/* ── MENU LAINNYA ─────────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl || 16, padding: '1.5rem 1.5rem 0.75rem',
          marginBottom: 16, boxShadow: shadows.sm,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: '1rem' }}>
            Pengaturan lainnya
          </div>
          {[
            { key: 'notifikasi', label: 'Notifikasi',          icon: '🔔', bg: colors.primaryLight },
            { key: 'privasi',    label: 'Privasi & keamanan',  icon: '🛡️', bg: colors.warningLight || '#FAEEDA' },
            { key: 'preferensi', label: 'Preferensi aplikasi', icon: '⚙️', bg: colors.purpleLight  || '#EEEDFE' },
            { key: 'bantuan',    label: 'Bantuan & dukungan',  icon: '💬', bg: colors.successLight },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveSettings(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0', borderBottom: `1.5px solid ${colors.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: radius.md, background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: colors.textPrimary }}>
                {item.label}
              </span>
              <span style={{ color: colors.textMuted, fontSize: 20 }}>›</span>
            </div>
          ))}

          <button
            onClick={handleLogout}
            style={{
              width: '100%', marginTop: '1rem', padding: '12px',
              borderRadius: radius.lg, border: `1.5px solid ${colors.danger}`,
              background: 'transparent', color: colors.danger,
              fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
              fontFamily: fonts.sans,
            }}
          >
            Keluar dari akun
          </button>
        </div>

        {/* ── MODAL KONFIRMASI (simpan / ganti avatar) ──────────────────────── */}
        {confirmDialog && (
          <ConfirmModal
            title={confirmDialog.type === 'save' ? 'Simpan perubahan?' : 'Ganti foto profil?'}
            message={
              confirmDialog.type === 'save'
                ? 'Apakah kamu yakin ingin menyimpan perubahan data profil ini?'
                : 'Apakah kamu yakin ingin mengganti foto profil dengan gambar yang dipilih?'
            }
            confirmLabel={confirmDialog.type === 'save' ? 'Ya, simpan' : 'Ya, ganti foto'}
            variant="primary"
            loading={saving || uploadingAvatar}
            onConfirm={handleConfirm}
            onCancel={handleCancelConfirm}
          />
        )}

        {/* ── MODAL HAPUS AKUN ─────────────────────────────────────────────── */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}>
            <div style={{
              background: colors.surface, borderRadius: radius.xl,
              padding: '1.75rem', maxWidth: 380, width: '100%',
              border: `1.5px solid ${colors.border}`,
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: colors.danger, marginBottom: 10 }}>
                Hapus Akun
              </div>
              <p style={{ fontSize: 14.5, color: colors.textSecondary, lineHeight: 1.65, marginBottom: 16 }}>
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Semua data kamu akan dihapus permanen.
              </p>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, marginBottom: 10 }}>
                Ketik <strong>HAPUS</strong> untuk konfirmasi:
              </p>
              <Input
                label=""
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="HAPUS"
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Btn
                  variant="ghost"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                >
                  Batal
                </Btn>
                <Btn
                  variant="danger"
                  disabled={deleteInput !== 'HAPUS'}
                  loading={saving}
                  onClick={() => { /* TODO: deleteAccount */ }}
                >
                  Hapus permanen
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL SETTINGS ───────────────────────────────────────────────── */}
        {activeSettings && (
          <SettingsModal
            type={activeSettings}
            onClose={() => setActiveSettings(null)}
          />
        )}

      </div>
    </div>
  );
};

export default ProfilePage;