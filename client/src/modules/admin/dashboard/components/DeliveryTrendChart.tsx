import React from 'react';
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
import { TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { DeliveryTrendPoint } from '../types';

interface DeliveryTrendChartProps {
  data: DeliveryTrendPoint[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[180px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center gap-1.5">
          <Calendar size={13} className="text-emerald-600" />
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DeliveryTrendChart: React.FC<DeliveryTrendChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  loading = false,
  onRefresh
}) => {
  const rangeOptions = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Enterprise Delivery Performance</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp size={11} className="mr-1" />
              SLA Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Volume distribution, completion SLA, failure & dispute trends
          </p>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onRangeChange(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedRange === opt.value
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all ${
                loading ? 'animate-spin' : ''
              }`}
              title="Refresh trend data"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full min-h-[300px] h-[320px] relative" style={{ minWidth: 0 }}>
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p>No delivery activity records found for this timeframe.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="disputedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
              />

              <Area
                type="monotone"
                dataKey="total"
                name="Total Scheduled"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalGrad)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Delivered"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#completedGrad)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed Attempts"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#failedGrad)"
              />
              <Area
                type="monotone"
                dataKey="disputed"
                name="Disputed"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#disputedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
