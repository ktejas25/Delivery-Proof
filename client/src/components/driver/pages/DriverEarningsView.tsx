import React, { memo } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import { Delivery } from "../types";
import { formatOrderNumber, formatTime } from "../utils";

interface DriverEarningsViewProps {
  deliveries: Delivery[];
  shiftTime: string;
  totalEarnings: number;
  onEndShift: () => void;
}

const DriverEarningsView: React.FC<DriverEarningsViewProps> = memo(
  ({ deliveries, shiftTime, totalEarnings, onEndShift }) => {
    const completedDeliveries = deliveries.filter(
      (d) => d.delivery_status === "delivered"
    );
    const avgPerDelivery =
      completedDeliveries.length > 0
        ? totalEarnings / completedDeliveries.length
        : 50;

    return (
      <div className="space-y-4">
        {/* Hero Earnings Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-600/15 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <DollarSign size={14} />
                Today's Earnings
              </span>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={11} />
                Active Shift
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                ${totalEarnings.toFixed(2)}
              </h1>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                {completedDeliveries.length} completed drops across this shift
              </p>
            </div>

            {/* Quick Metrics Inside Hero */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1 text-[11px] text-emerald-100 mb-0.5">
                  <Clock size={12} />
                  <span>Shift Time</span>
                </div>
                <p className="font-mono font-bold text-sm">{shiftTime}</p>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1 text-[11px] text-emerald-100 mb-0.5">
                  <TrendingUp size={12} />
                  <span>Avg / Drop</span>
                </div>
                <p className="font-bold text-sm">${avgPerDelivery.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Payout Summary */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <PackageCheck size={18} className="mx-auto text-blue-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-500 block">
              Drops Done
            </span>
            <span className="text-base font-bold text-slate-900">
              {completedDeliveries.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <Award size={18} className="mx-auto text-amber-500 mb-1" />
            <span className="text-[11px] font-semibold text-slate-500 block">
              Rating
            </span>
            <span className="text-base font-bold text-slate-900">
              4.9 ★
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <CheckCircle2 size={18} className="mx-auto text-emerald-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-500 block">
              On-Time
            </span>
            <span className="text-base font-bold text-slate-900">
              96%
            </span>
          </div>
        </div>

        {/* Earnings Breakdown Per Completed Delivery */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shift Drop Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              Base Fee + Tip
            </span>
          </div>

          {completedDeliveries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {completedDeliveries.map((delivery, idx) => {
                const orderDisplay = formatOrderNumber(delivery.order_number, idx + 1);
                const payout = delivery.earnings || 50;

                return (
                  <div
                    key={delivery.uuid}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        #{orderDisplay}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {delivery.customer_name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[320px]">
                          {delivery.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-sm text-emerald-700">
                        +${payout.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {formatTime(delivery.scheduled_time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No completed deliveries yet for this shift. Complete deliveries to see your earnings breakdown.
            </div>
          )}

          {/* End Shift Action */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={onEndShift}
              className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Conclude & Finalize Shift</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

DriverEarningsView.displayName = "DriverEarningsView";

export default DriverEarningsView;
