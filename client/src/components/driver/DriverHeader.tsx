import React, { memo } from 'react';
import { LogOut, DollarSign, Wifi, Brain, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/* ============================
   Strict Types
============================ */

type GPSStatus = 'live' | 'connecting' | 'denied' | 'unavailable';

interface GPSPosition {
  accuracy: number;
}

interface DriverUser {
  first_name?: string;
}

interface Props {
  user: DriverUser | null;
  offline: boolean;
  gpsStatus: GPSStatus;
  position: GPSPosition | null;
  earnings: number;
  completionPercent: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  refreshing: boolean;
  logout: () => void;
}

/* ============================
   Status Token Map
============================ */

const MODE_STYLES = {
  online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  offline: 'bg-amber-50 text-amber-700 border-amber-200',
};

const GPS_STYLES: Record<GPSStatus, string> = {
  live: 'text-emerald-600',
  connecting: 'text-amber-600',
  denied: 'text-red-600',
  unavailable: 'text-slate-500',
};

/* ============================
   Reusable Metric Card
============================ */

const MetricCard = memo(
  ({
    icon: Icon,
    label,
    value,
    valueClass,
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    valueClass?: string;
  }) => (
    <div className="flex flex-col justify-center items-center min-h-[56px] rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
      <div className={clsx('flex items-center gap-1.5 text-xs font-semibold', valueClass)}>
        <Icon size={14} />
        {value}
      </div>
      <span className="text-[10px] text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  )
);

/* ============================
   Main Header Component
============================ */

export const DriverHeader: React.FC<Props> = memo(
  ({
    user,
    offline,
    gpsStatus,
    position,
    earnings,
    completionPercent,
    searchQuery,
    setSearchQuery,
    refreshing,
    logout,
  }) => {
    const modeStyle = offline ? MODE_STYLES.offline : MODE_STYLES.online;

    return (
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* ======================
              Identity + Mode
          ====================== */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border',
                  modeStyle
                )}
              >
                {offline ? 'Offline Mode' : 'Online Mode'}
              </span>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {user?.first_name || 'Driver'}’s Route
              </h1>
            </div>

            <button
              onClick={logout}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* ======================
              Metrics Grid
          ====================== */}
          <div className="grid grid-cols-3 gap-3 mb-5">

            <MetricCard
              icon={Wifi}
              label="GPS"
              value={
                gpsStatus === 'live'
                  ? `Live ±${position?.accuracy?.toFixed(0) ?? 0}m`
                  : gpsStatus
              }
              valueClass={GPS_STYLES[gpsStatus]}
            />

            <MetricCard
              icon={DollarSign}
              label="Today"
              value={`₹${earnings.toLocaleString()}`}
              valueClass="text-emerald-600"
            />

            <MetricCard
              icon={Brain}
              label="Routing"
              value="Optimized"
              valueClass="text-indigo-600"
            />

          </div>

          {/* ======================
              Progress Indicator
          ====================== */}
          <div className="mb-5">
            <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              <span>Completion</span>
              <span>{completionPercent}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-indigo-600"
              />
            </div>
          </div>

          {/* ======================
              Search (Primary Input)
          ====================== */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search stops, addresses, customers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />

            {refreshing && (
              <RefreshCw
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-600"
              />
            )}
          </div>
        </div>
      </header>
    );
  }
);

DriverHeader.displayName = 'DriverHeader';