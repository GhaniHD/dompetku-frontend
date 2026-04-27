// src/pages/budget/BudgetPage.jsx
import { useState, useEffect } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import { colors, fonts, radius, shadows, cardStyle } from '../../styles/variables';
import { useCategories } from '../../hooks/useCategories';
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useCopyBudget,
} from '../../hooks/useBudgets';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => 'Rp ' + Math.abs(n ?? 0).toLocaleString('id-ID');

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const STATUS_CONFIG = {
  on_track:   { color: colors.success,  bg: colors.successLight, label: 'Aman' },
  warning:    { color: colors.warning,  bg: '#FFFBEB',           label: 'Hampir Habis' },
  over_budget:{ color: colors.danger,   bg: colors.dangerLight,  label: 'Melebihi' },
};

const BAR_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
];

// ─── Animated Progress Bar ────────────────────────────────────────────────────

function ProgressBar({ pct, color, index }) {
  const [width, setWidth] = useState(0);
  const capped = Math.min(pct, 100);

  useEffect(() => {
    const t = setTimeout(() => setWidth(capped), index * 80 + 200);
    return () => clearTimeout(t);
  }, [capped, index]);

  return (
    <div style={{
      height: 8, borderRadius: 8,
      background: colors.bg,
      border: `1.5px solid ${colors.border}`,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', borderRadius: 8,
        background: pct >= 100 ? colors.danger : color,
        width: `${width}%`,
        transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)',
      }} />
    </div>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget, color, index, onEdit, onDelete }) {
  const st = STATUS_CONFIG[budget.status] ?? STATUS_CONFIG.on_track;

  return (
    <div style={{
      background: colors.surface,
      border: `1.5px solid ${colors.border}`,
      borderRadius: radius.md,
      padding: '14px 16px',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = shadows.hover;
        e.currentTarget.style.borderColor = colors.borderHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: color, flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
            {budget.category?.name ?? '-'}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 20, background: st.bg, color: st.color,
          }}>
            {st.label}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn icon="✏️" title="Edit" onClick={() => onEdit(budget)} />
          <IconBtn icon="🗑️" title="Hapus" onClick={() => onDelete(budget)} danger />
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar pct={budget.used_pct ?? 0} color={color} index={index} />

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>Terpakai</div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: fonts.mono, color: colors.textPrimary }}>
            {fmt(budget.spent)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 15, fontWeight: 800, fontFamily: fonts.mono,
            color: budget.used_pct >= 100 ? colors.danger
              : budget.used_pct >= 80 ? colors.warning
              : colors.success,
          }}>
            {(budget.used_pct ?? 0).toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>Anggaran</div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: fonts.mono, color: colors.textSecondary }}>
            {fmt(budget.amount)}
          </div>
        </div>
      </div>

      {/* Sisa */}
      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: colors.textMuted }}>Sisa anggaran</span>
        <span style={{
          fontSize: 12, fontWeight: 700, fontFamily: fonts.mono,
          color: (budget.remain ?? 0) < 0 ? colors.danger : colors.success,
        }}>
          {(budget.remain ?? 0) < 0 ? '-' : ''}{fmt(budget.remain ?? 0)}
        </span>
      </div>

      {/* Notes */}
      {budget.notes && (
        <div style={{ marginTop: 8, fontSize: 11, color: colors.textMuted, fontStyle: 'italic' }}>
          📝 {budget.notes}
        </div>
      )}
    </div>
  );
}

// ─── Small Icon Button ────────────────────────────────────────────────────────

function IconBtn({ icon, title, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: 'none', cursor: 'pointer', fontSize: 13,
        padding: '4px 6px', borderRadius: 6,
        background: hov ? (danger ? colors.dangerLight : colors.primaryLight) : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {icon}
    </button>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ data }) {
  const totalPct = data.total_budget > 0
    ? Math.min((data.total_spent / data.total_budget) * 100, 100)
    : 0;

  return (
    <div style={{ ...cardStyle, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        {[
          { label: 'Total Anggaran', value: fmt(data.total_budget), color: colors.primary },
          { label: 'Terpakai',       value: fmt(data.total_spent),  color: colors.danger  },
          { label: 'Sisa',           value: fmt(data.total_remain), color: colors.success },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.mono, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 10, borderRadius: 10, background: colors.bg, border: `1.5px solid ${colors.border}`, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 10,
          background: totalPct >= 100 ? colors.danger : totalPct >= 80 ? colors.warning : colors.primary,
          width: `${totalPct}%`,
          transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 11, marginTop: 4, fontFamily: fonts.mono, color: colors.textMuted }}>
        {totalPct.toFixed(1)}% terpakai
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(30,27,75,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: colors.surface, borderRadius: radius.xl,
        padding: 24, width: '100%', maxWidth: 440,
        boxShadow: shadows.button,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary }}>{title}</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: colors.textMuted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: radius.sm,
  border: `1.5px solid ${colors.border}`, fontSize: 13,
  color: colors.textPrimary, background: colors.bg,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: fonts.sans,
};

// ─── Create / Edit Form ───────────────────────────────────────────────────────

function BudgetForm({ initial, categories, onSubmit, loading, onClose }) {
  const now = new Date();
  const [form, setForm] = useState({
    category_id: initial?.category?.id ?? '',
    amount:      initial?.amount ?? '',
    month:       initial?.month  ?? now.getMonth() + 1,
    year:        initial?.year   ?? now.getFullYear(),
    notes:       initial?.notes  ?? '',
  });

  // ── Tambahkan state untuk display amount ──
  const [amountDisplay, setAmountDisplay] = useState(
    initial?.amount ? initial.amount.toLocaleString('id-ID') : ''
  );

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Handler khusus untuk amount ──
  const handleAmountChange = (e) => {
    // Hapus semua karakter selain angka
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    // Format dengan pemisah titik
    const formatted = raw ? parseInt(raw).toLocaleString('id-ID') : '';
    setAmountDisplay(formatted);
    setForm(f => ({ ...f, amount: raw }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      category_id: form.category_id,
      amount:      parseFloat(form.amount),
      month:       parseInt(form.month),
      year:        parseInt(form.year),
      notes:       form.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Kategori">
        <select value={form.category_id} onChange={set('category_id')} required style={inputStyle}>
          <option value="">Pilih kategori...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      {/* ── Ganti input amount ini ── */}
      <Field label="Nominal Anggaran">
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13, color: colors.textSecondary,
            fontFamily: fonts.mono, pointerEvents: 'none',
          }}>
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="0"
            value={amountDisplay}
            onChange={handleAmountChange}
            style={{
              ...inputStyle,
              paddingLeft: 36,
              fontFamily: fonts.mono,
            }}
          />
        </div>
      </Field>

      {/* sisanya tetap sama */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Bulan">
          <select value={form.month} onChange={set('month')} style={inputStyle} disabled={!!initial}>
            {MONTH_NAMES.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Tahun">
          <input
            type="number" min="2000" required
            value={form.year} onChange={set('year')}
            style={inputStyle} disabled={!!initial}
          />
        </Field>
      </div>

      <Field label="Catatan (opsional)">
        <input
          type="text" placeholder="cth: untuk kebutuhan bulanan"
          value={form.notes} onChange={set('notes')}
          style={inputStyle}
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button type="button" onClick={onClose} style={{
          flex: 1, padding: '11px', borderRadius: radius.sm,
          border: `1.5px solid ${colors.border}`, background: 'transparent',
          cursor: 'pointer', fontSize: 13, color: colors.textSecondary,
        }}>
          Batal
        </button>
        <button type="submit" disabled={loading} style={{
          flex: 2, padding: '11px', borderRadius: radius.sm,
          border: 'none', background: colors.primary, color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 700,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Buat Anggaran'}
        </button>
      </div>
    </form>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ budget, onConfirm, loading, onClose }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        Hapus anggaran <strong style={{ color: colors.textPrimary }}>{budget?.category?.name}</strong>?
        Tindakan ini tidak dapat dibatalkan.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '11px', borderRadius: radius.sm,
          border: `1.5px solid ${colors.border}`, background: 'transparent',
          cursor: 'pointer', fontSize: 13, color: colors.textSecondary,
        }}>Batal</button>
        <button onClick={onConfirm} disabled={loading} style={{
          flex: 1, padding: '11px', borderRadius: radius.sm,
          border: 'none', background: colors.danger, color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Menghapus...' : 'Ya, Hapus'}
        </button>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, background: type === 'error' ? colors.danger : colors.success,
      color: '#fff', padding: '10px 20px', borderRadius: radius.md,
      fontSize: 13, fontWeight: 600, boxShadow: shadows.button,
      whiteSpace: 'nowrap',
    }}>
      {type === 'error' ? '⚠️' : '✅'} {message}
    </div>
  );
}

// ─── BudgetPage ───────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const [modal,   setModal]   = useState(null); // null | 'create' | 'edit' | 'delete' | 'copy'
  const [target,  setTarget]  = useState(null); // budget yang sedang di-edit/delete
  const [toast,   setToast]   = useState(null); // { message, type }

  const notify = (message, type = 'success') => setToast({ message, type });
  const closeModal = () => { setModal(null); setTarget(null); };

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: budgetData, isLoading, isError } = useBudgets(
    { month, year },
    { enabled: true }
  );

  const { data: catData } = useCategories();
  // Hanya ambil kategori expense
  const expenseCategories = (catData ?? []).filter(c => c.type === 'expense' || !c.type);

  const budgets = budgetData?.budgets ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createBudget = useCreateBudget({
    onSuccess: () => { notify('Anggaran berhasil dibuat'); closeModal(); },
    onError:   (e) => notify(e?.message ?? 'Gagal membuat anggaran', 'error'),
  });

  const updateBudget = useUpdateBudget({
    onSuccess: () => { notify('Anggaran berhasil diperbarui'); closeModal(); },
    onError:   (e) => notify(e?.message ?? 'Gagal memperbarui anggaran', 'error'),
  });

  const deleteBudget = useDeleteBudget({
    onSuccess: () => { notify('Anggaran berhasil dihapus'); closeModal(); },
    onError:   (e) => notify(e?.message ?? 'Gagal menghapus anggaran', 'error'),
  });

  const copyBudget = useCopyBudget({
    onSuccess: (data) => { notify(`${data?.length ?? 0} anggaran berhasil disalin`); closeModal(); },
    onError:   (e) => notify(e?.message ?? 'Gagal menyalin anggaran', 'error'),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = (payload) => createBudget.mutate(payload);

  const handleUpdate = (payload) =>
    updateBudget.mutate({ id: target.id, payload });

  const handleDelete = () => deleteBudget.mutate(target.id);

  const handleCopy = (payload) => copyBudget.mutate(payload);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      title="Anggaran"
      subtitle="Pantau pengeluaran vs batas bulan ini"
    >
      {/* ── Filter Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 20, flexWrap: 'wrap',
      }}>
        <select
          value={month}
          onChange={e => setMonth(parseInt(e.target.value))}
          style={{ ...inputStyle, width: 'auto', flex: '1 1 120px', maxWidth: 160 }}
        >
          {MONTH_NAMES.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          type="number" min="2000"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          style={{ ...inputStyle, width: 80, flex: '0 0 80px' }}
        />

        <div style={{ flex: 1 }} />

        <button onClick={() => setModal('copy')} style={{
          padding: '9px 14px', borderRadius: radius.sm,
          border: `1.5px solid ${colors.border}`,
          background: colors.surface, cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: colors.textSecondary,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          📋 Salin Bulan Lalu
        </button>

        <button onClick={() => setModal('create')} style={{
          padding: '9px 16px', borderRadius: radius.sm,
          border: 'none', background: colors.primary, color: '#fff',
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: shadows.button,
        }}>
          + Tambah
        </button>
      </div>

      {/* ── Summary ── */}
      {!isLoading && budgetData && <SummaryBar data={budgetData} />}

      {/* ── Period label ── */}
      <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 14, fontWeight: 600 }}>
        {MONTH_NAMES[month]} {year}
        {budgets.length > 0 && (
          <span style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted, fontWeight: 400 }}>
            ({budgets.length} kategori)
          </span>
        )}
      </div>

      {/* ── States ── */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: colors.textMuted, fontSize: 13 }}>
          Memuat anggaran...
        </div>
      )}

      {isError && (
        <div style={{
          textAlign: 'center', padding: 32, borderRadius: radius.md,
          background: colors.dangerLight, color: colors.danger, fontSize: 13,
        }}>
          Gagal memuat data. Coba lagi.
        </div>
      )}

      {!isLoading && !isError && budgets.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: colors.surface, borderRadius: radius.lg,
          border: `1.5px dashed ${colors.border}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
            Belum ada anggaran
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 20 }}>
            Buat anggaran untuk {MONTH_NAMES[month]} {year}
          </div>
          <button onClick={() => setModal('create')} style={{
            padding: '10px 24px', borderRadius: radius.sm,
            border: 'none', background: colors.primary, color: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
            + Buat Anggaran
          </button>
        </div>
      )}

      {/* ── Budget List ── */}
      {!isLoading && budgets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {budgets.map((b, i) => (
            <BudgetCard
              key={b.id}
              budget={b}
              color={BAR_COLORS[i % BAR_COLORS.length]}
              index={i}
              onEdit={(b) => { setTarget(b); setModal('edit'); }}
              onDelete={(b) => { setTarget(b); setModal('delete'); }}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'create' && (
        <Modal title="Buat Anggaran Baru" onClose={closeModal}>
          <BudgetForm
            categories={expenseCategories}
            onSubmit={handleCreate}
            loading={createBudget.isPending}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === 'edit' && target && (
        <Modal title="Edit Anggaran" onClose={closeModal}>
          <BudgetForm
            initial={target}
            categories={expenseCategories}
            onSubmit={handleUpdate}
            loading={updateBudget.isPending}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === 'delete' && target && (
        <Modal title="Hapus Anggaran" onClose={closeModal}>
          <DeleteConfirm
            budget={target}
            onConfirm={handleDelete}
            loading={deleteBudget.isPending}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === 'copy' && (
        <Modal title="Salin Anggaran" onClose={closeModal}>
          <CopyForm
            onSubmit={handleCopy}
            loading={copyBudget.isPending}
            onClose={closeModal}
          />
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </PageLayout>
  );
}