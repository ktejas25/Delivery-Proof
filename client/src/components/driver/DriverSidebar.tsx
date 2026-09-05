import React, { memo } from "react";
import {
  Navigation,
  History,
  DollarSign,
  User,
  PackageCheck,
  X,
  LogOut,
  Clock,
} from "lucide-react";

import { DriverTab } from "./ui/DriverBottomNav";
import { GPSStatus } from "./types";
import { cn } from "./utils";

interface DriverSidebarProps {
  activeTab: DriverTab;
  onTabChange: (tab: DriverTab) => void;
  activeStopsCount: number;
  completedCount: number;
  totalEarnings: number;
  shiftTime: string;
  driverName: string;
  isOnline: boolean;
  gpsStatus: GPSStatus;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const navItems: {
  id: DriverTab;
  label: string;
  icon: React.ElementType;
  getBadge?: (props: { activeStopsCount: number; completedCount: number; totalEarnings: number }) => { text: string; className: string } | null;
}[] = [
  {
    id: "route",
    label: "Today's Route",
    icon: Navigation,
    getBadge: ({ activeStopsCount }) =>
      activeStopsCount > 0
        ? { text: `${activeStopsCount} left`, className: "bg-blue-100 text-blue-700" }
        : { text: "Done", className: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "history",
    label: "Delivery History",
    icon: History,
    getBadge: ({ completedCount }) =>
      completedCount > 0
        ? { text: `${completedCount}`, className: "bg-slate-100 text-slate-700" }
        : null,
  },
  {
    id: "earnings",
    label: "Earnings & Shifts",
    icon: DollarSign,
    getBadge: ({ totalEarnings }) =>
      totalEarnings > 0
        ? { text: `$${totalEarnings.toFixed(0)}`, className: "bg-emerald-100 text-emerald-800" }
        : null,
  },
  {
    id: "profile",
    label: "Driver Profile",
    icon: User,
  },
];

const DriverSidebar: React.FC<DriverSidebarProps> = memo(
  ({
    activeTab,
    onTabChange,
    activeStopsCount,
    completedCount,
    totalEarnings,
    shiftTime,
    driverName,
    isOnline,
    gpsStatus,
    isOpen,
    onClose,
    onLogout,
  }) => {
    return (
      <>
        {/* Mobile Backdrop Overlay */}
        {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar Container */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex-shrink-0 h-screen",
            isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Top Section: Branding & Navigation */}
          <div className="p-5 overflow-y-auto">
            {/* Branding Header */}
            <div className="flex items-center justify-between mb-7 px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                    DeliveryProof
                  </h1>
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                    Driver Command
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Group */}
            <div className="space-y-4">
              <div>
                <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Driver Menu
                </span>
                <nav className="mt-1.5 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const badge = item.getBadge?.({
                      activeStopsCount,
                      completedCount,
                      totalEarnings,
                    });

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            size={18}
                            className={isActive ? "text-blue-600" : "text-slate-400"}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {badge && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                              badge.className
                            )}
                          >
                            {badge.text}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Shift Quick Status Card in Sidebar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-500" />
                    Active Shift
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {shiftTime}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Earned Today</span>
                  <span className="font-bold text-emerald-700">
                    ${totalEarnings.toFixed(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">GPS Signal</span>
                  <span className="font-bold text-slate-700 capitalize flex items-center gap-1">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        gpsStatus === "live"
                          ? "bg-emerald-500"
                          : gpsStatus === "connecting"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-red-500"
                      )}
                    />
                    {gpsStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Driver Identity & Logout */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                  {driverName ? driverName.charAt(0).toUpperCase() : <User size={18} />}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {driverName}
                  </p>
                  <div className="flex items-center gap-1 text-[11px]">
                    {isOnline ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                aria-label="Logout"
                title="Logout from driver dashboard"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }
);

DriverSidebar.displayName = "DriverSidebar";

export default DriverSidebar;
