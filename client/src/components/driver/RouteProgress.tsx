import React, { memo } from "react";
import { Clock, DollarSign, PackageCheck, Route } from "lucide-react";

interface RouteProgressProps {
  total: number;
  completed: number;
  completionPercentage: number;
  totalEarnings: number;
  shiftTime: string;
}

const RouteProgress: React.FC<RouteProgressProps> = memo(
  ({
    total,
    completed,
    completionPercentage,
    totalEarnings,
    shiftTime,
  }) => {
    const remaining = Math.max(0, total - completed);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        {/* Top Progress Info */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Route size={16} className="text-blue-600 flex-shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              Today's Route
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 flex-shrink-0">
            <span className="text-slate-900 font-bold">
              {completed} of {total}
            </span>
            <span>completed</span>
            {remaining > 0 ? (
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {remaining} left
              </span>
            ) : total > 0 ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                All done!
              </span>
            ) : null}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Secondary Compact Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Shift Time */}
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <Clock size={14} className="text-amber-500 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Shift</span>
              <span className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs">
                {shiftTime}
              </span>
            </div>
          </div>

          {/* Earnings */}
          <div className="flex items-center justify-center gap-1.5 text-slate-600 min-w-0">
            <DollarSign size={14} className="text-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Earned</span>
              <span className="font-bold text-emerald-700 text-[11px] sm:text-xs">
                ${totalEarnings.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Completion % */}
          <div className="flex items-center justify-end gap-1.5 text-slate-600 min-w-0">
            <PackageCheck size={14} className="text-indigo-600 flex-shrink-0" />
            <div className="truncate text-right">
              <span className="font-bold text-indigo-700 text-[11px] sm:text-xs">
                {completionPercentage}%
              </span>
              <span className="text-slate-400 text-[11px] ml-1 hidden sm:inline">done</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RouteProgress.displayName = "RouteProgress";

export default RouteProgress;
