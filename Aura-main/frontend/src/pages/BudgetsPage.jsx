import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BudgetModal } from '../components/BudgetModal';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { formatINR } from '../utils/formatters';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  TrendingDown
} from 'lucide-react';

export const BudgetsPage = () => {
  const currentDate = new Date();
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data?.success) {
        setBudgets(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();

    const handleUpdate = () => fetchBudgets();
    window.addEventListener('aura:transaction-updated', handleUpdate);
    return () => window.removeEventListener('aura:transaction-updated', handleUpdate);
  }, [selectedMonth, selectedYear]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/budgets/${deletingId}`);
      setDeletingId(null);
      fetchBudgets();
      window.dispatchEvent(new Event('aura:transaction-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Totals across active budgets
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Monthly Budget Allocations</h2>
          <p className="text-xs text-[#737373]">
            Category-level spending limits with automated threshold alerts
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.12)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Month & Year Filter Bar */}
      <div className="fintech-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#737373] shrink-0" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-[#171717] text-white">
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr} className="bg-[#171717] text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aggregated Quick Metrics */}
        {budgets.length > 0 && (
          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-[#737373]">Allocated: </span>
              <span className="text-white font-bold">{formatINR(totalAllocated)}</span>
            </div>
            <div>
              <span className="text-[#737373]">Spent: </span>
              <span className="text-white font-bold">{formatINR(totalSpent)}</span>
            </div>
            <div>
              <span className="text-[#737373]">Remaining: </span>
              <span className="text-fintech-green font-bold">{formatINR(totalRemaining)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title={`No Budgets Configured for ${monthNames[selectedMonth - 1]} ${selectedYear}`}
          description="Create spending limits for specific expense categories to keep your monthly cash flow strictly disciplined."
          actionLabel="Create Monthly Budget"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="fintech-card p-6 flex flex-col justify-between hover-glow relative overflow-hidden"
            >
              {/* Top Accent line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  b.isOverBudget
                    ? 'bg-fintech-red'
                    : b.isNearThreshold
                    ? 'bg-amber-400'
                    : 'bg-white'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{b.category}</h3>
                    <span className="text-xs text-[#737373]">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(b);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(b.id)}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Figures */}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#737373] block">Spent</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {formatINR(b.spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#737373] block">Limit</span>
                    <span className="text-sm font-mono text-[#A3A3A3]">
                      {formatINR(b.monthlyLimit)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.isOverBudget
                          ? 'bg-fintech-red shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                          : b.isNearThreshold
                          ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                          : 'bg-white'
                      }`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#737373]">{b.percentageUsed?.toFixed(1)}% consumed</span>
                    {b.isOverBudget ? (
                      <span className="text-fintech-red font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Exceeded by {formatINR(b.spent - b.monthlyLimit)}
                      </span>
                    ) : (
                      <span className="text-[#A3A3A3]">
                        {formatINR(b.remaining)} remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Threshold Badge Footnote */}
              <div className="pt-3 border-t border-[#242424] flex items-center justify-between text-[11px] font-mono text-[#666666]">
                <span>Threshold: {b.alertThreshold}%</span>
                <span>{b.month}/{b.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Budget</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to delete this monthly budget limit? Existing transaction records will remain unaffected.
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

      {/* Budget Creation / Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        initialData={editingBudget}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
      />
    </div>
  );
};
