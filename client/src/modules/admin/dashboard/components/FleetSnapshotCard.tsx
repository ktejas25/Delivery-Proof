import React from 'react';
import { ArrowRight, Navigation } from 'lucide-react';
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Navigation size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Fleet Operations Snapshot</h3>
              <p className="text-xs text-slate-400">High-level active vehicle & driver summary</p>
            </div>
          </div>

          <button
            onClick={onOpenFleetOperations}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors"
          >
            Open Fleet Map <ArrowRight size={13} />
          </button>
        </div>

        {/* 4 Summary Mini-Cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Drivers Online</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">{fleet.driversOnline}</span>
              <span className="text-xs text-slate-400">/ {fleet.totalDrivers} total</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Active Trackers</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-emerald-600">{fleet.activeTrackers}</span>
              <span className="text-xs text-emerald-600 font-semibold">Live GPS</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Assigned Vehicles</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">{fleet.totalVehicles}</span>
              <span className="text-xs text-slate-400">fleet units</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Avg Fleet Velocity</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">{fleet.avgSpeed}</span>
              <span className="text-xs text-slate-400">{fleet.speedUnit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Detailed GPS map, congestion & leaderboards</span>
        <button
          onClick={onOpenFleetOperations}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Fleet Operations</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
