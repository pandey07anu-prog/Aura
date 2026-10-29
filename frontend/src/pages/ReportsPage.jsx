import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { formatINR } from '../utils/formatters';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ReportsPage = () => {
  const currentDate = new Date();
  const [rangePreset, setRangePreset] = useState('30d'); // '30d', '6m', '1y', 'custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?startDate=${startDate}&endDate=${endDate}`);
      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const handleUpdate = () => fetchReports();
    window.addEventListener('aura:transaction-updated', handleUpdate);
    return () => window.removeEventListener('aura:transaction-updated', handleUpdate);
  }, [startDate, endDate]);

  const handlePresetChange = (preset) => {
    setRangePreset(preset);
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    setEndDate(end);

    if (preset === '30d') {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (preset === '6m') {
      const start = new Date();
      start.setMonth(now.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (preset === '1y') {
      const start = new Date();
      start.setFullYear(now.getFullYear() - 1);
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/reports/export-csv?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aura_finance_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const summary = reports?.summary;
  const hasData = summary?.hasData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl p-3 shadow-xl text-xs font-mono">
          <div className="text-[#A3A3A3] mb-1">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2" style={{ color: entry.color || '#fff' }}>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reports & Financial Analytics</h2>
          <p className="text-xs text-[#737373]">
            Deep monetary breakdowns, cash flow metrics, and compliant CSV exports
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting || !hasData}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.12)] self-start sm:self-auto disabled:opacity-40"
          title="Download RFC4180 CSV"
        >
          <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
          <span>{exporting ? 'Exporting...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* Date Range Selector Bar */}
      <div className="fintech-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-xl border border-[#242424] w-full md:w-auto">
          {[
            { id: '30d', label: 'Last 30 Days' },
            { id: '6m', label: 'Last 6 Months' },
            { id: '1y', label: 'This Year' },
            { id: 'custom', label: 'Custom' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                rangePreset === preset.id
                  ? 'bg-[#292929] text-white shadow-sm border border-[#383838]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setRangePreset('custom');
              setStartDate(e.target.value);
            }}
            className="w-full md:w-auto bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
          />
          <span className="text-[#525252] font-mono">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setRangePreset('custom');
              setEndDate(e.target.value);
            }}
            className="w-full md:w-auto bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Income"
            amount={summary?.totalIncome || 0}
            icon={ArrowDownLeft}
            changePercent={summary?.incomeChangePercent}
            subtitle="vs prior period"
          />
          <MetricCard
            title="Total Expenses"
            amount={summary?.totalExpenses || 0}
            icon={ArrowUpRight}
            changePercent={summary?.expenseChangePercent}
            subtitle="vs prior period"
          />
          <MetricCard
            title="Net Cash Flow"
            amount={summary?.currentBalance || 0}
            icon={Wallet}
            subtitle="Net retained capital"
          />
          <MetricCard
            title="Savings Rate"
            amount={summary?.savingsRate || 0}
            isCurrency={false}
            prefix=""
            suffix="%"
            icon={TrendingUp}
            subtitle={`${summary?.totalTransactions || 0} transactions analyzed`}
          />
        </div>
      )}

      {/* Area Trend Chart */}
      {!loading && hasData && (
        <div className="fintech-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Cash Flow Dynamics</h3>
              <p className="text-xs text-[#737373]">Income vs Expenses trajectory across 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span className="text-[#A3A3A3]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#525252]" />
                <span className="text-[#A3A3A3]">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={reports?.monthlyTrends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#525252" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#525252" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#525252"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#292929' }}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#292929' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#525252"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      {!loading && hasData && (
        <div className="fintech-card overflow-hidden">
          <div className="p-6 border-b border-[#242424] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Category Spending Distribution</h3>
              <p className="text-xs text-[#737373]">
                Full breakdown of capital allocated across categories for this period
              </p>
            </div>
            {reports?.highestSpendingCategory && (
              <span className="text-xs font-mono text-[#A3A3A3] hidden sm:block">
                Top Category: <span className="text-white font-bold">{reports.highestSpendingCategory.category}</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] border-b border-[#292929] text-[#737373] uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Share of Total</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {reports?.categoryDistribution?.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color || '#FFFFFF' }}
                      />
                      <span>{cat.category}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#A3A3A3]">
                      {cat.count} transaction{cat.count > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-28 bg-[#242424] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[#737373]">{cat.percentage?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatINR(cat.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasData && (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Available for This Period"
          description="There were no financial transactions logged between the selected dates. Change the date range or record a transaction."
        />
      )}
    </div>
  );
};
