import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertOctagon, Activity, Sparkles } from 'lucide-react';
import CountUp from 'react-countup';
import { PerformanceMetrics } from '../types';

interface PerformanceGaugeProps {
  metrics: PerformanceMetrics;
}

export const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({ metrics }) => {
  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 opacity-90" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Activity size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">SLA Performance Meters</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise fulfillment reliability</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 shadow-2xs flex items-center gap-1">
            <Sparkles size={11} className="text-emerald-500" />
            {metrics.avgVerificationScore}% Quality
          </span>
        </div>

        {/* Metrics Progress Bars */}
        <div className="space-y-4 mt-5">
          {/* On-Time Delivery Rate */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" />
                On-Time Delivery Rate
              </span>
              <span className="font-black text-slate-900 text-sm">
                <CountUp end={metrics.onTimeRate} decimals={1} duration={1.2} />%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.onTimeRate)}%` }}
              />
            </div>
          </div>

          {/* Proof Verification Rate */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Proof Verification Rate
              </span>
              <span className="font-black text-slate-900 text-sm">
                <CountUp end={metrics.proofVerificationRate} decimals={1} duration={1.2} />%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.proofVerificationRate)}%` }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-teal-500" />
                Successful Completion
              </span>
              <span className="font-black text-slate-900 text-sm">
                <CountUp end={metrics.completionRate} decimals={1} duration={1.2} />%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.completionRate)}%` }}
              />
            </div>
          </div>

          {/* Failure Rate */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <AlertOctagon size={14} className="text-rose-500" />
                Delivery Failure Rate
              </span>
              <span className="font-black text-slate-900 text-sm">
                <CountUp end={metrics.failureRate} decimals={1} duration={1.2} />%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.failureRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Average Delivery Duration Card */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Delivery Duration</span>
          <span className="text-lg font-black text-slate-900">
            {metrics.averageDeliveryTime} <span className="text-xs font-semibold text-slate-500">mins / order</span>
          </span>
        </div>
        <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-bold text-slate-700 shadow-2xs">
          Target: ≤ 40m
        </div>
      </div>
    </div>
  );
};

