import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RecurringModal } from '../components/RecurringModal';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { formatINR } from '../utils/formatters';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const RecurringPage = () => {
  const [recurringRules, setRecurringRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring-transactions');
      if (res.data?.success) {
        setRecurringRules(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load recurring transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleToggleStatus = async (rule) => {
    const nextStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.patch(`/recurring-transactions/${rule.id}/status`, { status: nextStatus });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to toggle recurring rule status:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/recurring-transactions/${deletingId}`);
      setDeletingId(null);
      fetchRecurring();
      window.dispatchEvent(new Event('aura:transaction-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleProcessDueNow = async () => {
    setProcessing(true);
    setProcessMessage('');
    try {
      const res = await api.post('/recurring-transactions/process-now');
      const count = res.data?.data?.processedCount || 0;
      setProcessMessage(
        count > 0
          ? `Successfully processed ${count} due recurring transaction${count > 1 ? 's' : ''} into your ledger.`
          : 'All recurring rules are up-to-date. No transactions were due today.'
      );
      fetchRecurring();
      window.dispatchEvent(new Event('aura:transaction-updated'));
      setTimeout(() => setProcessMessage(''), 5000);
    } catch (err) {
      setProcessMessage('Failed to trigger execution batch.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recurring Engine</h2>
          <p className="text-xs text-[#737373]">
            Automated recurring salaries, rent, utility bills, and subscriptions
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleProcessDueNow}
            disabled={processing}
            className="px-4 py-2.5 rounded-xl bg-[#171717] border border-[#2e2e2e] hover:border-white/50 text-white font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            title="Evaluate and process all due recurring rules immediately"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{processing ? 'Processing...' : 'Run Due Now'}</span>
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.12)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Process Feedback Message */}
      {processMessage && (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#2e2e2e] text-xs font-mono text-white flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-fintech-green" />
          <span>{processMessage}</span>
        </div>
      )}

      {/* Rules Grid */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : recurringRules.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No Recurring Rules Scheduled"
          description="Automate repetitive expenses such as apartment rent, monthly salary, and media subscriptions so they are posted automatically on schedule."
          actionLabel="Schedule Recurring Transaction"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringRules.map((r) => {
            const isExpense = r.type === 'EXPENSE';
            const isActive = r.status === 'ACTIVE';

            return (
              <div
                key={r.id}
                className="fintech-card p-6 flex flex-col justify-between hover-glow relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
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
                      <div>
                        <h3 className="text-sm font-bold text-white truncate max-w-[140px]">
                          {r.description}
                        </h3>
                        <span className="text-xs text-[#737373]">{r.category}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-fintech-greenSubtle text-fintech-green border-fintech-green/30'
                          : 'bg-[#242424] text-[#737373] border-[#383838]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Amount and Frequency */}
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#737373] block">Amount</span>
                      <span className="text-2xl font-bold font-mono text-white">
                        {formatINR(r.amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-[#737373] block">Frequency</span>
                      <span className="text-xs font-mono font-semibold text-white uppercase px-2 py-0.5 rounded bg-[#242424]">
                        {r.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] space-y-1.5 text-xs font-mono text-[#A3A3A3] mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#737373]">Next Due:</span>
                      <span className="text-white font-bold">{r.nextExecutionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737373]">Last Run:</span>
                      <span>{r.lastExecutedDate || 'Never'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737373]">Payment:</span>
                      <span className="uppercase">{r.paymentMethod?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#242424] flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(r)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#1f1f1f]'
                        : 'bg-white text-black font-bold border-white'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRule(r);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(r.id)}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle transition-colors"
                      title="Delete Rule"
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Cancel Recurring Rule</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to cancel and remove this recurring schedule? Transactions already posted will remain in your ledger.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-[#292929] text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-fintech-red text-white text-xs font-bold hover:bg-fintech-red/90 disabled:opacity-50"
              >
                {deleteLoading ? 'Cancelling...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Rule Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        initialData={editingRule}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSuccess={fetchRecurring}
      />
    </div>
  );
};
