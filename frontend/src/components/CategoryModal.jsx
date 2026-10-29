import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../services/api';

const AVAILABLE_ICONS = [
  'tag', 'shopping-bag', 'utensils', 'car', 'home', 'zap', 'heart-pulse',
  'graduation-cap', 'film', 'plane', 'wallet', 'laptop', 'briefcase',
  'trending-up', 'gift', 'dollar-sign', 'coffee', 'smartphone', 'shield'
];

const PRESET_COLORS = [
  '#FFFFFF', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#A3A3A3'
];

export const CategoryModal = ({ isOpen, onClose, onSuccess, initialData = null, defaultType = 'EXPENSE' }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType);
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType(initialData.type || defaultType || 'EXPENSE');
      setIcon(initialData.icon || 'tag');
      setColor(initialData.color || '#FFFFFF');
    } else {
      setName('');
      setType(defaultType || 'EXPENSE');
      setIcon('tag');
      setColor('#FFFFFF');
    }
    setError('');
  }, [initialData, isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      type,
      icon,
      color,
    };

    try {
      if (initialData?.id) {
        await api.put(`/categories/${initialData.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      window.dispatchEvent(new Event('aura:transaction-updated'));
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save category';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#141414] border border-[#292929] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#292929] flex items-center justify-between bg-[#111111]">
          <h2 className="text-base font-bold text-white">
            {initialData ? 'Edit Category' : 'Create Custom Category'}
          </h2>
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
              Expense Category
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
              Income Category
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-2">
              Select Icon: <span className="text-white font-mono">{icon}</span>
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-[#1a1a1a] rounded-xl border border-[#262626]">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-white text-black border-white'
                      : 'bg-[#141414] border-[#292929] text-[#A3A3A3] hover:text-white hover:border-[#383838]'
                  }`}
                >
                  <span className="text-[10px] font-mono capitalize truncate">{ic.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    color === c ? 'scale-110 border-white ring-2 ring-white/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#292929]">
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
                  <span>{initialData ? 'Update Category' : 'Create Category'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
