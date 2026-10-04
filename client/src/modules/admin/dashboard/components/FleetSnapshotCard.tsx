import React from 'react';
import { ArrowRight, Navigation, Radio, Truck, Gauge } from 'lucide-react';
import CountUp from 'react-countup';
import { FleetSnapshot } from '../types';

interface FleetSnapshotCardProps {
  fleet: FleetSnapshot;
  onOpenFleetOperations: () => void;
}

export const FleetSnapshotCard: React.FC<FleetSnapshotCardProps> = ({
  fleet,
  onOpenFleetOperations
}) => {
  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90" />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/15 to-emerald-500/5 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Navigation size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Fleet Operations Snapshot</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GPS Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">High-level active vehicle & driver summary</p>
            </div>
          </div>

          <button
            onClick={onOpenFleetOperations}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 px-2.5 py-1 rounded-xl transition-all border border-emerald-200/60 shadow-2xs cursor-pointer"
          >
            <span>Open Map</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 4 Summary Mini-Cards */}
        <div className="grid grid-cols-2 gap-3.5 my-4">
          <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Drivers Online</span>
              <Radio size={13} className="text-blue-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                <CountUp end={fleet.driversOnline} duration={1.2} />
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {fleet.totalDrivers} total</span>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-50/60 to-emerald-100/25 rounded-2xl border border-emerald-200/70 hover:border-emerald-300 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active Trackers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/20">
                Live
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-900 tracking-tight">
                <CountUp end={fleet.activeTrackers} duration={1.2} />
              </span>
              <span className="text-xs text-emerald-700 font-bold">GPS Linked</span>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-indigo-50/60 to-indigo-100/25 rounded-2xl border border-indigo-200/70 hover:border-indigo-300 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Assigned Fleet</span>
              <Truck size={14} className="text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-950 tracking-tight">
                <CountUp end={fleet.totalVehicles} duration={1.2} />
              </span>
              <span className="text-xs text-indigo-600 font-medium">units</span>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-teal-50/60 to-teal-100/25 rounded-2xl border border-teal-200/70 hover:border-teal-300 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Avg Velocity</span>
              <Gauge size={14} className="text-teal-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-teal-950 tracking-tight">
                <CountUp end={fleet.avgSpeed} duration={1.2} />
              </span>
              <span className="text-xs text-teal-700 font-bold">{fleet.speedUnit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Real-time driver telemetry & geo-routes</span>
        <button
          onClick={onOpenFleetOperations}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Fleet Operations</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

