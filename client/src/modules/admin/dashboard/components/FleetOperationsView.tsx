import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LiveFleetMapCard } from './LiveFleetMapCard';
import { TopDriversLeaderboard } from './TopDriversLeaderboard';
import { FleetOverview, DriverLeaderboardItem } from '../types';

interface FleetOperationsViewProps {
  fleet: FleetOverview;
  topDrivers: DriverLeaderboardItem[];
  onBackToAdmin: () => void;
  onSelectDriver: (driver: { uuid: string; name: string }) => void;
  onViewDriversList: () => void;
}

export const FleetOperationsView: React.FC<FleetOperationsViewProps> = ({
  fleet,
  topDrivers,
  onBackToAdmin,
  onSelectDriver,
  onViewDriversList
}) => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Fleet Ops Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToAdmin}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Back to Enterprise Admin Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Fleet Operations & Live Tracking Console
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time vehicle GPS positions, transit velocity, and driver performance rankings
            </p>
          </div>
        </div>

        <button
          onClick={onBackToAdmin}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          Return to Admin Dashboard
        </button>
      </div>

      {/* Main Grid: Interactive Map + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LiveFleetMapCard
            fleet={fleet}
            onSelectDriver={(id) => {
              const dr = topDrivers.find(d => d.driverId === id);
              if (dr) onSelectDriver({ uuid: dr.uuid, name: dr.name });
            }}
          />
        </div>

        <div className="lg:col-span-4">
          <TopDriversLeaderboard
            drivers={topDrivers}
            onSelectDriver={onSelectDriver}
            onViewAllDrivers={onViewDriversList}
          />
        </div>
      </div>
    </div>
  );
};
