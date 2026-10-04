import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ArrowRight, 
  FileCheck, 
  ShieldAlert,
  Fingerprint,
  Sparkles
} from 'lucide-react';
import CountUp from 'react-countup';
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* 1. Proof & Compliance Card */}
      <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90" />
        
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/15 to-emerald-500/5 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <FileCheck size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Proof & Compliance</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Ledger
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Cryptographic authenticity & verification rates</p>
              </div>
            </div>

            <button
              onClick={onNavigateDeliveries}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 px-2.5 py-1 rounded-xl transition-all border border-emerald-200/60 shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
            >
              <span>Inspect</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 4 Interactive Metric Tiles */}
          <div className="grid grid-cols-2 gap-3.5 my-4">
            {/* Tile 1: Verified */}
            <div 
              onClick={onNavigateDeliveries}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-emerald-100/25 border border-emerald-200/70 hover:border-emerald-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Verified
                </span>
                <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/20">
                  {proofs.verificationRate}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  <CountUp end={proofs.verified} duration={1.2} />
                </p>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Passed</span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-full h-1.5 bg-emerald-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, proofs.verificationRate)}%` }}
                />
              </div>
            </div>

            {/* Tile 2: Pending AI */}
            <div 
              onClick={onNavigateDeliveries}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-100/25 border border-amber-200/70 hover:border-amber-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600" />
                  Pending AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/20">
                  Queue
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                  <CountUp end={proofs.pendingAI} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-amber-700">Triage</span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: proofs.total > 0 ? `${(proofs.pendingAI / proofs.total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Tile 3: Failed */}
            <div 
              onClick={onNavigateDeliveries}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50/60 to-red-100/25 border border-red-200/70 hover:border-red-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertOctagon size={14} className="text-red-600" />
                  Failed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-800 border border-red-500/20">
                  Flagged
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-red-950 tracking-tight">
                  <CountUp end={proofs.failed} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-red-700">Review</span>
              </div>
              <div className="w-full h-1.5 bg-red-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: proofs.total > 0 ? `${(proofs.failed / proofs.total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Tile 4: Disputed */}
            <div 
              onClick={onNavigateDisputes}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-purple-100/25 border border-purple-200/70 hover:border-purple-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-purple-600" />
                  Disputed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-800 border border-purple-500/20">
                  Audit
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
                  <CountUp end={proofs.disputed} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-purple-700">Claims</span>
              </div>
              <div className="w-full h-1.5 bg-purple-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: proofs.total > 0 ? `${(proofs.disputed / proofs.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200/60 shadow-2xs">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>SHA-256 Tamper Resistance</span>
          </div>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/70">
            Total Proofs: <span className="text-slate-900">{proofs.total}</span>
          </span>
        </div>
      </div>

      {/* 2. Disputes & Claims Card */}
      <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-90" />

        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/15 to-amber-500/5 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Disputes & Claims</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    <Sparkles size={11} className="text-amber-500" />
                    AI Triage
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Fraud resolution lifecycle & SLA tracking</p>
              </div>
            </div>

            <button
              onClick={onNavigateDisputes}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 px-2.5 py-1 rounded-xl transition-all border border-amber-200/60 shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 4 Disputes Metric Tiles */}
          <div className="grid grid-cols-2 gap-3.5 my-4">
            {/* Tile 1: Total Claims */}
            <div 
              onClick={onNavigateDisputes}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Fingerprint size={14} className="text-slate-500" />
                  Total Claims
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 border border-slate-300/50">
                  Active
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  <CountUp end={disputes.total} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-slate-500">Pipeline</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/60 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-slate-500 rounded-full transition-all duration-500"
                  style={{ width: disputes.total > 0 ? '100%' : '0%' }}
                />
              </div>
            </div>

            {/* Tile 2: High Priority */}
            <div 
              onClick={onNavigateDisputes}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/60 to-rose-100/25 border border-rose-200/70 hover:border-rose-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertOctagon size={14} className="text-rose-600" />
                  High Priority
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-800 border border-rose-500/20">
                  Urgent
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
                  <CountUp end={disputes.highPriority} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-rose-700">Immediate</span>
              </div>
              <div className="w-full h-1.5 bg-rose-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: disputes.total > 0 ? `${(disputes.highPriority / disputes.total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Tile 3: Under Review */}
            <div 
              onClick={onNavigateDisputes}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-100/25 border border-amber-200/70 hover:border-amber-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600" />
                  Under Review
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/20">
                  In Progress
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                  <CountUp end={disputes.underReview} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-amber-700">In Triage</span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: disputes.total > 0 ? `${(disputes.underReview / disputes.total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Tile 4: Resolved */}
            <div 
              onClick={onNavigateDisputes}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-emerald-100/25 border border-emerald-200/70 hover:border-emerald-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Resolved
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/20">
                  Closed
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  <CountUp end={disputes.resolved} duration={1.2} />
                </p>
                <span className="text-[10px] font-medium text-emerald-700">Protected</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-200/50 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: disputes.total > 0 ? `${(disputes.resolved / disputes.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Claims Resolution SLA: <strong className="text-slate-800">&lt; 24h</strong>
          </span>
          <button 
            onClick={onNavigateDisputes}
            className="text-amber-700 font-bold hover:text-amber-800 inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            Audit Disputes →
          </button>
        </div>
      </div>
    </div>
  );
};

