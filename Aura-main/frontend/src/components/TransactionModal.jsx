import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, CreditCard, AlignLeft, Check, Trash2 } from 'lucide-react';
import api from '../services/api';

export const TransactionModal = ({ isOpen, onClose, onSuccess, initialData = null, defaultType = 'EXPENSE' }) => {
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [notes, setNotes] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/transactions/${initialData.id}`);
      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete transaction';
      setError(msg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Fetch active categories
  useEffect(() => {
    if (!isOpen) return;
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, [isOpen]);

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || defaultType || 'EXPENSE');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setDescription(initialData.description || '');
      setPaymentMethod(initialData.paymentMethod || 'CREDIT_CARD');
      setNotes(initialData.notes || '');
    } else {
      // Default reset
      setType(defaultType || 'EXPENSE');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('CREDIT_CARD');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, defaultType]);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type && !c.isArchived);

  // Auto-select first matching category if current is blank or invalid
  useEffect(() => {
    if (availableCategories.length > 0 && (!category || !availableCategories.some((c) => c.name === category))) {
      setCategory(availableCategories[0].name);
    }
  }, [type, availableCategories, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please provide a valid transaction amount greater than zero.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setLoading(true);

    const payload = {
      type,
      amount: parsedAmount,
      category,
      date,
      description: description.trim(),
      paymentMethod,
      notes: notes.trim() || null,
    };

    try {
      if (initialData?.id) {
        await api.put(`/transactions/${initialData.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save transaction';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#141414] border border-[#292929] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#292929] flex items-center justify-between bg-[#111111]">
          <div>
            <h2 className="text-base font-bold text-white">
              {initialData ? 'Edit Transaction' : type === 'INCOME' ? 'Record Income' : 'Record Expense'}
            </h2>
            <p className="text-xs text-[#737373]">
              {initialData ? 'Update financial ledger entry' : type === 'INCOME' ? 'Credit new income to your ledger' : 'Post a new expense to your ledger'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
              {error}
            </div>
          )}

          {/* Type Selector (Pills) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                type === 'EXPENSE'
                  ? 'bg-[#292929] text-white shadow-sm border border-[#383838]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                type === 'INCOME'
                  ? 'bg-[#292929] text-white shadow-sm border border-[#383838]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono text-[#A3A3A3]">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-9 pr-4 py-3 text-xl font-mono font-bold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-white/50" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#171717] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white/50" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-white/50" />
              <span>Description</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-white/50" />
              <span>Payment Method</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] font-mono">
              {['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'UPI', 'CASH', 'OTHER'].map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all truncate ${
                    paymentMethod === pm
                      ? 'bg-white text-black font-semibold border-white'
                      : 'bg-[#1c1c1c] border-[#292929] text-[#888888] hover:text-white hover:border-[#383838]'
                  }`}
                >
                  {pm.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-[#292929]">
            {initialData?.id ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3.5 py-2 rounded-xl bg-fintech-red text-white text-xs font-bold hover:bg-fintech-red/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Deleting...' : 'Confirm Delete?'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-2.5 py-2 text-xs text-[#737373] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || isDeleting}
                  className="px-3 py-2 rounded-xl text-xs text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete {type === 'EXPENSE' ? 'Expense' : 'Record'}</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || isDeleting}
                className="px-4 py-2.5 rounded-xl border border-[#292929] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isDeleting}
                className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:opacity-50"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{initialData ? 'Update Record' : type === 'INCOME' ? 'Save Income' : type === 'EXPENSE' ? 'Save Expense' : 'Save Transaction'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
