import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Truck, 
  Clock, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { RecentActivityItem } from '../types';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
  onViewAll?: () => void;
  onSelectOrder?: (deliveryUuid: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onViewAll,
  onSelectOrder
}) => {
  const [filter, setFilter] = useState<'all' | 'delivered' | 'failed' | 'dispute'>('all');

  const formatRelativeTime = (timestamp: string) => {
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const getStatusIcon = (status: string, action: string) => {
    if (action.includes('DISPUTE')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={15} />
        </div>
      );
    }
    if (status === 'success' || action.includes('COMPLETED') || action.includes('DELIVERED')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 size={15} />
        </div>
      );
    }
    if (status === 'error' || action.includes('FAILED')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <XCircle size={15} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Truck size={15} />
      </div>
    );
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === 'delivered') return act.action.includes('COMPLETED') || act.status === 'success';
    if (filter === 'failed') return act.action.includes('FAILED') || act.status === 'error';
    if (filter === 'dispute') return act.action.includes('DISPUTE');
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Enterprise Activity</h3>
              <p className="text-xs text-slate-400">Audit trail, client actions & operational dispatch log</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { label: 'All Events', value: 'all' },
                { label: 'Completed', value: 'delivered' },
                { label: 'Exceptions', value: 'failed' },
                { label: 'Disputes', value: 'dispute' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filter === btn.value
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {onViewAll && (
              <button
                onClick={onViewAll}
                className="hidden sm:inline-flex text-xs font-bold text-blue-600 hover:text-blue-700 items-center gap-1 transition-colors pl-2"
              >
                Audit Log <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Activity Rows */}
        <div className="divide-y divide-slate-100">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent activity found matching this filter.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  if (act.deliveryUuid && onSelectOrder) onSelectOrder(act.deliveryUuid);
                }}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getStatusIcon(act.status, act.action)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                      {act.orderNumber && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {act.orderNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-700 block">{act.actor}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Clock size={10} />
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <UserCheck size={13} className="text-emerald-500" /> Real-time enterprise audit stream active
        </span>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-blue-600 font-bold hover:underline"
          >
            View All Transactions →
          </button>
        )}
      </div>
    </div>
  );
};
