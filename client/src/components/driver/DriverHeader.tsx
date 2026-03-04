import React, { memo } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Zap,
  LogOut,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "./utils";

// ----- Constants (can be moved) -----
const GPS_STATUS = {
  live: "live",
  connecting: "connecting",
  denied: "denied",
  unavailable: "unavailable",
} as const;

const GPS_LABELS: Record<keyof typeof GPS_STATUS, string> = {
  live: "GPS Live",
  connecting: "Connecting",
  denied: "Blocked",
  unavailable: "Unavailable",
};

// ----- Subcomponents -----
interface MetricCardProps {
  icon: React.ElementType;
  value: string | number;
  iconColor?: string;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = memo(
  ({ icon: Icon, value, iconColor = "text-slate-600", valueClassName }) => (
    <div className="bg-slate-50 rounded-xl p-2">
      <Icon size={16} className={cn("mx-auto", iconColor)} />
      <p className={cn("text-xs font-semibold", valueClassName)}>{value}</p>
    </div>
  )
);

interface StatusBannerProps {
  icon: React.ElementType;
  message: string;
  variant: "warning" | "info" | "error";
}

const variantStyles = {
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
  error: "bg-red-50 border-red-200 text-red-700",
};

const StatusBanner: React.FC<StatusBannerProps> = memo(
  ({ icon: Icon, message, variant }) => (
    <div
      className={cn(
        "px-4 py-2 flex items-center gap-2 text-sm font-semibold border-b",
        variantStyles[variant]
      )}
    >
      <Icon size={16} />
      {message}
    </div>
  )
);

// ----- Main Component Props -----
interface Props {
  driverName: string;
  isOnline: boolean;
  gpsStatus: keyof typeof GPS_STATUS;
  shiftTime: string;
  stats: {
    total: number;
    completed: number;
    completionPercentage: number;
    totalEarnings: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  syncQueueCount?: number;
  isOffline?: boolean;
  onLogout: () => void;   // <-- added
}

const DriverHeader: React.FC<Props> = memo(
  ({
    driverName,
    isOnline,
    gpsStatus,
    shiftTime,
    stats,
    searchQuery,
    onSearchChange,
    syncQueueCount = 0,
    isOffline = false,
    onLogout,              // <-- use this
  }) => {
    const handleClearSearch = () => onSearchChange("");

    return (
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        {isOffline && (
          <StatusBanner
            icon={AlertCircle}
            message="Offline mode — changes will sync automatically"
            variant="warning"
          />
        )}

        {syncQueueCount > 0 && (
          <StatusBanner
            icon={Zap}
            message={`${syncQueueCount} update${
              syncQueueCount !== 1 ? "s" : ""
            } pending`}
            variant="info"
          />
        )}

        <div className="px-4 py-4 space-y-4">
          {/* Identity row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                {driverName.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-lg">{driverName}</h1>
                <p className="text-xs text-slate-500 font-semibold">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}      // <-- use prop
              aria-label="Logout"
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <MetricCard
              icon={MapPin}
              value={GPS_LABELS[gpsStatus]}
              iconColor="text-blue-600"
            />
            <MetricCard
              icon={Clock}
              value={shiftTime}
              iconColor="text-amber-600"
              valueClassName="font-mono"
            />
            <MetricCard
              icon={DollarSign}
              value={`$${stats.totalEarnings.toFixed(0)}`}
              iconColor="text-emerald-600"
              valueClassName="font-bold text-emerald-600"
            />
            <MetricCard
              icon={Zap}
              value={`${stats.completionPercentage}%`}
              iconColor="text-indigo-600"
              valueClassName="font-bold text-indigo-600"
            />
          </div>

          {/* Route progress */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Route Progress</span>
              <span>
                {stats.completed}/{stats.total}
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stats.completionPercentage}
              className="h-2 bg-slate-200 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search deliveries"
              aria-label="Search deliveries"
              className="w-full pl-10 pr-10 py-3 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }
);

DriverHeader.displayName = "DriverHeader";

export default DriverHeader;