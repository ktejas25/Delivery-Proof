import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

interface CustomerDeliveryChartProps {
  deliveries: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center gap-1.5">
          <Calendar size={13} className="text-indigo-600" />
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-xs"
                style={{ backgroundColor: entry.color }}
              />
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

export const CustomerDeliveryChart: React.FC<CustomerDeliveryChartProps> = ({
  deliveries,
}) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');

  const chartData = useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      // Mock historical curve if brand new account with 0 deliveries
      return [
        { period: 'May', delivered: 0, active: 0 },
        { period: 'Jun', delivered: 0, active: 0 },
        { period: 'Jul', delivered: 0, active: 0 },
        { period: 'Aug', delivered: 0, active: 0 },
        { period: 'Sep', delivered: 0, active: 0 },
        { period: 'Oct', delivered: 0, active: 0 },
      ];
    }

    const periodsMap: { [key: string]: { delivered: number; active: number } } =
      {};

    // Last 6 months by default
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate last 6 month labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()];
      periodsMap[label] = { delivered: 0, active: 0 };
    }

    deliveries.forEach((d) => {
      const date = new Date(d.created_at || d.scheduled_time || Date.now());
      const label = months[date.getMonth()];
      if (periodsMap[label]) {
        const status = (d.status || d.delivery_status || '').toLowerCase();
        if (status === 'delivered') {
          periodsMap[label].delivered += 1;
        } else {
          periodsMap[label].active += 1;
        }
      }
    });

    return Object.entries(periodsMap).map(([period, counts]) => ({
      period,
      delivered: counts.delivered,
      active: counts.active,
      total: counts.delivered + counts.active,
    }));
  }, [deliveries]);

  const totalDelivered = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.delivered, 0),
    [chartData]
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Order Fulfillment & Volume Trends
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp size={11} className="mr-1" />
              Reliable
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Your monthly delivery volume and completed package counts
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Delivered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Active/Pending</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-[220px] w-full min-w-0" style={{ minHeight: 220, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={220} minWidth={0}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="customerDeliveredGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="customerActiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="period"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="delivered"
              name="Delivered"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#customerDeliveredGrad)"
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active / Other"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#customerActiveGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Summary */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <strong className="text-slate-800 font-bold">{totalDelivered}</strong> total packages safely fulfilled
        </span>
        <span className="text-[11px] text-slate-400">Past 6 months</span>
      </div>
    </div>
  );
};

export default CustomerDeliveryChart;
