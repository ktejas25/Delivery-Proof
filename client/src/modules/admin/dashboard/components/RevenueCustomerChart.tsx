import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { DeliveryTrendPoint } from '../types';

interface RevenueCustomerChartProps {
  trendData?: DeliveryTrendPoint[];
  totalRevenue?: number;
  totalCustomers?: number;
  currencySymbol?: string;
  refreshTrigger?: number;
}

interface FinancialSummary {
  totalRevenue: number;
  periodRevenue: number;
  allTimeRevenue?: number;
  revenueChange: number;
  totalCustomers: number;
  newCustomers: number;
  growthRate: number;
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[190px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center gap-1.5">
          <Calendar size={13} className="text-indigo-600" />
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900">
              {entry.dataKey === 'revenue' ? `${currencySymbol}${Number(entry.value).toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueCustomerChart: React.FC<RevenueCustomerChartProps> = ({
  currencySymbol = '₹',
  refreshTrigger = 0
}) => {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('30d');
  const [loading, setLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    periodRevenue: 0,
    allTimeRevenue: 0,
    revenueChange: 0,
    totalCustomers: 0,
    newCustomers: 0,
    growthRate: 0
  });

  const fetchFinancialTrends = useCallback(async (range: 'today' | '7d' | '30d') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/dashboard/financial-trends?range=${range}`);
      if (res.data) {
        if (Array.isArray(res.data.data)) {
          setChartData(res.data.data);
        }
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load real-time financial trends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialTrends(timeframe);
  }, [fetchFinancialTrends, timeframe, refreshTrigger]);

  const displayedRevenue = summary.periodRevenue;
  const growthRate = summary.revenueChange;
  const isPositiveGrowth = growthRate > 0;
  const isNegativeGrowth = growthRate < 0;

  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
      
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue & Customer Growth</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                isPositiveGrowth
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : isNegativeGrowth
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}>
                {isPositiveGrowth ? (
                  <TrendingUp size={11} className="mr-1 text-emerald-600" />
                ) : isNegativeGrowth ? (
                  <TrendingDown size={11} className="mr-1 text-rose-600" />
                ) : (
                  <TrendingUp size={11} className="mr-1 text-indigo-600" />
                )}
                {isPositiveGrowth ? `+${growthRate}% Growth` : isNegativeGrowth ? `${growthRate}% Growth` : 'Steady (0%)'}
              </span>
              {loading && <Loader2 size={13} className="text-indigo-600 animate-spin ml-1" />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial realization & client account expansion trajectory
            </p>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {(['today', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
              {timeframe === 'today' ? "Today's Revenue" : timeframe === '7d' ? "7-Day Revenue" : "Logistics Revenue"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {currencySymbol}{displayedRevenue.toLocaleString()}
              </span>
              <span className={`text-xs font-bold ${
                isPositiveGrowth
                  ? 'text-emerald-600'
                  : isNegativeGrowth
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}>
                {isPositiveGrowth ? `+${growthRate}%` : isNegativeGrowth ? `${growthRate}%` : '0.0%'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
              {timeframe === 'today' ? "Active Clients Today" : "Active Client Accounts"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {summary.totalCustomers} Clients
              </span>
              <span className="text-xs text-purple-600 font-bold">
                +{summary.newCustomers} new
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full min-h-[260px] h-64 relative" style={{ minWidth: 0 }}>
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            {loading ? 'Fetching real-time analytics...' : 'No financial trend data available for this timeframe.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Area
                type="monotone"
                dataKey="revenue"
                name={`Logistics Revenue (${currencySymbol})`}
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                dataKey="activeClients"
                name="Active Accounts"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#clientGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
