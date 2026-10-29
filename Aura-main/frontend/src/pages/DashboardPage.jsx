import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';
import { formatINR } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Receipt,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteTransaction = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deletingId}`);
      setDeletingId(null);
      fetchData();
      window.dispatchEvent(new Event('aura:transaction-updated'));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, repRes, txRes, budRes, recRes] = await Promise.all([
        api.get('/reports/dashboard-summary'),
        api.get('/reports'),
        api.get('/transactions/recent'),
        api.get('/budgets'),
        api.get('/recurring-transactions'),
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (repRes.data?.success) setReports(repRes.data.data);
      if (txRes.data?.success) setRecentTransactions(txRes.data.data || []);
      if (budRes.data?.success) setBudgets(budRes.data.data || []);
      if (recRes.data?.success) setRecurring(recRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleTransactionUpdate = () => {
      fetchData();
    };

    window.addEventListener('aura:transaction-updated', handleTransactionUpdate);
    return () => {
      window.removeEventListener('aura:transaction-updated', handleTransactionUpdate);
    };
  }, []);

  const hasData = summary?.hasData || recentTransactions.length > 0;

  // Custom Dark Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl p-3 shadow-xl text-xs font-mono">
          <div className="text-[#A3A3A3] mb-1">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2" style={{ color: entry.color || '#fff' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || '#fff' }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Income"
              amount={summary?.totalIncome || 0}
              icon={ArrowDownLeft}
              changePercent={summary?.incomeChangePercent}
              subtitle="vs previous period"
            />
            <MetricCard
              title="Total Expenses"
              amount={summary?.totalExpenses || 0}
              icon={ArrowUpRight}
              changePercent={summary?.expenseChangePercent}
              subtitle="vs previous period"
            />
            <MetricCard
              title="Current Balance"
              amount={summary?.currentBalance || 0}
              icon={Wallet}
              subtitle={`${summary?.savingsRate?.toFixed(1) || 0}% savings rate`}
            />
            <MetricCard
              title="Remaining Budget"
              amount={summary?.remainingMonthlyBudget || 0}
              icon={PieIcon}
              subtitle="Allocated for this month"
            />
          </>
        )}
      </div>

      {/* Empty State Banner if brand new ledger */}
      {!loading && !hasData && (
        <EmptyState
          icon={Receipt}
          title="No Transactions Recorded Yet"
          description="Your personal financial ledger is active. Record your first income or expense entry to unlock live charts, budget utilization, and financial insights."
          actionLabel="Add Your First Transaction"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Main Charts & Analytics Grid */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expenses Bar Chart (2 cols) */}
          <div className="lg:col-span-2 fintech-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Cash Flow Trend</h3>
                <p className="text-xs text-[#737373]">Income vs Expenses over recent months</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white" />
                  <span className="text-[#A3A3A3]">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#404040]" />
                  <span className="text-[#A3A3A3]">Expenses</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reports?.monthlyTrends || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#292929' }}
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#292929' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#404040" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown Donut Chart (1 col) */}
          <div className="fintech-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Category Distribution</h3>
                <p className="text-xs text-[#737373]">Expense breakdown by category</p>
              </div>
              <Link to="/categories" className="text-xs text-[#A3A3A3] hover:text-white flex items-center">
                <span>All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reports?.categoryDistribution?.length > 0 ? (
              <>
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reports.categoryDistribution}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {reports.categoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || '#FFFFFF'}
                            stroke="#171717"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Donut Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono text-[#737373] uppercase">Top Spend</span>
                    <span className="text-xs font-bold text-white truncate max-w-[80px]">
                      {reports?.highestSpendingCategory?.category || 'None'}
                    </span>
                  </div>
                </div>

                {/* Top 3 Legend items */}
                <div className="space-y-2 mt-4 pt-3 border-t border-[#242424]">
                  {reports.categoryDistribution.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color || '#FFFFFF' }}
                        />
                        <span className="text-white truncate max-w-[120px]">{item.category}</span>
                      </div>
                      <div className="font-mono text-[#A3A3A3]">
                        {formatINR(item.amount)} ({item.percentage?.toFixed(0)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-[#737373]">
                No category expenses logged yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secondary Row: Recent Transactions Ledger + Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table (2 cols) */}
        <div className="lg:col-span-2 fintech-card overflow-hidden">
          <div className="p-6 border-b border-[#242424] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-[#737373]">Latest activity posted to your ledger</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-white hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#737373]">
              No transactions recorded yet. Click "Add Transaction" to create one.
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {recentTransactions.slice(0, 6).map((tx) => {
                const isExpense = tx.type === 'EXPENSE';
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isExpense
                            ? 'bg-fintech-redSubtle text-fintech-red border-fintech-red/20'
                            : 'bg-fintech-greenSubtle text-fintech-green border-fintech-green/20'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-white truncate">{tx.description}</div>
                        <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-0.5 font-mono">
                          <span className="text-[#A3A3A3]">{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="uppercase">{tx.paymentMethod?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-sm font-mono font-bold ${
                            isExpense ? 'text-white' : 'text-fintech-green'
                          }`}
                        >
                          {isExpense ? '-' : '+'}{formatINR(tx.amount)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsModalOpen(true);
                          }}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budgets & Recurring Quick Summary (1 col) */}
        <div className="space-y-6">
          {/* Active Budgets Card */}
          <div className="fintech-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Monthly Budgets</h3>
              <Link to="/budgets" className="text-xs text-[#A3A3A3] hover:text-white flex items-center">
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#737373]">
                No monthly budgets defined.{' '}
                <Link to="/budgets" className="text-white hover:underline">
                  Create one now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((b) => (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate">{b.category}</span>
                      <span className="font-mono text-[#A3A3A3]">
                        {formatINR(b.spent)} / {formatINR(b.monthlyLimit)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#242424] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          b.isOverBudget
                            ? 'bg-fintech-red shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                            : b.isNearThreshold
                            ? 'bg-amber-400'
                            : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-[#525252]">
                      <span>{b.percentageUsed?.toFixed(0)}% used</span>
                      {b.isOverBudget ? (
                        <span className="text-fintech-red font-bold">Exceeded</span>
                      ) : (
                        <span>{formatINR(b.remaining)} left</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Recurring Schedule Card */}
          <div className="fintech-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Recurring Rules</h3>
              <Link to="/recurring" className="text-xs text-[#A3A3A3] hover:text-white flex items-center">
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recurring.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#737373]">
                No scheduled recurring rules.
              </div>
            ) : (
              <div className="space-y-3">
                {recurring.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-[#141414] border border-[#242424] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white truncate max-w-[130px]">{r.description}</div>
                      <div className="text-[10px] font-mono text-[#737373]">
                        Next: {r.nextExecutionDate} • {r.frequency}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white">
                      {formatINR(r.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
                onClick={handleDeleteTransaction}
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          fetchData();
          window.dispatchEvent(new Event('aura:transaction-updated'));
        }}
      />
    </div>
  );
};
