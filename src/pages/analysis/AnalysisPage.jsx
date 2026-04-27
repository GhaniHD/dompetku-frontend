// src/pages/analysis/AnalysisPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { colors, fonts } from '../../styles/variables';
import {
  TrendingUp, TrendingDown, PiggyBank, AlertTriangle,
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  Sparkles, BarChart2, RefreshCw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
);

// ── helpers ───────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return 'Rp 0';
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${Math.round(n)}`;
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const RISK_CONFIG = {
  aman:       { color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2,  label: 'Kondisi Aman' },
  perhatian:  { color: '#f59e0b', bg: '#fffbeb', icon: AlertTriangle, label: 'Perlu Perhatian' },
  kritis:     { color: '#ef4444', bg: '#fef2f2', icon: AlertCircle,   label: 'Kondisi Kritis' },
  unknown:    { color: '#6b7280', bg: '#f9fafb', icon: AlertCircle,   label: 'Tidak Diketahui' },
};

// ── sub-components ────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, color, bg, delay = 0 }) {
  return (
    <div className="fade-in" style={{
      background: colors.surface, borderRadius: 14,
      border: `1px solid ${colors.border}`,
      padding: '14px 16px', animationDelay: `${delay}ms`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.sans, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 800, color,
          fontFamily: fonts.mono, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, delay = 0 }) {
  return (
    <div className="fade-in" style={{
      background: colors.surface, borderRadius: 16,
      border: `1px solid ${colors.border}`,
      padding: '18px 20px', animationDelay: `${delay}ms`,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: colors.text,
        fontFamily: fonts.sans, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SkeletonBlock({ h = 180 }) {
  return (
    <div style={{
      height: h, borderRadius: 12,
      background: colors.border,
      animation: 'pulse 1.5s infinite',
    }} />
  );
}

// ══ MAIN PAGE ══════════════════════════════════════════════════════════
export default function AnalysisPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error, refetch } = useAnalysis(year);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10 }, color: '#94a3b8',
          callback: (v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v,
        },
      },
    },
  };

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn .35s ease both; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '8px 16px 24px', boxSizing: 'border-box',
        maxWidth: 900, margin: '0 auto', width: '100%',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, fontFamily: fonts.sans }}>
              Analisis Keuangan
            </div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              Insight & prediksi berbasis AI
            </div>
          </div>

          {/* Year picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setYear(y => y - 1)}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={15} color={colors.textSecondary} />
            </button>
            <div style={{ minWidth: 52, textAlign: 'center', fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.mono }}>
              {year}
            </div>
            <button
              onClick={() => setYear(y => Math.min(y + 1, new Date().getFullYear()))}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={15} color={colors.textSecondary} />
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={14} color={colors.textSecondary} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[1,2,3,4].map(i => <SkeletonBlock key={i} h={72} />)}
            </div>
            <SkeletonBlock h={220} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <SkeletonBlock h={220} />
              <SkeletonBlock h={220} />
            </div>
            <SkeletonBlock h={180} />
          </>
        )}

        {/* ── Data ── */}
        {!loading && data && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <SummaryCard delay={0}   icon={<TrendingUp size={18} color="#10b981" />}   label="Total Pemasukan"  value={fmt(data.total_income)}  color="#10b981" bg="#ecfdf5" />
              <SummaryCard delay={60}  icon={<TrendingDown size={18} color="#ef4444" />} label="Total Pengeluaran" value={fmt(data.total_expense)} color="#ef4444" bg="#fef2f2" />
              <SummaryCard delay={120} icon={<PiggyBank size={18} color="#6366f1" />}    label="Net Balance"      value={fmt(data.net_balance)}   color={data.net_balance >= 0 ? '#10b981' : '#ef4444'} bg="#eef2ff" />
              <SummaryCard delay={180} icon={<BarChart2 size={18} color="#f59e0b" />}    label="Savings Rate"     value={`${data.savings_rate ?? 0}%`} color="#f59e0b" bg="#fffbeb" />
            </div>

            {/* AI Insight */}
            {data.insight && (() => {
              const risk = RISK_CONFIG[data.insight.risk_level] ?? RISK_CONFIG.unknown;
              const RiskIcon = risk.icon;
              return (
                <div className="fade-in" style={{
                  borderRadius: 16, border: `1.5px solid ${risk.color}33`,
                  background: risk.bg, padding: '16px 18px',
                  animationDelay: '200ms',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${risk.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RiskIcon size={16} color={risk.color} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: risk.color, fontFamily: fonts.sans }}>{risk.label}</div>
                      <div style={{ fontSize: 10, color: colors.textSecondary }}>Analisis AI berdasarkan data keuanganmu</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: colors.textMuted }}>
                      <Sparkles size={11} /> AI Insight
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, margin: '0 0 12px' }}>
                    {data.insight.summary}
                  </p>

                  {/* Highlights */}
                  {data.insight.highlights?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 6 }}>📌 Poin Penting</div>
                      {data.insight.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                          <span style={{ color: risk.color, fontSize: 11, flexShrink: 0 }}>•</span>
                          <span style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {data.insight.recommendations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 6 }}>💡 Rekomendasi</div>
                      {data.insight.recommendations.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                          <span style={{ color: '#6366f1', fontSize: 11, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Line chart — Tren Bulanan */}
            {data.monthly_trend?.length > 0 && (
              <SectionCard title={<><TrendingUp size={14} color={colors.primary} /> Tren Pemasukan vs Pengeluaran</>} delay={250}>
                <div style={{ height: 200 }}>
                  <Line
                    data={{
                      labels: data.monthly_trend.map(t => t.label || MONTH_NAMES[t.month] || `Bln ${t.month}`),
                      datasets: [
                        {
                          label: 'Pemasukan',
                          data: data.monthly_trend.map(t => t.income),
                          borderColor: '#10b981', backgroundColor: '#10b98120',
                          tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2,
                        },
                        {
                          label: 'Pengeluaran',
                          data: data.monthly_trend.map(t => t.expense),
                          borderColor: '#ef4444', backgroundColor: '#ef444420',
                          tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      ...chartOpts,
                      plugins: {
                        ...chartOpts.plugins,
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: { boxWidth: 10, font: { size: 11 }, color: '#64748b', padding: 16 },
                        },
                      },
                    }}
                  />
                </div>
              </SectionCard>
            )}

            {/* Donut charts — Breakdown Kategori */}
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: 14 }}>
              {data.expense_by_category?.length > 0 && (
                <SectionCard title="🔴 Pengeluaran per Kategori" delay={300}>
                  <div style={{ height: 180 }}>
                    <Doughnut
                      data={{
                        labels: data.expense_by_category.map(c => c.category_name),
                        datasets: [{
                          data: data.expense_by_category.map(c => c.total),
                          backgroundColor: data.expense_by_category.map(c => c.color),
                          borderWidth: 2, borderColor: colors.surface,
                        }],
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 10 }, color: '#64748b', padding: 10 },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                const c = data.expense_by_category[ctx.dataIndex];
                                return ` ${fmt(c.total)} (${c.percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </SectionCard>
              )}

              {data.income_by_category?.length > 0 && (
                <SectionCard title="🟢 Pemasukan per Kategori" delay={360}>
                  <div style={{ height: 180 }}>
                    <Doughnut
                      data={{
                        labels: data.income_by_category.map(c => c.category_name),
                        datasets: [{
                          data: data.income_by_category.map(c => c.total),
                          backgroundColor: data.income_by_category.map(c => c.color),
                          borderWidth: 2, borderColor: colors.surface,
                        }],
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 10 }, color: '#64748b', padding: 10 },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                const c = data.income_by_category[ctx.dataIndex];
                                return ` ${fmt(c.total)} (${c.percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Bar chart — Prediksi */}
            {data.prediction?.length > 0 && (
              <SectionCard title={<><Sparkles size={14} color="#f59e0b" /> Prediksi 3 Bulan ke Depan</>} delay={420}>
                <div style={{ height: 180 }}>
                  <Bar
                    data={{
                      labels: data.prediction.map(p => p.label),
                      datasets: [
                        {
                          label: 'Prediksi Pemasukan',
                          data: data.prediction.map(p => p.predicted_income),
                          backgroundColor: '#10b98166', borderColor: '#10b981',
                          borderWidth: 1.5, borderRadius: 6,
                        },
                        {
                          label: 'Prediksi Pengeluaran',
                          data: data.prediction.map(p => p.predicted_expense),
                          backgroundColor: '#ef444466', borderColor: '#ef4444',
                          borderWidth: 1.5, borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      ...chartOpts,
                      plugins: {
                        ...chartOpts.plugins,
                        legend: {
                          display: true, position: 'bottom',
                          labels: { boxWidth: 10, font: { size: 11 }, color: '#64748b', padding: 16 },
                        },
                      },
                    }}
                  />
                </div>

                {/* Confidence badges */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {data.prediction.map((p, i) => {
                    const confColor = p.confidence === 'high' ? '#10b981' : p.confidence === 'medium' ? '#f59e0b' : '#94a3b8';
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: `${confColor}15`, borderRadius: 20,
                        padding: '3px 10px', fontSize: 10, color: confColor, fontWeight: 600,
                      }}>
                        {p.label}: {p.confidence === 'high' ? 'Akurasi Tinggi' : p.confidence === 'medium' ? 'Akurasi Sedang' : 'Estimasi'}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Spending patterns */}
            {data.insight?.spending_patterns?.length > 0 && (
              <SectionCard title="📊 Pola Pengeluaran per Kategori" delay={480}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.insight.spending_patterns.map((p, i) => {
                    const trendColor = p.trend === 'naik' ? '#ef4444' : p.trend === 'turun' ? '#10b981' : '#6366f1';
                    const TIcon = p.trend === 'naik' ? TrendingUp : p.trend === 'turun' ? TrendingDown : BarChart2;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10,
                        background: colors.background, border: `1px solid ${colors.border}`,
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: `${trendColor}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <TIcon size={14} color={trendColor} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{p.category}</div>
                          <div style={{ fontSize: 10, color: colors.textSecondary }}>Rata-rata {fmt(p.avg_monthly)}/bln</div>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: trendColor,
                          background: `${trendColor}15`, borderRadius: 20,
                          padding: '2px 8px',
                        }}>
                          {p.trend === 'naik' ? '↑' : p.trend === 'turun' ? '↓' : '→'} {Math.abs(p.trend_pct).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Empty state */}
            {!data.monthly_trend?.length && !data.expense_by_category?.length && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textSecondary }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Belum ada data untuk tahun {year}</div>
                <div style={{ fontSize: 12 }}>Mulai catat transaksi untuk melihat analisis keuangan</div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}