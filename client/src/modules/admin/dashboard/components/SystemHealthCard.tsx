import React from 'react';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { SystemHealthItem } from '../types';

interface SystemHealthCardProps {
  services?: SystemHealthItem[];
  onRefresh?: () => void;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  services = [
    { name: 'Core API Gateway', status: 'Operational', latency: '38ms', uptime: '99.99%' },
    { name: 'MySQL Database Cluster', status: 'Operational', latency: '4ms', uptime: '100%' },
    { name: 'Proof AI & OCR Engine', status: 'Operational', latency: '210ms', uptime: '99.95%' },
    { name: 'Background Schedulers', status: 'Operational', latency: '12ms', uptime: '100%' },
    { name: 'WebSocket Real-Time Stream', status: 'Operational', latency: '8ms', uptime: '99.98%' }
  ],
  onRefresh
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Degraded
          </span>
        );
      case 'Offline':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Offline
          </span>
        );
    }
  };

  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-90" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center ring-1 ring-cyan-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Activity size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">System & Infrastructure Health</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Microservices, database & AI pipeline status</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full ring-1 ring-emerald-500/20 shadow-2xs">
            99.98% System Uptime
          </span>
        </div>

        {/* Service Health List */}
        <div className="space-y-2 mt-4">
          {services.map((srv, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-extrabold text-slate-900">{srv.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
                  <span className="inline-flex items-center text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded-md font-semibold">
                    {srv.latency}
                  </span>
                  <span>•</span>
                  <span>Uptime: {srv.uptime}</span>
                </div>
              </div>
              {getStatusBadge(srv.status)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-slate-500">
          <CheckCircle2 size={14} className="text-emerald-500" /> All core clusters online
        </span>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw size={12} /> Ping
          </button>
        )}
      </div>
    </div>
  );
};
