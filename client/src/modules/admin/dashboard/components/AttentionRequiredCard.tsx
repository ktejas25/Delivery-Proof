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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Attention Required</h3>
              <p className="text-xs text-slate-400">Critical exceptions & compliance triage items</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            exceptions.highPriorityDisputes > 0 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {totalExceptions > 0 ? `${totalExceptions} Exceptions` : 'All Clear'}
          </span>
        </div>

        {/* Exceptions List */}
        <div className="space-y-3 mt-4">
          {/* 1. Active Disputes */}
          <div 
            onClick={() => onNavigateTab('Disputes')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/20 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  {exceptions.activeDisputes} Active Disputes
                  {exceptions.highPriorityDisputes > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                      {exceptions.highPriorityDisputes} High Priority
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Claims flagged for manual fraud investigation</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          {/* 2. Failed Proofs */}
          <div 
            onClick={() => onNavigateTab('Deliveries')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertOctagon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {exceptions.failedProofs} Flagged Proofs
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">AI verification score &lt; 40% (low lighting / blurry)</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          </div>

          {/* 3. Failed Deliveries */}
          <div 
            onClick={() => onNavigateTab('Deliveries')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <XCircle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {exceptions.failedDeliveries} Failed Attempts
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Recipient unavailable or incorrect delivery address</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-red-600 transition-colors" />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Click any exception category to audit records</span>
        <span className="font-semibold text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={13} /> SLA Monitored
        </span>
      </div>
    </div>
  );
};
