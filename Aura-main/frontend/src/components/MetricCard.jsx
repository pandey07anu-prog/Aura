import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({ title, amount, icon: Icon, changePercent, subtitle, isCurrency = true, prefix = '₹', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth numeric counter animation
  useEffect(() => {
    const target = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const duration = 600; // ms
    const steps = 25;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [amount]);

  const isNegative = displayValue < 0;
  const absValue = Math.abs(displayValue);
  const formattedAbs = absValue.toLocaleString('en-IN', {
    minimumFractionDigits: isCurrency ? 2 : (suffix ? 1 : 0),
    maximumFractionDigits: isCurrency ? 2 : (suffix ? 1 : 2),
  });

  const formattedAmount = isCurrency
    ? (isNegative ? `-${prefix}${formattedAbs}` : `${prefix}${formattedAbs}`)
    : (isNegative ? `-${formattedAbs}${suffix}` : `${formattedAbs}${suffix}`);

  const hasChange = changePercent !== null && changePercent !== undefined;
  const isPositiveChange = hasChange && changePercent > 0;
  const isNegativeChange = hasChange && changePercent < 0;

  return (
    <div className="fintech-card p-6 flex flex-col justify-between hover-glow group relative overflow-hidden">
      {/* Subtle top shimmer bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase font-mono tracking-wider text-[#A3A3A3]">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#1f1f1f] border border-[#2e2e2e] flex items-center justify-center text-white/90 group-hover:border-white/30 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Amount Display */}
      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono fintech-number tracking-tight">
          {formattedAmount}
        </div>
      </div>

      {/* Comparison Badge / Subtitle */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#242424] text-xs">
        {hasChange ? (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] ${
              isPositiveChange
                ? 'bg-fintech-greenSubtle text-fintech-green border border-fintech-green/20'
                : isNegativeChange
                ? 'bg-fintech-redSubtle text-fintech-red border border-fintech-red/20'
                : 'bg-white/5 text-[#A3A3A3] border border-white/10'
            }`}
          >
            {isPositiveChange && <TrendingUp className="w-3 h-3" />}
            {isNegativeChange && <TrendingDown className="w-3 h-3" />}
            {!isPositiveChange && !isNegativeChange && <Minus className="w-3 h-3" />}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        ) : null}

        <span className="text-[#737373] text-[11px] truncate">
          {subtitle || (hasChange ? 'vs last period' : 'Current month')}
        </span>
      </div>
    </div>
  );
};
