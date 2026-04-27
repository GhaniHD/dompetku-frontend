// src/pages/reports/ReportsPage.jsx
import { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, Wallet, FileText } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useMonthlyReport, useYearlyReport } from '../../hooks/useReports';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  { label: 'Januari',   value: 1  },
  { label: 'Februari',  value: 2  },
  { label: 'Maret',     value: 3  },
  { label: 'April',     value: 4  },
  { label: 'Mei',       value: 5  },
  { label: 'Juni',      value: 6  },
  { label: 'Juli',      value: 7  },
  { label: 'Agustus',   value: 8  },
  { label: 'September', value: 9  },
  { label: 'Oktober',   value: 10 },
  { label: 'November',  value: 11 },
  { label: 'Desember',  value: 12 },
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                         'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatRupiah = (amount = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(amount);

// ─── Excel Export Helper ──────────────────────────────────────────────────────

const styleHeader = (row, bgArgb = 'FF1E40AF') => {
  row.eachCell((cell) => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = {
      top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
  row.height = 22;
};

const styleDataRow = (row, isEven) => {
  row.eachCell((cell) => {
    cell.fill   = { type: 'pattern', pattern: 'solid',
                    fgColor: { argb: isEven ? 'FFF9FAFB' : 'FFFFFFFF' } };
    cell.border = {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    };
    cell.alignment = { vertical: 'middle' };
  });
  row.height = 18;
};

const IDR = '#,##0';

// ─── Sub-komponen UI ──────────────────────────────────────────────────────────

// Fix ESLint: gunakan nama prop 'Icon' langsung (uppercase = valid JSX component)
function SummaryCard({ label, value, colorClass, Icon }) {
  const IconComponent = Icon;
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`p-2 rounded-xl ${colorClass.bg}`}>
          <IconComponent size={16} className={colorClass.icon} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${colorClass.text}`}>{value}</p>
    </div>
  );
}


function CategoryTable({ title, rows, emptyMsg }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-base font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-400 text-center py-6">{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Kategori</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Transaksi</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Total</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-3 font-medium">{row.category_name}</td>
                <td className="px-5 py-3 text-right text-gray-500">{row.transaction_count}x</td>
                <td className="px-5 py-3 text-right font-semibold">{formatRupiah(row.total)}</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {row.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DailyTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold">Tren Harian</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Tanggal</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Pemasukan</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Pengeluaran</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Selisih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => {
              const diff = row.income - row.expense;
              return (
                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3">
                    {new Date(row.date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-medium">{formatRupiah(row.income)}</td>
                  <td className="px-5 py-3 text-right text-rose-600 font-medium">{formatRupiah(row.expense)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {diff >= 0 ? '+' : ''}{formatRupiah(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyBreakdownTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold">Ringkasan Per Bulan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Bulan</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Pemasukan</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Pengeluaran</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Saldo Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-3 font-medium">{MONTH_NAMES[row.month]}</td>
                <td className="px-5 py-3 text-right text-emerald-600 font-medium">{formatRupiah(row.income)}</td>
                <td className="px-5 py-3 text-right text-rose-600 font-medium">{formatRupiah(row.expense)}</td>
                <td className={`px-5 py-3 text-right font-semibold ${row.net >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                  {row.net >= 0 ? '+' : ''}{formatRupiah(row.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse h-24" />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse h-48" />
    </div>
  );
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

async function buildExcel(report, mode, periodLabel, month, year) {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'DompetKu';
  wb.created  = new Date();
  wb.modified = new Date();

  // ── Sheet 1: Ringkasan ────────────────────────────────────────────────────
  const wsSummary = wb.addWorksheet('Ringkasan', {
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });
  wsSummary.columns = [
    { header: '', key: 'label',  width: 28 },
    { header: '', key: 'value',  width: 22 },
  ];

  // Judul
  wsSummary.mergeCells('A1:B1');
  const titleCell    = wsSummary.getCell('A1');
  titleCell.value    = `LAPORAN KEUANGAN — ${periodLabel}`;
  titleCell.font     = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  titleCell.fill     = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(1).height = 28;

  wsSummary.addRow([]);

  // Metadata
  const metaRows = [
    ['Periode',         periodLabel],
    mode === 'monthly'
      ? ['Bulan',       MONTH_NAMES[month]]
      : ['Mode',        'Laporan Tahunan'],
    ['Tahun',           year],
    ['Tanggal Ekspor',  new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })],
  ];
  metaRows.forEach(([label, value]) => {
    const row = wsSummary.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: 'FF374151' } };
    row.getCell(2).alignment = { horizontal: 'left' };
    styleDataRow(row, wsSummary.rowCount % 2 === 0);
  });

  wsSummary.addRow([]);

  // Header ringkasan keuangan
  const hRow = wsSummary.addRow(['Metrik', 'Nilai (IDR)']);
  styleHeader(hRow);

  const summaryData = [
    ['Total Pemasukan',  report.total_income,  'FF059669'],
    ['Total Pengeluaran', report.total_expense, 'FFE11D48'],
    ['Saldo Bersih',      report.net_balance,
      report.net_balance >= 0 ? 'FF2563EB' : 'FFEA580C'],
  ];
  summaryData.forEach(([label, value, color], i) => {
    const row = wsSummary.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    row.getCell(2).numFmt = IDR;
    row.getCell(2).font = { bold: true, color: { argb: color } };
    styleDataRow(row, i % 2 === 0);
  });

  // ── Sheet 2: Kategori ─────────────────────────────────────────────────────
  const wsCat = wb.addWorksheet('Kategori');
  wsCat.columns = [
    { key: 'tipe',      width: 14 },
    { key: 'kategori',  width: 28 },
    { key: 'transaksi', width: 14 },
    { key: 'total',     width: 22 },
    { key: 'persen',    width: 12 },
    // Kolom ML-friendly
    { key: 'rasio',     width: 16 },
  ];

  const catHeader = wsCat.addRow([
    'Tipe', 'Kategori', 'Jml Transaksi', 'Total (IDR)', 'Persentase (%)', 'Rasio thd Net',
  ]);
  styleHeader(catHeader);

  const allCats = [
    ...(report.expense_by_category ?? []).map((r) => ({ ...r, tipe: 'Pengeluaran' })),
    ...(report.income_by_category  ?? []).map((r) => ({ ...r, tipe: 'Pemasukan'  })),
  ];

  allCats.forEach((r, i) => {
    const netAbs = Math.abs(report.net_balance) || 1;
    const rasio  = parseFloat((r.total / netAbs).toFixed(4));
    const row = wsCat.addRow([
      r.tipe, r.category_name, r.transaction_count, r.total, r.percentage, rasio,
    ]);
    row.getCell(4).numFmt = IDR;
    row.getCell(5).numFmt = '0.00"%"';
    row.getCell(6).numFmt = '0.0000';
    row.getCell(1).font   = {
      bold:  true,
      color: { argb: r.tipe === 'Pengeluaran' ? 'FFE11D48' : 'FF059669' },
    };
    styleDataRow(row, i % 2 === 0);
  });

  // Auto-filter
  wsCat.autoFilter = { from: 'A1', to: 'F1' };

  // ── Sheet 3: Tren Harian (bulanan) ─────────────────────────────────────────
  if (mode === 'monthly' && report.daily_totals?.length) {
    const wsDaily = wb.addWorksheet('Tren Harian');
    wsDaily.columns = [
      { key: 'tanggal',    width: 18 },
      { key: 'hari',       width: 14 }, // ML feature: nama hari
      { key: 'pemasukan',  width: 20 },
      { key: 'pengeluaran',width: 20 },
      { key: 'selisih',    width: 20 },
      { key: 'rasio',      width: 16 }, // ML feature: expense/income ratio
    ];

    const dailyHeader = wsDaily.addRow([
      'Tanggal', 'Hari', 'Pemasukan (IDR)', 'Pengeluaran (IDR)', 'Selisih (IDR)', 'Rasio Exp/Inc',
    ]);
    styleHeader(dailyHeader);

    report.daily_totals.forEach((r, i) => {
      const d     = new Date(r.date);
      const hari  = d.toLocaleDateString('id-ID', { weekday: 'long' });
      const sel   = r.income - r.expense;
      const rasio = r.income > 0 ? parseFloat((r.expense / r.income).toFixed(4)) : null;

      const row = wsDaily.addRow([r.date, hari, r.income, r.expense, sel, rasio]);
      row.getCell(3).numFmt = IDR;
      row.getCell(4).numFmt = IDR;
      row.getCell(5).numFmt = IDR;
      row.getCell(6).numFmt = '0.0000';

      // Warna selisih
      row.getCell(5).font = { color: { argb: sel >= 0 ? 'FF059669' : 'FFE11D48' } };
      styleDataRow(row, i % 2 === 0);
    });

    wsDaily.autoFilter = { from: 'A1', to: 'F1' };

    // Freeze baris header
    wsDaily.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // ── Sheet 4: Ringkasan Bulanan (tahunan) ───────────────────────────────────
  if (mode === 'yearly' && report.monthly_breakdown?.length) {
    const wsMon = wb.addWorksheet('Per Bulan');
    wsMon.columns = [
      { key: 'bulan_no',   width: 10 },
      { key: 'bulan',      width: 16 },
      { key: 'pemasukan',  width: 22 },
      { key: 'pengeluaran',width: 22 },
      { key: 'net',        width: 22 },
      { key: 'savings_rate', width: 18 }, // ML feature
      { key: 'trend',      width: 14 },   // ML feature: positif/negatif
    ];

    const monHeader = wsMon.addRow([
      'No. Bulan', 'Bulan', 'Pemasukan (IDR)', 'Pengeluaran (IDR)',
      'Saldo Bersih (IDR)', 'Savings Rate (%)', 'Trend',
    ]);
    styleHeader(monHeader);

    report.monthly_breakdown.forEach((r, i) => {
      const savingsRate = r.income > 0
        ? parseFloat(((r.income - r.expense) / r.income * 100).toFixed(2))
        : 0;
      const trend = r.net >= 0 ? 'Surplus' : 'Defisit';

      const row = wsMon.addRow([
        r.month, MONTH_NAMES[r.month], r.income, r.expense, r.net, savingsRate, trend,
      ]);
      row.getCell(3).numFmt = IDR;
      row.getCell(4).numFmt = IDR;
      row.getCell(5).numFmt = IDR;
      row.getCell(6).numFmt = '0.00"%"';
      row.getCell(5).font   = { color: { argb: r.net >= 0 ? 'FF2563EB' : 'FFEA580C' } };
      row.getCell(7).font   = { color: { argb: r.net >= 0 ? 'FF059669' : 'FFE11D48' }, bold: true };
      styleDataRow(row, i % 2 === 0);
    });

    wsMon.autoFilter = { from: 'A1', to: 'G1' };
    wsMon.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Freeze header di semua sheet
  wsSummary.views = [{ state: 'frozen', ySplit: 1 }];
  wsCat.views     = [{ state: 'frozen', ySplit: 1 }];

  return wb;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const now = new Date();

  const [mode, setMode]   = useState('monthly');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const monthlyQuery = useMonthlyReport(month, year, { enabled: mode === 'monthly' });
  const yearlyQuery  = useYearlyReport(year,         { enabled: mode === 'yearly'  });

  const isLoading = mode === 'monthly' ? monthlyQuery.isLoading : yearlyQuery.isLoading;
  const isError   = mode === 'monthly' ? monthlyQuery.isError   : yearlyQuery.isError;
  const report    = mode === 'monthly' ? monthlyQuery.data      : yearlyQuery.data;

  const monthLabel  = MONTHS.find((m) => m.value === month)?.label ?? '';
  const periodLabel = mode === 'yearly' ? `Tahun ${year}` : `${monthLabel} ${year}`;

  const exportToExcel = async () => {
    if (!report) return;
    const wb  = await buildExcel(report, mode, periodLabel, month, year);
    const buf = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const a = document.createElement('a');
    a.href     = url;
    a.download = `DompetKu_${periodLabel.replace(/\s+/g, '_')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{periodLabel}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Toggle mode */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {['monthly', 'yearly'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {m === 'monthly' ? 'Bulanan' : 'Tahunan'}
                </button>
              ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2">
              <Calendar size={16} className="text-gray-400" />
              {mode === 'monthly' && (
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-transparent text-sm focus:outline-none dark:text-white"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              )}
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent text-sm focus:outline-none dark:text-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Export */}
            <button
              onClick={exportToExcel}
              disabled={!report || isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>

        {isLoading && <LoadingSkeleton />}

        {isError && !isLoading && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center">
            <p className="text-rose-600 dark:text-rose-400 font-medium">Gagal memuat laporan. Coba lagi nanti.</p>
          </div>
        )}

        {!isLoading && !isError && report && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard
                label="Total Pemasukan"
                value={formatRupiah(report.total_income)}
                Icon={TrendingUp}
                colorClass={{ bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-600', text: 'text-emerald-600' }}
              />
              <SummaryCard
                label="Total Pengeluaran"
                value={formatRupiah(report.total_expense)}
                Icon={TrendingDown}
                colorClass={{ bg: 'bg-rose-50 dark:bg-rose-900/30', icon: 'text-rose-600', text: 'text-rose-600' }}
              />
              <SummaryCard
                label="Saldo Bersih"
                value={formatRupiah(report.net_balance)}
                Icon={Wallet}
                colorClass={{
                  bg:   report.net_balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30'   : 'bg-orange-50 dark:bg-orange-900/30',
                  icon: report.net_balance >= 0 ? 'text-blue-600' : 'text-orange-500',
                  text: report.net_balance >= 0 ? 'text-blue-600' : 'text-orange-500',
                }}
              />
            </div>

            {mode === 'yearly' && <MonthlyBreakdownTable rows={report.monthly_breakdown} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryTable
                title="Pengeluaran per Kategori"
                rows={report.expense_by_category}
                emptyMsg="Tidak ada pengeluaran pada periode ini"
              />
              <CategoryTable
                title="Pemasukan per Kategori"
                rows={report.income_by_category}
                emptyMsg="Tidak ada pemasukan pada periode ini"
              />
            </div>

            {mode === 'monthly' && <DailyTable rows={report.daily_totals} />}
          </>
        )}

        {!isLoading && !isError && !report && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Tidak ada data untuk {periodLabel}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;