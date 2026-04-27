// src/pages/profile/SettingsModal.jsx
import { useState } from 'react';
import { colors, fonts, radius, shadows } from '../../styles/variables';

// ── Shell modal dengan header & close ────────────────────────────────────────
const ModalShell = ({ title, icon, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 1000, padding: '0',
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

// ── Toggle Switch ─────────────────────────────────────────────────────────────
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

// ── Row setting dengan toggle ─────────────────────────────────────────────────
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

// ── Section label ─────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
    color: colors.textSecondary, opacity: .7,
    padding: '16px 0 8px', textTransform: 'uppercase',
  }}>
    {children}
  </div>
);

// ── Pilihan radio ─────────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════
// Panel Notifikasi
// ════════════════════════════════════════════════════════════════════════════
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

// ════════════════════════════════════════════════════════════════════════════
// Panel Privasi & Keamanan
// ════════════════════════════════════════════════════════════════════════════
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
      <div style={{
        padding: '14px', background: colors.successLight,
        borderRadius: radius.lg, marginBottom: 10,
      }}>
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

// ════════════════════════════════════════════════════════════════════════════
// Panel Preferensi Aplikasi
// ════════════════════════════════════════════════════════════════════════════
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

// ════════════════════════════════════════════════════════════════════════════
// Panel Bantuan & Dukungan
// ════════════════════════════════════════════════════════════════════════════
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
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 0', cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{faq.q}</div>
            <span style={{
              color: colors.textMuted, fontSize: 18,
              transform: openFaq === i ? 'rotate(90deg)' : 'none',
              transition: 'transform .2s', display: 'inline-block',
            }}>›</span>
          </div>
          {openFaq === i && (
            <div style={{
              fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.65,
              paddingBottom: 14,
            }}>
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
          padding: '13px 0', borderBottom: `1.5px solid ${colors.border}`,
          cursor: 'pointer',
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

// ════════════════════════════════════════════════════════════════════════════
// Export utama
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  notifikasi: { title: 'Notifikasi',         icon: '🔔', Panel: NotifikasiPanel },
  privasi:    { title: 'Privasi & Keamanan', icon: '🛡️', Panel: PrivasiPanel    },
  preferensi: { title: 'Preferensi Aplikasi',icon: '⚙️', Panel: PreferensiPanel },
  bantuan:    { title: 'Bantuan & Dukungan', icon: '💬', Panel: BantuanPanel    },
};

export default function SettingsModal({ type, onClose }) {
  const config = CONFIG[type];
  if (!config) return null;
  const { title, icon, Panel } = config;

  return (
    <ModalShell title={title} icon={icon} onClose={onClose}>
      <Panel />
    </ModalShell>
  );
}