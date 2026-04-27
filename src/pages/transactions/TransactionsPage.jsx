import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import TransactionForm from './TransactionForm';
import { useIsMobile } from '../../hooks/useIsMobile';
import { 
  Calendar, Wallet, Tag, FileText, TrendingUp, TrendingDown, 
  Edit2, Trash2, Filter, X, ChevronDown, Plus 
} from 'lucide-react';

const fmtRp   = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const EMPTY_FILTER = { type: '', start_date: '', end_date: '' };

// ══════════════════════════════════════════════════════════════════════
// TRANSACTION CARD (Mobile)
// ══════════════════════════════════════════════════════════════════════
function TransactionCard({ tx, onEdit, onDelete, isDeleting }) {
  const isIncome = tx.type === 'income';
  
  return (
    <div className="tx-card">
      <div className="tx-card-header">
        <div 
          className="tx-card-icon" 
          style={{ background: isIncome ? '#d1fae5' : '#fee2e2' }}
        >
          {isIncome ? (
            <TrendingUp size={16} color="#065f46" />
          ) : (
            <TrendingDown size={16} color="#991b1b" />
          )}
        </div>
        
        <div className="tx-card-main">
          <div className="tx-card-title">{tx.category_name}</div>
          <div className="tx-card-date">
            <Calendar size={11} />
            {fmtDate(tx.date)}
          </div>
        </div>
        
        <div 
          className="tx-card-amount" 
          style={{ color: isIncome ? '#10b981' : '#ef4444' }}
        >
          {isIncome ? '+' : '-'}{fmtRp(tx.amount)}
        </div>
      </div>
      
      <div className="tx-card-details">
        <div className="tx-detail-item">
          <Wallet size={13} color="#6b7280" />
          <span>{tx.wallet_name}</span>
        </div>
        
        {tx.note && (
          <div className="tx-detail-item">
            <FileText size={13} color="#6b7280" />
            <span>{tx.note}</span>
          </div>
        )}
        
        <div className="tx-detail-item">
          <Tag size={13} color="#6b7280" />
          <span 
            className="tx-type-badge" 
            style={{
              background: isIncome ? '#d1fae5' : '#fee2e2',
              color: isIncome ? '#065f46' : '#991b1b'
            }}
          >
            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        </div>
      </div>
      
      <div className="tx-card-actions">
        <button onClick={() => onEdit(tx)} className="tx-btn-edit">
          <Edit2 size={14} />
          Edit
        </button>
        <button 
          onClick={() => onDelete(tx.id)} 
          disabled={isDeleting}
          className="tx-btn-delete"
        >
          <Trash2 size={14} />
          Hapus
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SUMMARY CHIPS
// ══════════════════════════════════════════════════════════════════════
function SummaryChips({ totalIncome, totalExpense }) {
  return (
    <div className="tx-summary">
      <span className="tx-chip" style={{ background: '#d1fae5', color: '#065f46' }}>
        <TrendingUp size={12} />
        {fmtRp(totalIncome)}
      </span>
      <span className="tx-chip" style={{ background: '#fee2e2', color: '#991b1b' }}>
        <TrendingDown size={12} />
        {fmtRp(totalExpense)}
      </span>
      <span className="tx-chip" style={{ background: '#ede9fe', color: '#5b21b6' }}>
        Selisih: {fmtRp(totalIncome - totalExpense)}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ══════════════════════════════════════════════════════════════════════
function LoadingSkeleton() {
  return (
    <div className="tx-loading">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="tx-loading-item" />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════════════════
function EmptyState() {
  return (
    <div className="tx-empty">
      <div className="tx-empty-icon">📭</div>
      <div className="tx-empty-title">Belum ada transaksi</div>
      <div className="tx-empty-text">
        Mulai catat pengeluaran dan pemasukan Anda
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function TransactionsPage({ embedded = false }) {
  const isMobile = useIsMobile(768);
  
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const activeFilter = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== '')
  );

  const { data: transactions = [], isLoading, isError, error } = useTransactions(activeFilter);
  const { mutate: remove, isPending: isDeleting } = useDeleteTransaction({
    onError: (e) => alert(e?.message ?? 'Gagal menghapus'),
  });

  const setF = (key) => (e) => setFilter(prev => ({ ...prev, [key]: e.target.value }));
  const openCreate = () => { setEditTx(null); setShowForm(true); };
  const openEdit = (tx) => { setEditTx(tx); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTx(null); };
  
  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      remove(id);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const hasActiveFilter = Object.values(filter).some(Boolean);
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  return (
    <div className={`tx-container ${!embedded ? 'standalone' : ''}`}>
      {/* Header */}
      {!embedded && (
        <div className="tx-header">
          <div className="tx-header-info">
            <h2>Transaksi</h2>
            <p>{transactions.length} transaksi ditemukan</p>
          </div>
          <button onClick={openCreate} className="tx-btn-primary">
            <Plus size={16} />
            Tambah
          </button>
        </div>
      )}

      {embedded && (
        <div className="tx-header">
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            {transactions.length} transaksi
          </p>
          <button onClick={openCreate} className="tx-btn-primary">
            <Plus size={16} />
            Tambah
          </button>
        </div>
      )}

      {/* Summary Chips */}
      <SummaryChips totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* Filter Toggle (Mobile Only) */}
      {isMobile && (
        <div 
          className={`tx-filter-toggle ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <span>
            <Filter size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Filter Transaksi
            {hasActiveFilter && (
              <span className="tx-filter-badge">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown size={18} />
        </div>
      )}

      {/* Filter Panel */}
      <div 
        className={`tx-filter-panel ${isMobile && !showFilter ? 'hidden' : ''}`}
      >
        <select 
          value={filter.type} 
          onChange={setF('type')} 
          className="tx-filter-input"
        >
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        
        <input 
          type="date" 
          value={filter.start_date} 
          onChange={setF('start_date')} 
          className="tx-filter-input"
          placeholder="Dari tanggal"
        />
        
        <span className="tx-filter-label">s/d</span>
        
        <input 
          type="date" 
          value={filter.end_date} 
          onChange={setF('end_date')} 
          className="tx-filter-input"
          placeholder="Sampai tanggal"
        />
        
        {hasActiveFilter && (
          <button onClick={() => setFilter(EMPTY_FILTER)} className="tx-btn-reset">
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {isError && (
        <div className="tx-error">
          {error?.message ?? 'Gagal memuat data'}
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Card Layout (Mobile) */}
          <div className="tx-cards">
            {transactions.length === 0 ? (
              <EmptyState />
            ) : (
              transactions.map(tx => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))
            )}
          </div>

          {/* Table Layout (Desktop) */}
          <div className="tx-table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Dompet</th>
                  <th>Kategori</th>
                  <th>Catatan</th>
                  <th>Tipe</th>
                  <th>Jumlah</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id}>
                        <td>{fmtDate(tx.date)}</td>
                        <td>{tx.wallet_name}</td>
                        <td style={{ fontWeight: 600 }}>{tx.category_name}</td>
                        <td className="tx-note-cell">{tx.note || '—'}</td>
                        <td>
                          <span 
                            className="tx-type-badge" 
                            style={{
                              background: isIncome ? '#d1fae5' : '#fee2e2',
                              color: isIncome ? '#065f46' : '#991b1b',
                            }}
                          >
                            {isIncome ? '▲ Pemasukan' : '▼ Pengeluaran'}
                          </span>
                        </td>
                        <td 
                          className="tx-amount-cell" 
                          style={{ color: isIncome ? '#10b981' : '#ef4444' }}
                        >
                          {isIncome ? '+' : '-'}{fmtRp(tx.amount)}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button 
                            onClick={() => openEdit(tx)} 
                            className="tx-table-btn tx-table-btn-edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(tx.id)} 
                            disabled={isDeleting}
                            className="tx-table-btn tx-table-btn-delete"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Transaction Form Modal */}
      {showForm && <TransactionForm initial={editTx} onClose={closeForm} />}
    </div>
  );
}