import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, AlertOctagon, ArrowRight, FileCheck, ShieldAlert } from 'lucide-react';
import { ProofsSummary, DisputesSummary } from '../types';

interface ProofsAndDisputesSummaryProps {
  proofs: ProofsSummary;
  disputes: DisputesSummary;
  onNavigateDisputes: () => void;
  onNavigateDeliveries: () => void;
}

export const ProofsAndDisputesSummary: React.FC<ProofsAndDisputesSummaryProps> = ({
  proofs,
  disputes,
  onNavigateDisputes,
  onNavigateDeliveries
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
      {/* 1. Proof Verification Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Proof & Compliance</h3>
                <p className="text-xs text-slate-400">Cryptographic authenticity & verification rates</p>
              </div>
            </div>
            <button
              onClick={onNavigateDeliveries}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Inspect <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Verified
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {proofs.verificationRate}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-900">{proofs.verified}</p>
            </div>

            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" />
                  Pending AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Queue</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-900">{proofs.pendingAI}</p>
            </div>

            <div className="p-3 bg-red-50/40 rounded-xl border border-red-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-red-800 flex items-center gap-1">
                  <AlertOctagon size={13} className="text-red-600" />
                  Failed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">Flagged</span>
              </div>
              <p className="text-2xl font-extrabold text-red-900">{proofs.failed}</p>
            </div>

            <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                  <AlertTriangle size={13} className="text-purple-600" />
                  Disputed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Review</span>
              </div>
              <p className="text-2xl font-extrabold text-purple-900">{proofs.disputed}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <ShieldCheck size={14} /> SHA-256 Tamper Resistance
          </span>
          <span className="text-slate-400">Total Proofs: {proofs.total}</span>
        </div>
      </div>

      {/* 2. Disputes Resolution Funnel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Disputes & Claims</h3>
                <p className="text-xs text-slate-400">Fraud resolution lifecycle triage</p>
              </div>
            </div>
            <button
              onClick={onNavigateDisputes}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Manage <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700">Total Claims</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Active</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{disputes.total}</p>
            </div>

            <div className="p-3 bg-red-50/40 rounded-xl border border-red-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-red-800">High Priority</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">Urgent</span>
              </div>
              <p className="text-2xl font-extrabold text-red-700">{disputes.highPriority}</p>
            </div>

            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-800">Under Review</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">In Progress</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-800">{disputes.underReview}</p>
            </div>

            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-emerald-800">Resolved</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Closed</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-800">{disputes.resolved}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-slate-400">Claims Resolution SLA: &lt; 24h</span>
          <button 
            onClick={onNavigateDisputes}
            className="text-amber-600 font-bold hover:underline"
          >
            Audit Disputes →
          </button>
        </div>
      </div>
    </div>
  );
};
