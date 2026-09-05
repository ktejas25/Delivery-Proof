import React, { memo } from "react";
import {
  LogOut,
  MapPin,
  RefreshCw,
  WifiOff,
  Menu,
} from "lucide-react";
import { GPSStatus } from "./types";
import { cn } from "./utils";

interface DriverHeaderProps {
  driverName: string;
  isOnline: boolean;
  gpsStatus: GPSStatus;
  syncQueueCount?: number;
  isOffline?: boolean;
  pageTitle?: string;
  onToggleSidebar?: () => void;
  onSyncNow?: () => void;
  onLogout: () => void;
}

const gpsConfig: Record<
  GPSStatus,
  { label: string; dotClass: string; textClass: string; iconClass: string }
> = {
  live: {
    label: "GPS Live",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    iconClass: "text-emerald-600",
  },
  connecting: {
    label: "GPS Connecting",
    dotClass: "bg-amber-500 animate-pulse",
    textClass: "text-amber-700 bg-amber-50 border-amber-200",
    iconClass: "text-amber-600",
  },
  denied: {
    label: "GPS Blocked",
    dotClass: "bg-red-500",
    textClass: "text-red-700 bg-red-50 border-red-200",
    iconClass: "text-red-600",
  },
  unavailable: {
    label: "GPS Unavailable",
    dotClass: "bg-slate-400",
    textClass: "text-slate-600 bg-slate-100 border-slate-200",
    iconClass: "text-slate-500",
  },
};

const DriverHeader: React.FC<DriverHeaderProps> = memo(
  ({
    driverName,
    isOnline,
    gpsStatus,
    syncQueueCount = 0,
    isOffline = false,
    pageTitle = "Today's Route",
    onToggleSidebar,
    onSyncNow,
    onLogout,
  }) => {
    const currentGps = gpsConfig[gpsStatus] || gpsConfig.unavailable;

    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 shadow-xs">
        {/* Offline Alert Banner */}
        {isOffline && (
          <div className="bg-amber-500 text-white px-4 sm:px-6 lg:px-8 py-1.5 text-xs font-semibold flex items-center justify-between transition-all">
            <div className="flex items-center gap-2">
              <WifiOff size={14} className="flex-shrink-0" />
              <span>
                Offline mode active
                {syncQueueCount > 0
                  ? ` · ${syncQueueCount} pending action${syncQueueCount > 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>
            {onSyncNow && syncQueueCount > 0 && (
              <button
                onClick={onSyncNow}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        )}

        {/* Sync alert when online but queue has items */}
        {!isOffline && syncQueueCount > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 lg:px-8 py-1 text-xs text-blue-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <RefreshCw size={12} className="animate-spin text-blue-600" />
              Syncing {syncQueueCount} pending delivery change{syncQueueCount > 1 ? "s" : ""}...
            </span>
            {onSyncNow && (
              <button
                onClick={onSyncNow}
                className="text-blue-700 font-bold hover:underline cursor-pointer text-xs"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Main Header Row - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Hamburger menu (mobile) & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <Menu size={20} />
              </button>
            )}

            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                {pageTitle}
              </h1>
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block mt-0.5">
                Driver Console · {driverName}
              </span>
            </div>
          </div>


          {/* Right: GPS Pill, Online status, and Driver Avatar/Logout */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* GPS Pill */}
            <div
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                currentGps.textClass
              )}
              title={currentGps.label}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", currentGps.dotClass)} />
              <MapPin size={12} className={currentGps.iconClass} />
              <span>{currentGps.label}</span>
            </div>

            {/* Online Status Pill */}
            <div className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isOnline ? "bg-emerald-500" : "bg-slate-400"
                )}
              />
              <span className="capitalize">{isOnline ? "Online" : "Offline"}</span>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              aria-label="Logout"
              title="Logout from driver dashboard"
              className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
    );
  }
);

DriverHeader.displayName = "DriverHeader";

export default DriverHeader;