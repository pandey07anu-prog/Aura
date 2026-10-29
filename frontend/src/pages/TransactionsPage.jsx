import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { formatINR } from '../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  Receipt
} from 'lucide-react';

export const TransactionsPage = ({ defaultType = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [type, setType] = useState(defaultType || '');

  useEffect(() => {
    setType(defaultType || '');
  }, [defaultType]);

  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Transactions
  const fetchTransactions = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 15);
      params.append('sortBy', sortBy);
      params.append('direction', sortDirection);

      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/transactions?${params.toString()}`);
      if (res.data?.success && res.data?.data) {
        setTransactions(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 0);
        setCurrentPage(res.data.data.number || 0);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(0);
  }, [type, category, startDate, endDate, sortBy, sortDirection]);

  // Debounced search
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchTransactions(0);
    }, 350);
    return () => clearTimeout(delayTimer);
  }, [search]);

  // Synchronize when transaction modal completes
  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions(0);
    };

    window.addEventListener('aura:transaction-updated', handleTransactionUpdate);
    return () => {
      window.removeEventListener('aura:transaction-updated', handleTransactionUpdate);
    };
  }, []);

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deletingId}`);
      setDeletingId(null);
      fetchTransactions(currentPage);
      window.dispatchEvent(new Event('aura:transaction-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearFilters = () => {
    setType(defaultType || '');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  const hasActiveFilters = type || category || startDate || endDate || search;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {defaultType === 'INCOME' ? 'Income Ledger' : defaultType === 'EXPENSE' ? 'Expense Ledger' : 'Transactions Ledger'}
          </h2>
          <p className="text-xs text-[#737373]">
            {totalElements} total entries recorded
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.12)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{defaultType === 'INCOME' ? 'New Income' : defaultType === 'EXPENSE' ? 'New Expense' : 'New Transaction'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="fintech-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Type Filter */}
          {!defaultType && (
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="">All Types (Income & Expense)</option>
                <option value="EXPENSE">Expenses Only</option>
                <option value="INCOME">Income Only</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="">All Categories</option>
              {categories
                .filter((c) => (defaultType ? c.type === defaultType : (!type || c.type === type)))
                .map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#171717] text-white">
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Range Start & End */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-2 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-white"
            />
            <span className="text-[#525252]">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-2 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Clear filter shortcut */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={hasActiveFilters ? 'No Matching Transactions' : 'No Transactions Recorded'}
          description={
            hasActiveFilters
              ? 'Try adjusting or clearing your active search and date filters.'
              : 'Add your first transaction to populate your personal finance ledger.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : defaultType === 'INCOME' ? 'Add Income' : defaultType === 'EXPENSE' ? 'Add Expense' : 'Add Transaction'}
          onAction={hasActiveFilters ? handleClearFilters : () => setIsModalOpen(true)}
        />
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] border-b border-[#292929] text-[#737373] uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (sortBy === 'amount') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('amount');
                          setSortDirection('desc');
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {transactions.map((tx) => {
                  const isExpense = tx.type === 'EXPENSE';
                  return (
                    <tr key={tx.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#A3A3A3] whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tx.description}</div>
                        {tx.notes && <div className="text-[11px] text-[#737373] truncate max-w-xs">{tx.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#222222] border border-[#2e2e2e] text-white text-[11px] font-mono">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A3A3A3] font-mono text-[11px] uppercase">
                        {tx.paymentMethod?.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isExpense ? 'text-white' : 'text-fintech-green'}>
                          {isExpense ? '-' : '+'}{formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1.5 rounded-lg text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#242424] bg-[#121212] flex items-center justify-between text-xs text-[#737373]">
              <div>
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => fetchTransactions(currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#222222]"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => fetchTransactions(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#222222]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Transaction</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to remove this record from your ledger? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-[#292929] text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-fintech-red text-white text-xs font-bold hover:bg-fintech-red/90 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        initialData={editingTransaction}
        defaultType={defaultType || 'EXPENSE'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          fetchTransactions(0);
          window.dispatchEvent(new Event('aura:transaction-updated'));
        }}
      />
    </div>
  );
};
