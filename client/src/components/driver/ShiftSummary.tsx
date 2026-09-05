import React, { memo } from "react";
import { Clock, DollarSign, MapPin, CheckCircle2, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { GPSStatus } from "./types";
import { cn } from "./utils";


interface ShiftSummaryProps {
  shiftTime: string;
  totalEarnings: number;
  completedCount: number;
  totalCount: number;
  gpsStatus: GPSStatus;
  isOffline: boolean;
  syncQueueCount: number;
}

const ShiftSummary: React.FC<ShiftSummaryProps> = memo(
  ({
    shiftTime,
    totalEarnings,
    completedCount,
    totalCount,
    gpsStatus,
    isOffline,
    syncQueueCount,
  }) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shift Overview
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck size={12} />
              Active Shift
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Shift Timer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Clock size={13} className="text-amber-500" />
                <span>Shift Duration</span>
              </div>
              <p className="text-base font-mono font-bold text-slate-900">
                {shiftTime}
              </p>
            </div>

            {/* Earnings */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mb-1">
                <DollarSign size={13} className="text-emerald-600" />
                <span>Today's Earnings</span>
              </div>
              <p className="text-base font-bold text-emerald-800">
                ${totalEarnings.toFixed(2)}
              </p>
            </div>

            {/* Deliveries Count */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mb-1">
                <CheckCircle2 size={13} className="text-blue-600" />
                <span>Deliveries Done</span>
              </div>
              <p className="text-base font-bold text-blue-900">
                {completedCount} / {totalCount}
              </p>
            </div>

            {/* GPS & Network Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <MapPin size={13} className="text-indigo-500" />
                <span>Location GPS</span>
              </div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    gpsStatus === "live"
                      ? "bg-emerald-500"
                      : gpsStatus === "connecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-red-500"
                  )}
                />
                <span className="capitalize">{gpsStatus}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Driver Tip */}
        <div className="pt-3 border-t border-slate-100">
          {isOffline ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>Offline: Queued changes will sync once reconnected</span>
            </div>
          ) : syncQueueCount > 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              <Zap size={14} className="flex-shrink-0" />
              <span>{syncQueueCount} status update pending sync</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              <p className="font-semibold text-slate-700 mb-0.5">Driver Safe Tip</p>
              <p className="text-[11px] leading-tight">
                Always confirm parking brake is engaged before stepping out to complete proof of delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ShiftSummary.displayName = "ShiftSummary";

export default ShiftSummary;
