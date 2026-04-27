import { useState, useEffect } from 'react';
import { colors, fonts } from '../../styles/variables';

/* ─────────────────────────────────────────────
   BarChart — Pengeluaran 7 Hari
   Props:
     data: Array<{ day: string, amount: number }>
   ───────────────────────────────────────────── */
export function BarChart({ data = [] }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered]   = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const fmt = (n) => 'Rp ' + Math.abs(n).toLocaleString('id-ID');

  // Fallback jika data kosong
  if (!data.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 0',
        color: colors.textMuted, fontSize: 12,
        fontFamily: fonts.sans,
      }}>
        Belum ada data pengeluaran
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount), 1); // min 1 biar tidak NaN

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: 8 }}>
        {data.map((d, i) => {
          const h     = animated ? Math.round((d.amount / max) * 110) : 4;
          const isHov = hovered === i;
          return (
            <div
              key={d.day + i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'flex-end', height: 110 }}>
                {isHov && (
                  <div style={{
                    position: 'absolute', top: -24, left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9, background: colors.textPrimary, color: '#fff',
                    padding: '2px 6px', borderRadius: 5,
                    whiteSpace: 'nowrap', fontFamily: fonts.mono, zIndex: 10,
                  }}>
                    {fmt(d.amount)}
                  </div>
                )}
                <div style={{
                  width: '100%',
                  height: d.amount === 0 ? 4 : h,   // tetap tampil sedikit walau 0
                  borderRadius: '6px 6px 0 0',
                  background: isHov ? colors.primary : colors.primaryLight,
                  transition: 'height .7s cubic-bezier(.34,1.56,.64,1), background .2s',
                  transitionDelay: `${i * 0.06}s`,
                  opacity: d.amount === 0 ? 0.3 : 1,
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {data.map((d, i) => (
          <div key={d.day + i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
            {d.day}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DonutChart — Distribusi Pengeluaran
   Props:
     categories:  Array<{ name: string, pct: number, color: string }>
     totalLabel:  string  (misal "3,24jt")
   ───────────────────────────────────────────── */
export function DonutChart({ categories = [], totalLabel = '0' }) {
  const [animated, setAnimated] = useState(false);
  const size = 120, cx = 60, cy = 60, R = 48, r = 32;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Fallback jika tidak ada kategori
  if (!categories.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 0',
        color: colors.textMuted, fontSize: 12,
        fontFamily: fonts.sans,
      }}>
        Belum ada data kategori
      </div>
    );
  }

  const arcs = categories.reduce((acc, cat) => {
    const sweep = (cat.pct / 100) * 360;
    const a1    = (acc.angle * Math.PI) / 180;
    const a2    = ((acc.angle + sweep) * Math.PI) / 180;
    const x1    = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2    = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const ix1   = cx + r * Math.cos(a1), iy1 = cy + r * Math.sin(a1);
    const ix2   = cx + r * Math.cos(a2), iy2 = cy + r * Math.sin(a2);
    const lg    = sweep > 180 ? 1 : 0;
    const d     = `M${ix1},${iy1} L${x1},${y1} A${R},${R} 0 ${lg},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${lg},0 ${ix1},${iy1} Z`;
    acc.arcs.push({ ...cat, d });
    acc.angle += sweep;
    return acc;
  }, { angle: -90, arcs: [] }).arcs;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          <path
            key={arc.name} d={arc.d} fill={arc.color}
            style={{ opacity: animated ? 1 : 0, transition: `opacity .4s ease ${i * 0.08 + 0.3}s` }}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={9} fill={colors.textMuted} fontFamily={fonts.mono}>total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={colors.textPrimary} fontFamily={fonts.mono}>
          {totalLabel}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 120 }}>
        {categories.map((cat) => (
          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>{cat.name}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.mono }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}