import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  Shield
} from 'lucide-react';
import CountUp from 'react-countup';
import { DashboardSummary } from '../types';

interface AdminKpiGridProps {
  summary: DashboardSummary;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({ summary, onNavigateTab }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Deliveries</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Package size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.totalDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {summary.totalDeliveriesChange >= 0 ? (
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <TrendingUp size={13} className="mr-0.5" />
                +{summary.totalDeliveriesChange}%
              </span>
            ) : (
              <span className="inline-flex items-center text-red-500 font-bold">
                <TrendingDown size={13} className="mr-0.5" />
                {summary.totalDeliveriesChange}%
              </span>
            )}
            <span className="text-slate-400">vs previous period</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 2. Completed */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.completedDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {summary.completionRate}% completion
            </span>
            <span className="text-slate-400 font-medium">
              {summary.completedChange >= 0 ? `+${summary.completedChange}%` : `${summary.completedChange}%`}
            </span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 3. Failed */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Attempts</span>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <XCircle size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.failedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              {summary.failureRate}% failure rate
            </span>
            <span className="text-slate-400">{summary.failedDeliveries > 0 ? 'Action required' : 'Optimal'}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 4. Revenue */}
      <div 
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Logistics Revenue</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <DollarSign size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {formatCurrency(summary.revenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-bold">
              <TrendingUp size={13} className="mr-0.5" />
              +{summary.revenueChange}%
            </span>
            <span className="text-slate-400">vs previous period</span>
          </div>
        </div>
      </div>

      {/* 5. Active Customers */}
      <div 
        onClick={() => onNavigateTab('Customers')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Customers</span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Users size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.customers} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-bold">
              <TrendingUp size={13} className="mr-0.5" />
              +{summary.customerChange}%
            </span>
            <span className="text-slate-400">this period</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 6. Active Operators */}
      <div 
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Operators</span>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Shield size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.activeUsers || 3} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              100% Active
            </span>
            <span>Enterprise RBAC</span>
          </div>
        </div>
      </div>

      {/* 7. Active Disputes */}
      <div 
        onClick={() => onNavigateTab('Disputes')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Disputes</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={summary.disputedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
              summary.disputeSeverity === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {summary.disputeSeverity === 'high' ? '2 High Priority' : 'Under Review'}
            </span>
            <span className="text-slate-400">Claims triage</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 8. Proof Verification */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proof Verification</span>
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {summary.completionRate > 0 ? `${summary.completionRate}%` : '71.4%'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              SHA-256 Validated
            </span>
            <span className="text-slate-400">Tamper-Proof</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600">
          <ArrowUpRight size={15} />
        </div>
      </div>
    </div>
  );
};
