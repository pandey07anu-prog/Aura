import React from 'react';

export const CardSkeleton = () => (
  <div className="fintech-card p-6 h-40 flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-24 h-3 bg-[#242424] rounded" />
      <div className="w-8 h-8 bg-[#242424] rounded-lg" />
    </div>
    <div className="w-36 h-8 bg-[#2a2a2a] rounded" />
    <div className="w-48 h-3 bg-[#242424] rounded" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="fintech-card overflow-hidden">
    <div className="p-4 border-b border-[#292929] bg-[#141414] flex gap-4">
      <div className="w-24 h-4 bg-[#262626] rounded" />
      <div className="w-32 h-4 bg-[#262626] rounded" />
      <div className="w-20 h-4 bg-[#262626] rounded ml-auto" />
    </div>
    <div className="divide-y divide-[#242424]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#222222] rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <div className="w-36 h-3.5 bg-[#262626] rounded" />
              <div className="w-20 h-2.5 bg-[#1f1f1f] rounded" />
            </div>
          </div>
          <div className="w-24 h-4 bg-[#262626] rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="fintech-card p-6 h-80 flex flex-col justify-between animate-pulse">
    <div className="w-36 h-4 bg-[#262626] rounded mb-6" />
    <div className="flex-1 flex items-end justify-between gap-3 px-4 pb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-[#222222] rounded-t"
          style={{ height: `${20 + (i % 4) * 20}%` }}
        />
      ))}
    </div>
  </div>
);
