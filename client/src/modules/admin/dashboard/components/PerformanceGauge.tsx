import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertOctagon, Activity } from 'lucide-react';
import { PerformanceMetrics } from '../types';

interface PerformanceGaugeProps {
  metrics: PerformanceMetrics;
}

export const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">SLA Performance Meters</h3>
              <p className="text-xs text-slate-400">Enterprise fulfillment reliability</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            {metrics.avgVerificationScore}% Quality
          </span>
        </div>

        {/* Metrics Progress Bars */}
        <div className="space-y-4 mt-5">
          {/* On-Time Delivery Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" />
                On-Time Delivery Rate
              </span>
              <span className="font-bold text-slate-900">{metrics.onTimeRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.onTimeRate)}%` }}
              />
            </div>
          </div>

          {/* Proof Verification Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Proof Verification Rate
              </span>
              <span className="font-bold text-slate-900">{metrics.proofVerificationRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.proofVerificationRate)}%` }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-teal-500" />
                Successful Completion
              </span>
              <span className="font-bold text-slate-900">{metrics.completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.completionRate)}%` }}
              />
            </div>
          </div>

          {/* Failure Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-600 flex items-center gap-1.5">
                <AlertOctagon size={14} className="text-red-500" />
                Delivery Failure Rate
              </span>
              <span className="font-bold text-slate-900">{metrics.failureRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.failureRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Average Delivery Duration Card */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Avg Delivery Duration</span>
          <span className="text-lg font-extrabold text-slate-900">
            {metrics.averageDeliveryTime} <span className="text-xs font-semibold text-slate-500">mins / order</span>
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600">
          Target: ≤ 40m
        </div>
      </div>
    </div>
  );
};
