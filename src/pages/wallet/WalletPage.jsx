import { useState } from 'react';
import { Plus, Wallet, TrendingUp, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';
import {
  useWallets,
  useCreateWallet,
  useUpdateWallet,
  useDeleteWallet,
} from '../../hooks/useWallets';
import { useCategories, useCreateCategory } from '../../hooks/useCategories';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';   // ← TAMBAHAN

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const WALLET_COLORS = [
  { label: 'Biru',   bg: 'bg-blue-500',    text: 'text-blue-500',    ring: 'ring-blue-400'    },
  { label: 'Hijau',  bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-400' },
  { label: 'Ungu',   bg: 'bg-violet-500',  text: 'text-violet-500',  ring: 'ring-violet-400'  },
  { label: 'Oranye', bg: 'bg-orange-500',  text: 'text-orange-500',  ring: 'ring-orange-400'  },
  { label: 'Merah',  bg: 'bg-rose-500',    text: 'text-rose-500',    ring: 'ring-rose-400'    },
  { label: 'Kuning', bg: 'bg-amber-400',   text: 'text-amber-500',   ring: 'ring-amber-400'   },
];

const WALLET_ICONS = ['🏦', '💳', '👛', '💰', '🏧', '💼'];

// ─── WalletModal ──────────────────────────────────────────────────────────────
// (tidak diubah)

// ─── WalletModal ──────────────────────────────────────────────────────────────

function WalletModal({ open, onClose, initial, onSubmit, loading }) {
  const isEdit = !!initial;

  const [name,     setName]     = useState(initial?.name ?? '');
  const [balance,  setBalance]  = useState('');     // sekarang string untuk format
  const [colorIdx, setColorIdx] = useState(0);
  const [iconIdx,  setIconIdx]  = useState(0);
  const [error,    setError]    = useState('');

  if (!open) return null;

  // === FORMAT RUPIAH DENGAN TITIK PEMISAH ===
  const formatRupiahInput = (value) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, ''); // hapus non-angka
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const cleanRupiah = (formatted) => {
    return formatted ? formatted.replace(/\./g, '') : '';
  };

  const handleBalanceChange = (e) => {
    const formatted = formatRupiahInput(e.target.value);
    setBalance(formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { 
      setError('Nama dompet wajib diisi'); 
      return; 
    }

    if (!isEdit) {
      const cleanBalance = cleanRupiah(balance);
      if (!cleanBalance || isNaN(Number(cleanBalance)) || Number(cleanBalance) < 0) {
        setError('Saldo harus berupa angka >= 0'); 
        return;
      }
    }

    setError('');

    if (isEdit) {
      onSubmit({ name: name.trim() });
    } else {
      const cleanBalance = cleanRupiah(balance);
      onSubmit({ 
        name: name.trim(), 
        balance: 0, 
        initialBalance: Number(cleanBalance) 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? 'Edit Dompet' : 'Tambah Dompet Baru'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ikon</label>
            <div className="flex gap-2">
              {WALLET_ICONS.map((icon, i) => (
                <button key={i} type="button" onClick={() => setIconIdx(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all
                    ${iconIdx === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-110' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Warna</label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c, i) => (
                <button key={i} type="button" onClick={() => setColorIdx(i)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all ring-offset-2 dark:ring-offset-gray-900
                    ${colorIdx === i ? `ring-2 ${c.ring} scale-110` : 'hover:scale-105'}`} />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Nama Dompet <span className="text-red-400">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Cash Harian..." maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-400 text-sm transition-all" />
          </div>

          {/* Saldo Awal — hanya saat buat baru (DENGAN FORMAT TITIK) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Saldo Dompet Awal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={balance} 
                  onChange={handleBalanceChange}
                  placeholder="0" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder:text-gray-400 text-sm transition-all" 
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">
                Dicatat otomatis sebagai transaksi pemasukan "Saldo Dompet"
              </p>
            </div>
          )}

          {/* Info saat edit */}
          {isEdit && (
            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                Saldo tidak bisa diubah langsung. Saldo dihitung otomatis dari riwayat transaksi dompet ini.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              <AlertCircle size={15} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={15} />}
              {isEdit ? 'Simpan Perubahan' : 'Buat Dompet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────
// (tidak diubah)

function DeleteConfirmModal({ open, wallet, onClose, onConfirm, loading }) {
  if (!open || !wallet) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 size={22} className="text-red-500" />
          </div>
        </div>
        <h3 className="text-center text-base font-semibold text-gray-800 dark:text-white mb-1">Hapus Dompet?</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Dompet <span className="font-medium text-gray-700 dark:text-gray-300">"{wallet.name}"</span> akan dihapus permanen beserta seluruh riwayatnya.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WalletCard ───────────────────────────────────────────────────────────────
// (tidak diubah)

function WalletCard({ wallet, colorIdx = 0, iconIdx = 0, onEdit, onDelete }) {
  const color = WALLET_COLORS[colorIdx % WALLET_COLORS.length];
  const icon  = WALLET_ICONS[iconIdx  % WALLET_ICONS.length];
  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color.bg} rounded-t-2xl`} />
      <div className="flex items-start justify-between mb-4 pt-1">
        <div className={`w-12 h-12 rounded-xl ${color.bg} bg-opacity-10 flex items-center justify-center text-2xl`}>{icon}</div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(wallet)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500 transition-colors" title="Edit dompet">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(wallet)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Hapus dompet">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5 font-medium truncate">{wallet.name}</p>
      <p className={`text-xl font-bold ${color.text}`}>{formatRupiah(wallet.balance)}</p>
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
        Dibuat {new Date(wallet.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// (tidak diubah)

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-5">
        <Wallet size={36} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Belum Ada Dompet</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">
        Tambahkan dompet pertamamu — rekening bank, e-wallet, atau kas tunai.
      </p>
      <button onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
        <Plus size={16} /> Tambah Dompet
      </button>
    </div>
  );
}

// ─── WalletPage ───────────────────────────────────────────────────────────────

export default function WalletPage() {
  const queryClient = useQueryClient();   // ← TAMBAHAN

  const { data: wallets = [], isLoading, isError } = useWallets();
  const { data: incomeCategories = [] } = useCategories('income');

  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { mutateAsync: createCategoryAsync }    = useCreateCategory();
  const { mutateAsync: createTransactionAsync } = useCreateTransaction();
  const { mutateAsync: createWalletAsync, isPending: creating } = useCreateWallet();

  // ── Create: dompet (balance=0) → kategori "Saldo Awal" → transaksi income ──
 // ── Create Wallet + Saldo Awal (hanya 1 kategori) ──
const handleCreateWallet = async ({ name, initialBalance }) => {
  try {
    // 1. Buat dompet dulu
    const newWallet = await createWalletAsync({ name, balance: 0 });

    // 2. Cari atau buat kategori "Saldo Dompet" (hanya 1 kali)
    let saldoAwalCat = incomeCategories.find((c) => 
      c.name.toLowerCase() === 'saldo dompet' || 
      c.name.toLowerCase() === 'saldo awal'
    );

    if (!saldoAwalCat) {
      try {
        saldoAwalCat = await createCategoryAsync({ 
          name: 'Saldo Dompet', 
          type: 'income' 
        });
      } catch (catErr) {
        // Jika gagal karena duplicate (unique constraint di backend), coba ambil lagi
        // Atau langsung invalidate dan refetch
        console.warn('Kategori mungkin sudah ada:', catErr);
      }
    }

    // 3. Buat transaksi saldo awal
    if (saldoAwalCat && initialBalance > 0) {
      await createTransactionAsync({
        wallet_id:   newWallet.id,
        category_id: saldoAwalCat.id,
        amount:      initialBalance,
        type:        'income',
        note:        'Saldo Awal Dompet',
        date:        new Date().toISOString(),
      });
    }

    setShowCreate(false);
    showToast('Dompet berhasil dibuat dengan saldo awal!');

    // Refresh daftar dompet + kategori income
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
    queryClient.invalidateQueries({ queryKey: ['categories', 'income'] });

  } catch (err) {
    console.error(err);
    showToast(err?.message ?? 'Gagal membuat dompet', 'error');
  }
};

  const { mutate: updateWallet, isPending: updating } = useUpdateWallet({
    onSuccess: () => { 
      setEditTarget(null); 
      showToast('Dompet berhasil diperbarui!'); 
      queryClient.invalidateQueries({ queryKey: ['wallets'] });   // ← TAMBAHAN
    },
    onError:   (err) => showToast(err?.message ?? 'Gagal memperbarui dompet', 'error'),
  });

  const { mutate: deleteWallet, isPending: deleting } = useDeleteWallet({
    onSuccess: () => { 
      setDeleteTarget(null); 
      showToast('Dompet berhasil dihapus!'); 
      queryClient.invalidateQueries({ queryKey: ['wallets'] });   // ← TAMBAHAN
    },
    onError:   (err) => showToast(err?.message ?? 'Gagal menghapus dompet', 'error'),
  });

  const totalBalance  = wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0);
  const richestWallet = wallets.length ? wallets.reduce((a, b) => a.balance > b.balance ? a : b) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dompet Saya</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{wallets.length} dompet terdaftar</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} /> Tambah Dompet
          </button>
        </div>

        {wallets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-2 w-32 h-32 rounded-full bg-white/5" />
              <p className="text-blue-200 text-sm font-medium mb-1">Total Saldo</p>
              <p className="text-3xl font-bold tracking-tight">{formatRupiah(totalBalance)}</p>
              <div className="flex items-center gap-2 mt-3">
                <Wallet size={14} className="text-blue-300" />
                <span className="text-blue-200 text-xs">dari {wallets.length} dompet aktif</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Saldo Terbesar</p>
              {richestWallet ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(richestWallet.balance)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-gray-500 dark:text-gray-400 text-xs truncate">{richestWallet.name}</span>
                  </div>
                </>
              ) : <p className="text-2xl font-bold text-gray-400">—</p>}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Gagal memuat data dompet.</p>
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet, i) => (
              <WalletCard key={wallet.id} wallet={wallet} colorIdx={i} iconIdx={i}
                onEdit={(w) => setEditTarget(w)} onDelete={(w) => setDeleteTarget(w)} />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      <WalletModal open={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreateWallet} loading={creating} />

      {/* Edit: hanya kirim name, balance tidak pernah dikirim */}
      <WalletModal open={!!editTarget} initial={editTarget} onClose={() => setEditTarget(null)}
        onSubmit={(payload) => updateWallet({ id: editTarget.id, payload })} loading={updating} />

      <DeleteConfirmModal open={!!deleteTarget} wallet={deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteWallet(deleteTarget.id)} loading={deleting} />
    </div>
  );
}