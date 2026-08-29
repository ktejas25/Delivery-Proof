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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">System & Infrastructure Health</h3>
              <p className="text-xs text-slate-400">Microservices, database & AI pipeline status</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            99.98% System Uptime
          </span>
        </div>

        {/* Service Health List */}
        <div className="divide-y divide-slate-100 mt-4">
          {services.map((srv, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-800">{srv.name}</p>
                <p className="text-[11px] text-slate-400">Latency: {srv.latency} • Uptime: {srv.uptime}</p>
              </div>
              {getStatusBadge(srv.status)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={13} className="text-emerald-500" /> All core clusters online
        </span>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw size={11} /> Ping
          </button>
        )}
      </div>
    </div>
  );
};
