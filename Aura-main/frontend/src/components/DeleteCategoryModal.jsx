import React, { useState } from 'react';
import { AlertTriangle, Trash2, Archive, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  category,
  allCategories = [],
}) => {
  const [resolutionMode, setResolutionMode] = useState('reassign'); // 'reassign' or 'archive'
  const [targetCategory, setTargetCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !category) return null;

  const transactionCount = category.transactionCount || 0;
  const hasTransactions = transactionCount > 0;

  // Filter other available categories matching the same type for reassignment
  const eligibleReassignTargets = allCategories.filter(
    (c) => c.id !== category.id && c.type === category.type && !c.isArchived
  );

  // Set default reassignment target if not yet chosen
  if (!targetCategory && eligibleReassignTargets.length > 0) {
    setTargetCategory(eligibleReassignTargets[0].name);
  }

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      if (hasTransactions) {
        if (resolutionMode === 'reassign') {
          if (!targetCategory) {
            setError('Please select a target category for transaction reassignment.');
            setLoading(false);
            return;
          }
          await api.delete(`/categories/${category.id}?reassignToCategory=${encodeURIComponent(targetCategory)}`);
        } else {
          // Archive instead
          await api.delete(`/categories/${category.id}?archiveInstead=true`);
        }
      } else {
        // Direct clean deletion
        await api.delete(`/categories/${category.id}`);
      }

      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete category';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#141414] border border-[#2e2e2e] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#292929] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 flex items-center justify-center text-fintech-red">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Delete Category</h2>
              <p className="text-xs text-[#737373]">Confirm category removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-fintech-redSubtle border border-fintech-red/40 text-fintech-red text-xs">
              {error}
            </div>
          )}

          <p className="text-sm text-[#A3A3A3] leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-white">"{category.name}"</span>?
          </p>

          {/* If transactions reference this category */}
          {hasTransactions ? (
            <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] space-y-4">
              <div className="text-xs text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-semibold">
                  {transactionCount} transaction{transactionCount > 1 ? 's' : ''} currently reference this category.
                </span>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                To prevent orphan records, please choose how you would like to handle these existing transactions:
              </p>

              {/* Resolution Option Pills */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolutionMode('reassign')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex flex-col gap-1 transition-all ${
                    resolutionMode === 'reassign'
                      ? 'bg-white text-black font-semibold border-white shadow-md'
                      : 'bg-[#141414] border-[#292929] text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reassign</span>
                  </div>
                  <span className={`text-[10px] ${resolutionMode === 'reassign' ? 'text-black/70' : 'text-[#666666]'}`}>
                    Transfer to another category
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionMode('archive')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex flex-col gap-1 transition-all ${
                    resolutionMode === 'archive'
                      ? 'bg-white text-black font-semibold border-white shadow-md'
                      : 'bg-[#141414] border-[#292929] text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </div>
                  <span className={`text-[10px] ${resolutionMode === 'archive' ? 'text-black/70' : 'text-[#666666]'}`}>
                    Hide from new entries
                  </span>
                </button>
              </div>

              {/* Target category dropdown if Reassign selected */}
              {resolutionMode === 'reassign' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-mono uppercase text-[#A3A3A3] mb-1.5">
                    Reassign affected transactions to:
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  >
                    {eligibleReassignTargets.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#141414] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#737373]">
              No transactions reference this category. It will be permanently removed from MongoDB.
            </p>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#292929]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#292929] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-fintech-red text-white text-xs font-bold hover:bg-fintech-red/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.25)] disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {hasTransactions && resolutionMode === 'archive'
                      ? 'Archive Category'
                      : 'Delete Category'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
