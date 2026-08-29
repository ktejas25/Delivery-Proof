import React from 'react';
import { 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  CalendarClock,
  ArrowUpRight
} from 'lucide-react';
import CountUp from 'react-countup';
import { DashboardSummary } from '../types';

interface DashboardKpiGridProps {
  summary: DashboardSummary;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({ summary, onNavigateTab }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${summary.currencySymbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${summary.currencySymbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${summary.currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Deliveries</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Truck size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.totalDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {summary.totalDeliveriesChange >= 0 ? (
              <span className="inline-flex items-center text-emerald-600 font-semibold">
                <TrendingUp size={13} className="mr-0.5" />
                +{summary.totalDeliveriesChange}%
              </span>
            ) : (
              <span className="inline-flex items-center text-red-500 font-semibold">
                <TrendingDown size={13} className="mr-0.5" />
                {summary.totalDeliveriesChange}%
              </span>
            )}
            <span className="text-gray-400">vs past 30d</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 2. Today's Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Deliveries</span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarClock size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.todayDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
              {summary.todayCompleted} completed
            </span>
            <span className="text-gray-400">{summary.todayRemaining} in queue</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 3. Completed Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</span>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.completedDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {summary.completionRate}% Rate
            </span>
            <span className="text-gray-400 font-medium">{summary.completedChange >= 0 ? `+${summary.completedChange}%` : `${summary.completedChange}%`}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 4. Failed Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-red-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed Attempts</span>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <XCircle size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.failedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
              {summary.failureRate}% Failure Rate
            </span>
            <span className="text-gray-400">{summary.failedDeliveries > 0 ? 'Action required' : 'Optimal'}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 5. Disputed Deliveries */}
      <div 
        onClick={() => onNavigateTab('Disputes')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Disputes</span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.disputedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
              summary.disputeSeverity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}>
              {summary.disputeSeverity === 'high' ? 'High Priority' : 'Investigating'}
            </span>
            <span className="text-gray-400">Click to review</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 6. Revenue */}
      <div 
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logistics Revenue</span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {formatCurrency(summary.revenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              <TrendingUp size={13} className="mr-0.5" />
              +{summary.revenueChange}%
            </span>
            <span className="text-gray-400">vs past period</span>
          </div>
        </div>
      </div>

      {/* 7. Active Customers */}
      <div 
        onClick={() => onNavigateTab('Customers')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Customers</span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            <CountUp end={summary.customers} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              <TrendingUp size={13} className="mr-0.5" />
              +{summary.customerChange}%
            </span>
            <span className="text-gray-400">client growth</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* 8. Drivers Online */}
      <div 
        onClick={() => onNavigateTab('Drivers')}
        className="group bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Drivers Online</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Radio size={20} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {summary.driversOnline}
            </span>
            <span className="text-sm font-semibold text-gray-400">
              / {summary.totalDrivers} total
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {summary.driversOnDelivery} on delivery
            </span>
            <span className="text-gray-400">• {summary.driversOffline} offline</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </div>
  );
};
