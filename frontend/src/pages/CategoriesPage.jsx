import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CategoryModal } from '../components/CategoryModal';
import { DeleteCategoryModal } from '../components/DeleteCategoryModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Layers,
  CheckCircle,
  Archive,
  ArrowUpRight,
  ArrowDownLeft,
  Lock
} from 'lucide-react';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const systemCount = categories.filter((c) => c.isSystem).length;
  const customCount = categories.filter((c) => !c.isSystem).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Category Intelligence</h2>
          <p className="text-xs text-[#737373]">
            {categories.length} total categories ({systemCount} system protected, {customCount} custom user defined)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsCreateModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.12)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#141414] rounded-xl border border-[#262626] max-w-xs">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'EXPENSE'
              ? 'bg-[#292929] text-white shadow-sm border border-[#383838]'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-fintech-red" />
          <span>Expense ({categories.filter((c) => c.type === 'EXPENSE').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'INCOME'
              ? 'bg-[#292929] text-white shadow-sm border border-[#383838]'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-fintech-green" />
          <span>Income ({categories.filter((c) => c.type === 'INCOME').length})</span>
        </button>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="fintech-card p-5 flex flex-col justify-between hover-glow group relative"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border font-mono text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}40`,
                      color: cat.color || '#FFFFFF',
                    }}
                  >
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-0.5">
                      {cat.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-[#888888] font-mono">
                          <Lock className="w-3 h-3 text-[#525252]" /> System Protected
                        </span>
                      ) : (
                        <span className="text-white/80 font-mono">Custom Category</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* System vs Custom Actions */}
                {!cat.isSystem && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
                      title="Rename / Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Card Info: Transaction Count */}
              <div className="pt-3 border-t border-[#242424] flex items-center justify-between text-xs font-mono">
                <span className="text-[#737373]">Referenced Transactions</span>
                <span className="px-2 py-0.5 rounded-md bg-[#222222] border border-[#2e2e2e] text-white font-bold">
                  {cat.transactionCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      <CategoryModal
        isOpen={isCreateModalOpen}
        initialData={editingCategory}
        defaultType={activeTab}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
      />

      {/* Category Delete / Reassign Modal */}
      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        category={deletingCategory}
        allCategories={categories}
        onClose={() => setDeletingCategory(null)}
        onSuccess={fetchCategories}
      />
    </div>
  );
};
