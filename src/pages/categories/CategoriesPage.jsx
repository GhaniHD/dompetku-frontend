// src/pages/categories/CategoriesPage.jsx
import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { colors, fonts, radius, shadows } from '../../styles/variables';

// ─── Komponen Kecil ───────────────────────────────────────────────────────────

const Badge = ({ type }) => {
  const isIncome = type === 'income';
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999,
      background: isIncome ? colors.successLight : colors.dangerLight,
      color: isIncome ? colors.success : colors.danger,
    }}>
      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
    </span>
  );
};

const EmptyState = ({ filter }) => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textSecondary }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>
      Belum ada kategori
    </div>
    <div style={{ fontSize: 13 }}>
      {filter === 'all'
        ? 'Tambahkan kategori pertamamu untuk mulai mencatat transaksi.'
        : `Belum ada kategori ${filter === 'income' ? 'pemasukan' : 'pengeluaran'}.`}
    </div>
  </div>
);

const Input = ({ label, value, onChange, placeholder, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginBottom: 6 }}>
        {label}
      </label>
    )}
    <input
      value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{
        width: '100%', padding: '11px 14px',
        border: `1.5px solid ${colors.border}`, borderRadius: radius.lg,
        fontSize: 14, background: colors.surface, color: colors.textPrimary,
        outline: 'none', fontFamily: fonts.sans, opacity: disabled ? 0.7 : 1,
        boxSizing: 'border-box',
      }}
    />
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', disabled, loading: isLoading, fullWidth }) => {
  const variants = {
    primary: { bg: colors.primary,    color: '#fff',               border: 'none' },
    danger:  { bg: 'transparent',     color: colors.danger,        border: `1.5px solid ${colors.danger}` },
    ghost:   { bg: 'transparent',     color: colors.textSecondary, border: `1.5px solid ${colors.border}` },
    success: { bg: colors.success,    color: '#fff',               border: 'none' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        width: fullWidth ? '100%' : undefined,
        flex: fullWidth ? undefined : 1,
        padding: '11px 16px', borderRadius: radius.lg,
        fontSize: 14, fontWeight: 600, fontFamily: fonts.sans,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.7 : 1,
        transition: 'all .2s',
        background: v.bg, color: v.color, border: v.border,
      }}
    >
      {isLoading ? 'Menyimpan...' : children}
    </button>
  );
};

// ─── Modal Form (Create / Edit) ───────────────────────────────────────────────

const CategoryFormModal = ({ initial, onSubmit, onClose, loading }) => {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'expense');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: colors.surface, borderRadius: radius.xl,
        padding: '1.75rem', maxWidth: 380, width: '100%',
        border: `1.5px solid ${colors.border}`, boxShadow: shadows.lg,
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 20 }}>
          {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
        </div>

        <Input
          label="Nama kategori"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Makan, Gaji, Transport..."
          disabled={loading}
        />

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginBottom: 8 }}>
            Tipe
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: 'income',  label: '💰 Pemasukan' },
              { value: 'expense', label: '💸 Pengeluaran' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px', borderRadius: radius.lg,
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: fonts.sans, transition: 'all .15s',
                  border: type === opt.value
                    ? `2px solid ${opt.value === 'income' ? colors.success : colors.danger}`
                    : `1.5px solid ${colors.border}`,
                  background: type === opt.value
                    ? (opt.value === 'income' ? colors.successLight : colors.dangerLight)
                    : colors.surface,
                  color: type === opt.value
                    ? (opt.value === 'income' ? colors.success : colors.danger)
                    : colors.textSecondary,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} disabled={loading}>Batal</Btn>
          <Btn
            variant={type === 'income' ? 'success' : 'primary'}
            onClick={handleSubmit}
            loading={loading}
            disabled={!name.trim()}
          >
            {isEdit ? 'Simpan' : 'Tambah'}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Konfirmasi Hapus ───────────────────────────────────────────────────

const DeleteConfirmModal = ({ category, onConfirm, onClose, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }}>
    <div style={{
      background: colors.surface, borderRadius: radius.xl,
      padding: '1.75rem', maxWidth: 360, width: '100%',
      border: `1.5px solid ${colors.border}`, boxShadow: shadows.lg,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: colors.dangerLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
        Hapus Kategori?
      </div>
      <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.65, marginBottom: 24 }}>
        Kategori <strong>"{category?.name}"</strong> akan dihapus permanen.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Batal</Btn>
        <Btn variant="danger" onClick={onConfirm} loading={loading}>Hapus</Btn>
      </div>
    </div>
  </div>
);

// ─── Halaman Utama ────────────────────────────────────────────────────────────

const CategoriesPage = () => {
  const [filter, setFilter]           = useState('all');
  const [showForm, setShowForm]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Hooks TanStack Query ─────────────────────────────────────────────────────
  const { data: categories = [], isLoading } = useCategories();

  const createMutation = useCreateCategory({
    onSuccess: () => setShowForm(false),
  });

  const updateMutation = useUpdateCategory({
    onSuccess: () => setEditTarget(null),
  });

  const deleteMutation = useDeleteCategory({
    onSuccess: () => setDeleteTarget(null),
  });

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered     = categories.filter((c) => filter === 'all' || c.type === filter);
  const incomeCount  = categories.filter((c) => c.type === 'income').length;
  const expenseCount = categories.filter((c) => c.type === 'expense').length;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreate = (data) => createMutation.mutate(data);

  const handleUpdate = (data) =>
    updateMutation.mutate({ id: editTarget.id, payload: data });

  const handleDelete = () => deleteMutation.mutate(deleteTarget.id);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background || 'var(--color-background-tertiary)',
      padding: '1.5rem',
      fontFamily: fonts.sans,
    }}>
      {/* maxWidth lebih lebar agar tidak terlalu sempit */}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Error banner dari mutation ──────────────────────────────────── */}
        {(createMutation.error || updateMutation.error || deleteMutation.error) && (
          <div style={{
            background: colors.dangerLight, border: `1.5px solid ${colors.danger}`,
            borderRadius: radius.lg, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16, color: colors.danger, fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ flex: 1 }}>
              {(createMutation.error || updateMutation.error || deleteMutation.error)?.message || 'Terjadi kesalahan'}
            </span>
            <button
              onClick={() => {
                createMutation.reset();
                updateMutation.reset();
                deleteMutation.reset();
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger, fontSize: 18 }}
            >×</button>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl, padding: '1.25rem 1.5rem',
          marginBottom: 16, boxShadow: shadows.sm,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>Kategori</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {categories.length} kategori tersimpan
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 22px', borderRadius: radius.lg,
              background: colors.primary, color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: fonts.sans,
            }}
          >
            + Tambah Kategori
          </button>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Pemasukan',   count: incomeCount,  icon: '💰', light: colors.successLight, text: colors.success },
            { label: 'Pengeluaran', count: expenseCount, icon: '💸', light: colors.dangerLight,  text: colors.danger  },
          ].map((s) => (
            <div key={s.label} style={{
              background: colors.surface, border: `1.5px solid ${colors.border}`,
              borderRadius: radius.xl, padding: '1.25rem 1.5rem', boxShadow: shadows.sm,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: radius.lg,
                background: s.light, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter + List ───────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1.5px solid ${colors.border}`,
          borderRadius: radius.xl, padding: '1.25rem 1.5rem',
          boxShadow: shadows.sm,
        }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            {[
              { key: 'all',     label: `Semua (${categories.length})` },
              { key: 'income',  label: `Pemasukan (${incomeCount})` },
              { key: 'expense', label: `Pengeluaran (${expenseCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '7px 16px', borderRadius: 9999,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: fonts.sans, transition: 'all .15s',
                  background: filter === tab.key ? colors.primary : 'transparent',
                  color:      filter === tab.key ? '#fff' : colors.textSecondary,
                  border:     filter === tab.key ? 'none' : `1.5px solid ${colors.border}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: colors.textSecondary, fontSize: 14 }}>
              Memuat kategori...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            // Grid 2 kolom agar lebih lebar dan rapi
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {filtered.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: colors.background || 'var(--color-background-tertiary)',
                    borderRadius: radius.lg,
                    border: `1.5px solid ${colors.border}`,
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: cat.type === 'income' ? colors.successLight : colors.dangerLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {cat.type === 'income' ? '💰' : '💸'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                      {cat.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge type={cat.type} />
                      <span style={{ fontSize: 11, color: colors.textMuted }}>
                        {formatDate(cat.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditTarget(cat)}
                      title="Edit"
                      style={{
                        width: 34, height: 34, borderRadius: radius.md,
                        border: `1.5px solid ${colors.border}`,
                        background: colors.surface, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      title="Hapus"
                      style={{
                        width: 34, height: 34, borderRadius: radius.md,
                        border: `1.5px solid ${colors.dangerLight}`,
                        background: colors.dangerLight, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <CategoryFormModal
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}
      {editTarget && (
        <CategoryFormModal
          initial={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
          loading={updateMutation.isPending}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          category={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default CategoriesPage;