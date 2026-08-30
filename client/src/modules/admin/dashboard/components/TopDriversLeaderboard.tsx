import { Star, ShieldCheck, ArrowRight, Trophy, UserCheck, Medal } from 'lucide-react';
import { DriverLeaderboardItem } from '../types';

interface TopDriversLeaderboardProps {
  drivers: DriverLeaderboardItem[];
  onSelectDriver: (driver: { uuid: string; name: string }) => void;
  onViewAllDrivers: () => void;
}

export const TopDriversLeaderboard: React.FC<TopDriversLeaderboardProps> = ({
  drivers,
  onSelectDriver,
  onViewAllDrivers
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs shadow-xs border border-amber-300">
          <Medal size={14} className="text-amber-500" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs border border-slate-300">
          <Medal size={14} className="text-slate-400" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-6 h-6 rounded-full bg-orange-100 text-amber-700 flex items-center justify-center font-black text-xs border border-orange-300">
          <Medal size={14} className="text-amber-700" />
        </div>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Top Driver Leaderboard</h3>
              <p className="text-xs text-gray-400">Ranked by completion rate & proof authenticity score</p>
            </div>
          </div>

          <button
            onClick={onViewAllDrivers}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={13} />
          </button>
        </div>

        {/* Driver List */}
        <div className="mt-4 space-y-2.5">
          {drivers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              <UserCheck size={24} className="mx-auto text-gray-300 mb-2" />
              <p>No active driver records available.</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver.driverId}
                onClick={() => onSelectDriver({ uuid: driver.uuid, name: driver.name })}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-500/30 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(driver.rank)}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-sm">
                      {driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      driver.status === 'available' 
                        ? 'bg-emerald-500' 
                        : (driver.status === 'on_delivery' ? 'bg-amber-500' : 'bg-gray-400')
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                      {driver.name}
                      <span className="text-[10px] font-normal text-gray-400">({driver.vehicleType})</span>
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{driver.deliveries} deliveries</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{driver.completionRate}% completion</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-bold text-xs">
                    <Star size={12} fill="currentColor" />
                    <span>{driver.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck size={12} />
                    <span>{driver.proofScore}% Proof Score</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Click any driver to view performance telemetry</span>
        <span className="font-semibold text-emerald-600">SLA Certified</span>
      </div>
    </div>
  );
};
