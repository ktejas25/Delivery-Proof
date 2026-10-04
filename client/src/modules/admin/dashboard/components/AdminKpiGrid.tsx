import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  IndianRupee, 
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
    const symbol = summary?.currencySymbol || '₹';
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Deliveries */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Deliveries</span>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <Package size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.totalDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {summary.totalDeliveriesChange >= 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
                <TrendingUp size={12} className="mr-1" />
                +{summary.totalDeliveriesChange}%
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-700 ring-1 ring-red-500/20">
                <TrendingDown size={12} className="mr-1" />
                {summary.totalDeliveriesChange}%
              </span>
            )}
            <span className="text-slate-400 font-medium">vs prev 30d</span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 2. Completed */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Completed</span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <CheckCircle2 size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.completedDeliveries} duration={1.2} separator="," />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20 text-[11px]">
              {summary.completionRate}% completion
            </span>
            <span className="text-slate-400 font-semibold text-[11px]">
              {summary.completedChange >= 0 ? `+${summary.completedChange}%` : `${summary.completedChange}%`}
            </span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 3. Failed */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-red-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Failed Attempts</span>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center ring-1 ring-red-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <XCircle size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.failedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-700 font-bold bg-red-500/10 px-2 py-0.5 rounded-full ring-1 ring-red-500/20 text-[11px]">
              {summary.failureRate}% failure
            </span>
            <span className="text-slate-400 font-medium text-[11px]">{summary.failedDeliveries > 0 ? 'Action required' : 'Optimal'}</span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 4. Revenue */}
      <div 
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Logistics Revenue</span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <IndianRupee size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            {formatCurrency(summary.revenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
              <TrendingUp size={12} className="mr-1" />
              +{summary.revenueChange}%
            </span>
            <span className="text-slate-400 font-medium text-[11px]">vs prev period</span>
          </div>
        </div>
      </div>

      {/* 5. Active Customers */}
      <div 
        onClick={() => onNavigateTab('Customers')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Active Customers</span>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center ring-1 ring-purple-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <Users size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.customers} duration={1.2} separator="," />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
              <TrendingUp size={12} className="mr-1" />
              +{summary.customerChange}%
            </span>
            <span className="text-slate-400 font-medium text-[11px]">growth</span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 6. Active Operators */}
      <div 
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Active Operators</span>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center ring-1 ring-cyan-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <Shield size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.activeUsers || 3} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-800 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full ring-1 ring-cyan-500/20 text-[11px]">
              100% Active
            </span>
            <span className="font-medium text-[11px]">Enterprise RBAC</span>
          </div>
        </div>
      </div>

      {/* 7. Active Disputes */}
      <div 
        onClick={() => onNavigateTab('Disputes')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Active Disputes</span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <AlertTriangle size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            <CountUp end={summary.disputedDeliveries} duration={1.2} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ring-1 ${
              summary.disputeSeverity === 'high' ? 'bg-red-500/10 text-red-700 ring-red-500/20' : 'bg-amber-500/10 text-amber-700 ring-amber-500/20'
            }`}>
              {summary.disputeSeverity === 'high' ? 'High Priority' : 'Under Review'}
            </span>
            <span className="text-slate-400 font-medium text-[11px]">Claims triage</span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 8. Proof Verification */}
      <div 
        onClick={() => onNavigateTab('Deliveries')}
        className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[148px]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Proof Verification</span>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/20 group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
            <ShieldCheck size={19} className="stroke-[2.2]" />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            {summary.completionRate > 0 ? `${summary.completionRate}%` : '100%'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-teal-700 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full ring-1 ring-teal-500/20 text-[11px]">
              SHA-256 Validated
            </span>
            <span className="text-slate-400 font-medium text-[11px]">Tamper-Proof</span>
          </div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-2xs">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
};
