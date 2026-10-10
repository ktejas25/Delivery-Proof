import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  PackageCheck,
  Check
} from 'lucide-react';
import { RecentActivityItem } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  activities: RecentActivityItem[];
  readIds?: Set<string | number>;
  onMarkAllRead?: () => void;
  onSelectActivity: (activity: RecentActivityItem) => void;
  onViewAll: () => void;
}

const formatRelativeTime = (timestamp?: string): string => {
  if (!timestamp) return 'Recently';
  try {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const getStatusBadge = (status?: string, action?: string) => {
  const act = action?.toUpperCase() || '';
  if (act.includes('DISPUTE')) {
    return {
      icon: <AlertTriangle size={15} className="text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200/80',
      tag: 'Dispute',
      tagBg: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }
  if (status === 'success' || act.includes('COMPLETED') || act.includes('DELIVERED') || act.includes('PROOF')) {
    return {
      icon: <CheckCircle2 size={15} className="text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/80',
      tag: 'Completed',
      tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }
  if (status === 'error' || act.includes('FAILED') || act.includes('CANCELLED')) {
    return {
      icon: <XCircle size={15} className="text-red-600" />,
      bg: 'bg-red-50 border-red-200/80',
      tag: 'Exception',
      tagBg: 'bg-red-50 text-red-700 border-red-200'
    };
  }
  return {
    icon: <Truck size={15} className="text-blue-600" />,
    bg: 'bg-blue-50 border-blue-200/80',
    tag: 'Dispatch',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200'
  };
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  activities,
  readIds,
  onMarkAllRead,
  onSelectActivity,
  onViewAll
}) => {
  if (!isOpen) return null;

  const unreadCount = readIds
    ? activities.filter((act) => !readIds.has(act.id)).length
    : activities.length;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[370px] xs:w-[420px] sm:w-[460px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans"
      role="menu"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xs gap-3">
        {/* Left: Icon, Title & Unread Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/90 shadow-2xs shrink-0">
            <Bell size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-none truncate">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/80 whitespace-nowrap shrink-0">
                  {unreadCount} New
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap shrink-0">
                  All caught up
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px] xs:max-w-[240px]">
              Real-time audit log & dispatch events
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/80 border border-slate-200/90 hover:border-blue-200 rounded-xl shadow-2xs transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
              title="Mark all notifications as read"
            >
              <Check size={12} className="text-blue-600" />
              <span>Read all</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Close notifications"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 p-2 space-y-1">
        {activities.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <PackageCheck size={22} />
            </div>
            <p className="text-xs font-bold text-slate-800">No New Notifications</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
              All deliveries, routes, and drivers are currently operating normally.
            </p>
          </div>
        ) : (
          activities.map((act) => {
            const badge = getStatusBadge(act.status, act.action);
            const isUnread = readIds ? !readIds.has(act.id) : false;

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className={`group p-3 rounded-2xl hover:bg-slate-50 border transition-all cursor-pointer flex items-start gap-3 relative ${
                  isUnread
                    ? 'bg-blue-50/25 border-blue-100/70 shadow-2xs'
                    : 'border-transparent'
                }`}
              >
                {/* Unread indicator dot */}
                {isUnread && (
                  <span className="absolute top-3.5 left-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}

                {/* Status Icon */}
                <div className={`w-9 h-9 rounded-xl ${badge.bg} border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${isUnread ? 'ml-1' : ''}`}>
                  {badge.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                      <Clock size={11} className="text-slate-300" />
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Metadata Tags */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    {act.orderNumber && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded-md">
                        #{act.orderNumber}
                      </span>
                    )}

                    {act.actor && act.actor !== 'System' && (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.actor}
                      </span>
                    )}

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge.tagBg}`}>
                      {badge.tag}
                    </span>

                    <span className="ml-auto text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      View details <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl transition cursor-pointer"
        >
          <span>View All Deliveries & Activity Stream</span>
          <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
