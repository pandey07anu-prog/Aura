import React, { useState, useEffect } from 'react';
import { X, Check, PieChart, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const BudgetModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const currentDate = new Date();
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [alertThreshold, setAlertThreshold] = useState(80);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch expense categories
  useEffect(() => {
    if (!isOpen) return;
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories?type=EXPENSE');
        if (res.data?.success) {
          const list = res.data.data || [];
          setCategories(list);
          if (!initialData && list.length > 0 && !category) {
            setCategory(list[0].name);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '');
      setName(initialData.name || '');
      setMonthlyLimit(initialData.monthlyLimit ? initialData.monthlyLimit.toString() : '');
      setMonth(initialData.month || currentDate.getMonth() + 1);
      setYear(initialData.year || currentDate.getFullYear());
      setAlertThreshold(initialData.alertThreshold || 80);
    } else {
      setName('');
      setMonthlyLimit('');
      setMonth(currentDate.getMonth() + 1);
      setYear(currentDate.getFullYear());
      setAlertThreshold(80);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (!limit || limit <= 0) {
      setError('Please provide a valid monthly limit greater than zero.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      category,
      name: name.trim() || `${category} Budget`,
      monthlyLimit: limit,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      alertThreshold: parseFloat(alertThreshold),
    };

    try {
      if (initialData?.id) {
        await api.put(`/budgets/${initialData.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save budget';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#141414] border border-[#292929] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#292929] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white">
              {initialData ? 'Edit Budget' : 'Create Monthly Budget'}
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

          {/* Category */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Expense Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!initialData}
              required
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#171717] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Limit Amount */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Monthly Spending Limit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-mono text-[#A3A3A3]">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-9 pr-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1} className="bg-[#171717] text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Year
              </label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono uppercase text-[#A3A3A3]">Alert Warning Threshold</span>
              <span className="font-mono text-white font-bold">{alertThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full accent-white h-1.5 bg-[#262626] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#737373] mt-1.5">
              Dispatches an in-app and email warning when spending reaches {alertThreshold}% of this limit.
            </p>
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
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{initialData ? 'Update Budget' : 'Save Budget'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
