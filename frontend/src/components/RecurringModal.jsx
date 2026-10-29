import React, { useState, useEffect } from 'react';
import { X, Check, Repeat, Calendar } from 'lucide-react';
import api from '../services/api';

export const RecurringModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, [isOpen]);

  const availableCategories = categories.filter((c) => c.type === type && !c.isArchived);

  useEffect(() => {
    if (availableCategories.length > 0 && (!category || !availableCategories.some((c) => c.name === category))) {
      setCategory(availableCategories[0].name);
    }
  }, [type, availableCategories, category]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'EXPENSE');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || '');
      setDescription(initialData.description || '');
      setFrequency(initialData.frequency || 'MONTHLY');
      setPaymentMethod(initialData.paymentMethod || 'BANK_TRANSFER');
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(initialData.endDate || '');
    } else {
      setType('EXPENSE');
      setAmount('');
      setDescription('');
      setFrequency('MONTHLY');
      setPaymentMethod('BANK_TRANSFER');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please provide a valid amount greater than zero.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      frequency,
      paymentMethod,
      startDate,
      endDate: endDate || null,
    };

    try {
      if (initialData?.id) {
        await api.put(`/recurring-transactions/${initialData.id}`, payload);
      } else {
        await api.post('/recurring-transactions', payload);
      }
      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to schedule recurring transaction';
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
          <div className="flex items-center gap-2.5">
            <Repeat className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white">
              {initialData ? 'Edit Recurring Rule' : 'Schedule Recurring Transaction'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
              {error}
            </div>
          )}

          {/* Type Selector */}
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
              Recurring Expense
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
              Recurring Income
            </button>
          </div>

          {/* Amount & Frequency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#A3A3A3]">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-8 pr-3 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#171717] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="BANK_TRANSFER">Bank Transfer / ACH</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                First Execution Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

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
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:opacity-50"
            >
              {loading ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{initialData ? 'Update Rule' : 'Schedule Rule'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
