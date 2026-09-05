import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Truck, 
  Clock, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { RecentActivityItem } from '../types';
import api from '../../../../services/api';

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  onViewAll?: () => void;
  onSelectOrder?: (deliveryUuid: string) => void;
}

const normalizeActivities = (input: any): RecentActivityItem[] => {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.activities)) return input.activities;
  return [];
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities: initialActivities,
  onViewAll,
  onSelectOrder
}) => {
  const [filter, setFilter] = useState<'all' | 'delivered' | 'failed' | 'dispute'>('all');
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState<RecentActivityItem[]>(() => normalizeActivities(initialActivities));
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => {
    if (Array.isArray(initialActivities)) return initialActivities.length;
    if (initialActivities && typeof (initialActivities as any).pagination?.totalRecords === 'number') {
      return (initialActivities as any).pagination.totalRecords;
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialActivities) {
      const list = normalizeActivities(initialActivities);
      setActivities(list);
      const count = (initialActivities as any)?.pagination?.totalRecords ?? list.length;
      setTotalRecords(count);
    }
  }, [initialActivities]);

  const fetchPaginatedActivity = async (pageNum: number, currentFilter: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/dashboard/activity`, {
        params: {
          page: pageNum,
          limit: 10,
          filter: currentFilter
        }
      });
      if (response.data && Array.isArray(response.data.activities)) {
        setActivities(response.data.activities);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalRecords(response.data.pagination?.totalRecords || response.data.activities.length);
      } else if (Array.isArray(response.data)) {
        setActivities(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.data.length / 10)));
        setTotalRecords(response.data.length);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Failed to fetch activity records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedActivity(page, filter);
  }, [page, filter]);

  const handleFilterChange = (newFilter: 'all' | 'delivered' | 'failed' | 'dispute') => {
    setFilter(newFilter);
    setPage(1);
  };

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
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <AlertTriangle size={15} />
        </div>
      );
    }
    if (status === 'success' || action.includes('COMPLETED') || action.includes('DELIVERED')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 size={15} />
        </div>
      );
    }
    if (status === 'error' || action.includes('FAILED') || action.includes('CANCELLED')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
          <XCircle size={15} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
        <Truck size={15} />
      </div>
    );
  };

  const startRecord = totalRecords > 0 ? (page - 1) * 10 + 1 : 0;
  const endRecord = Math.min(page * 10, totalRecords);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Enterprise Activity</h3>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {totalRecords} Events
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time audit log, client operations & dispatch events</p>
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
                  onClick={() => handleFilterChange(btn.value as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === btn.value
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
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
                className="hidden sm:inline-flex text-xs font-bold text-blue-600 hover:text-blue-700 items-center gap-1 transition-colors pl-2 cursor-pointer"
              >
                All Orders <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Activity Rows */}
        <div className="divide-y divide-slate-100 min-h-[300px]">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={22} className="animate-spin text-blue-500" />
              <span>Loading activity records...</span>
            </div>
          ) : !Array.isArray(activities) || activities.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No recent activity records found for this filter.
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  if (act.deliveryUuid && onSelectOrder) onSelectOrder(act.deliveryUuid);
                }}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getStatusIcon(act.status, act.action)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                      {act.orderNumber && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          #{act.orderNumber}
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

      {/* Pagination Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-medium">
          {totalRecords > 0 ? (
            <span>
              Showing <strong className="text-slate-800 font-bold">{startRecord}</strong>–<strong className="text-slate-800 font-bold">{endRecord}</strong> of <strong className="text-slate-800 font-bold">{totalRecords}</strong> records
            </span>
          ) : (
            <span>No records</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                const showEllipsis = prevP && p - prevP > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === p
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
