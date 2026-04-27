import { colors, fonts } from '../../styles/variables';

/**
 * PageLayout — wrapper untuk semua halaman.
 * Gunakan di setiap page agar header & padding konsisten.
 *
 * @param {string}    title       - Judul halaman
 * @param {string}    subtitle    - Subjudul / deskripsi
 * @param {ReactNode} actions     - Tombol aksi di kanan header
 * @param {ReactNode} children    - Konten halaman
 */
export default function PageLayout({ title, subtitle, actions, children }) {
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.sans, color: colors.textPrimary }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Header */}
        <div
          className="fade-in"
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28, flexWrap: 'wrap', gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>{title}</h1>
            {subtitle && (
              <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{subtitle}</p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
        </div>

        {/* Konten */}
        {children}
      </div>
    </div>
  );
}