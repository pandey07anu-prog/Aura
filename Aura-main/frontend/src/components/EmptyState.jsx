import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="fintech-card p-12 text-center flex flex-col items-center justify-center my-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#1c1c1c] border border-[#2b2b2b] flex items-center justify-center text-white/80 mb-5 shadow-inner">
          <Icon className="w-7 h-7 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#737373] max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
