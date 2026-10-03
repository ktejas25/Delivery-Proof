import React from 'react';
import {
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  Star,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import CountUp from 'react-countup';

export interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalAddresses: number;
  ratingsCount: number;
  verificationRate: number;
}

interface CustomerKpiGridProps {
  stats: CustomerStats;
  onNavigateTab: (tabId: string) => void;
}

export const CustomerKpiGrid: React.FC<CustomerKpiGridProps> = ({
  stats,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
      {/* 1. Total Orders */}
      <div
        onClick={() => onNavigateTab('history')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Orders
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Package size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={stats.totalOrders} duration={1.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <TrendingUp size={13} className="text-emerald-500" />
            <span>Lifetime order history</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 2. In Transit / Active */}
      <div
        onClick={() => onNavigateTab('active')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Shipments
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 relative">
            <Truck size={18} />
            {stats.activeOrders > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-baseline gap-2">
            <CountUp end={stats.activeOrders} duration={1.2} />
            {stats.activeOrders > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Tracking
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>
              {stats.activeOrders === 0
                ? "No incoming packages"
                : `${stats.activeOrders} out for delivery`}
            </span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 3. Delivered & Proof Verified */}
      <div
        onClick={() => onNavigateTab('history')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Proof Verified
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={stats.deliveredOrders} duration={1.2} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {stats.verificationRate}% photo/sig proof
            </span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 4. Saved Locations */}
      <div
        onClick={() => onNavigateTab('addresses')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Saved Addresses
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <MapPin size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={stats.totalAddresses} duration={1.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Verified delivery drop-offs</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* 5. Driver Ratings & Feedback */}
      <div
        onClick={() => onNavigateTab('history')}
        className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Feedback Given
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Star size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            <CountUp end={stats.ratingsCount} duration={1.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
            <span>Driver service reviews</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600">
          <ArrowUpRight size={15} />
        </div>
      </div>
    </div>
  );
};

export default CustomerKpiGrid;
