// src/pages/transactions/TransactionForm.jsx
import { useState } from 'react';
import { useWallets } from '../../hooks/useWallets';
import { useCategories } from '../../hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactions';
import { colors } from '../../styles/variables';

const TODAY = new Date().toISOString().split('T')[0];

// Helper untuk format Rupiah dengan titik pemisah ribuan
const formatRupiah = (value) => {
  if (!value) return '';
  // Hapus semua karakter non-angka
  const num = value.toString().replace(/\D/g, '');
  // Tambahkan titik setiap 3 digit dari belakang
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper untuk membersihkan format menjadi angka murni
const cleanRupiah = (formatted) => {
  return formatted ? formatted.replace(/\./g, '') : '';
};

// Buat initial state
function buildForm(initial) {
  if (!initial) {
    return { wallet_id: '', category_id: '', amount: '', type: 'expense', note: '', date: TODAY };
  }
  return {
    wallet_id:   initial.wallet?.id   ?? initial.wallet_id   ?? '',
    category_id: initial.category?.id ?? initial.category_id ?? '',
    amount:      initial.amount ? formatRupiah(initial.amount) : '',   // format saat edit
    type:        initial.type === 'income' ? 'income' : 'expense',
    note:        initial.note ?? '',
    date:        initial.date ? initial.date.split('T')[0] : TODAY,
  };
}

export default function TransactionForm({ initial = null, onClose }) {
  const isEdit = !!initial;

  const [form, setForm] = useState(() => buildForm(initial));
  const [err,  setErr]  = useState('');

  const { data: wallets    = [] } = useWallets();
  const { data: categories = [] } = useCategories(form.type);

  const { mutate: create, isPending: creating } = useCreateTransaction({
    onSuccess: onClose,
    onError:   (e) => setErr(e?.message ?? 'Gagal membuat transaksi'),
  });

  const { mutate: update, isPending: updating } = useUpdateTransaction({
    onSuccess: onClose,
    onError:   (e) => setErr(e?.message ?? 'Gagal mengupdate transaksi'),
  });

  const isPending = creating || updating;

  // Handler khusus untuk field amount (dengan format)
  const handleAmountChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setForm((prev) => ({ ...prev, amount: formatted }));
  };

  const set = (key) => (e) => {
    if (key === 'amount') {
      handleAmountChange(e);
    } else {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    }
  };

  const handleSubmit = () => {
    setErr('');
    if (!form.wallet_id)                          return setErr('Pilih dompet');
    if (!form.category_id)                        return setErr('Pilih kategori');
    
    const cleanAmount = cleanRupiah(form.amount);
    if (!cleanAmount || Number(cleanAmount) <= 0) return setErr('Masukkan jumlah yang valid');
    
    if (!form.date)                               return setErr('Pilih tanggal');

    const payload = {
      wallet_id:   form.wallet_id,
      category_id: form.category_id,
      amount:      Number(cleanAmount),
      type:        form.type,
      note:        form.note,
      date:        new Date(form.date).toISOString(),
    };

    isEdit ? update({ id: initial.id, payload }) : create(payload);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>

        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        {/* Tipe Toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {['income', 'expense'].map((t) => (
            <button
              key={t}
              onClick={() => setForm((prev) => ({ ...prev, type: t, category_id: '' }))}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                background: form.type === t ? (t === 'income' ? '#d1fae5' : '#fee2e2') : 'transparent',
                color:      form.type === t ? (t === 'income' ? '#065f46' : '#991b1b') : '#6b7280',
                transition: 'all .15s',
              }}
            >
              {t === 'income' ? '▲ Pemasukan' : '▼ Pengeluaran'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Jumlah (Rp)">
            <input 
              type="text" 
              inputMode="numeric" 
              placeholder="0" 
              value={form.amount} 
              onChange={set('amount')} 
              style={inputStyle} 
            />
          </Field>

          <Field label="Dompet">
            <select value={form.wallet_id} onChange={set('wallet_id')} style={inputStyle}>
              <option value="">— Pilih Dompet —</option>
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>

          <Field label="Kategori">
            <select value={form.category_id} onChange={set('category_id')} style={inputStyle}>
              <option value="">— Pilih Kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Tanggal">
            <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
          </Field>

          <Field label="Catatan (opsional)">
            <input type="text" placeholder="Tambahkan catatan…" value={form.note} onChange={set('note')} style={inputStyle} />
          </Field>
        </div>

        {err && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontSize: 13 }}>
            {err}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            Batal
          </button>
          <button
            onClick={handleSubmit} 
            disabled={isPending}
            style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', background: isPending ? '#a5b4fc' : (colors.primary ?? '#6366f1'), color: '#fff', fontWeight: 700, fontSize: 14, cursor: isPending ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
          >
            {isPending ? 'Menyimpan…' : (isEdit ? 'Simpan Perubahan' : 'Tambah Transaksi')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', 
  padding: '10px 12px', 
  borderRadius: 10,
  border: '1.5px solid #e5e7eb', 
  fontSize: 14, 
  outline: 'none',
  boxSizing: 'border-box', 
  background: '#fafafa',
};