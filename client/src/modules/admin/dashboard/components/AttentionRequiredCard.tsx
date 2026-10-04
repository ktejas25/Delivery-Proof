import React from 'react';
import { AlertTriangle, ShieldAlert, XCircle, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AttentionRequiredSummary } from '../types';

interface AttentionRequiredCardProps {
  exceptions: AttentionRequiredSummary;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({
  exceptions,
  onNavigateTab
}) => {
  const totalExceptions = 
    exceptions.activeDisputes + exceptions.failedProofs + exceptions.failedDeliveries + exceptions.systemWarnings;

  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500 opacity-90" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Attention Required</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Critical exceptions & compliance triage items</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${
            exceptions.highPriorityDisputes > 0 
              ? 'bg-rose-500/10 text-rose-700 border-rose-200' 
              : totalExceptions > 0
              ? 'bg-amber-500/10 text-amber-700 border-amber-200'
              : 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
          }`}>
            {totalExceptions > 0 ? `${totalExceptions} Exceptions` : '● All Clear'}
          </span>
        </div>

        {/* Exceptions List */}
        <div className="space-y-3 mt-4">
          {/* 1. Active Disputes */}
          <div 
            onClick={() => onNavigateTab('Disputes')}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-xs cursor-pointer transition-all duration-200 group/item bg-gradient-to-r from-amber-50/20 via-transparent to-transparent border-l-4 border-l-amber-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover/item:scale-105 transition-transform ring-1 ring-amber-200/60 shadow-2xs">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  {exceptions.activeDisputes} Active Disputes
                  {exceptions.highPriorityDisputes > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-800 border border-rose-500/20">
                      {exceptions.highPriorityDisputes} High Priority
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Claims flagged for manual fraud investigation</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover/item:text-amber-600 group-hover/item:translate-x-0.5 transition-all" />
          </div>

          {/* 2. Failed Proofs */}
          <div 
            onClick={() => onNavigateTab('Deliveries')}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-rose-400 hover:bg-rose-50/30 hover:shadow-xs cursor-pointer transition-all duration-200 group/item bg-gradient-to-r from-rose-50/20 via-transparent to-transparent border-l-4 border-l-rose-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover/item:scale-105 transition-transform ring-1 ring-rose-200/60 shadow-2xs">
                <AlertOctagon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  {exceptions.failedProofs} Flagged Proofs
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">AI verification score &lt; 40% (low lighting / blurry)</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover/item:text-rose-500 group-hover/item:translate-x-0.5 transition-all" />
          </div>

          {/* 3. Failed Deliveries */}
          <div 
            onClick={() => onNavigateTab('Deliveries')}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-red-400 hover:bg-red-50/30 hover:shadow-xs cursor-pointer transition-all duration-200 group/item bg-gradient-to-r from-red-50/20 via-transparent to-transparent border-l-4 border-l-red-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover/item:scale-105 transition-transform ring-1 ring-red-200/60 shadow-2xs">
                <XCircle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  {exceptions.failedDeliveries} Failed Attempts
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Recipient unavailable or incorrect delivery address</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover/item:text-red-600 group-hover/item:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">Click any exception category to audit records</span>
        <span className="font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-xl ring-1 ring-emerald-500/20 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 size={13} className="text-emerald-600" /> SLA Monitored
        </span>
      </div>
    </div>
  );
};
