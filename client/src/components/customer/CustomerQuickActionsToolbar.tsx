import React, { useState } from 'react';
import {
  Navigation,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface CustomerQuickActionsToolbarProps {
  onTrackLatest: () => void;
  onAddAddress: () => void;
  onRefresh: () => void;
  onViewLiveMap: () => void;
  hasActiveOrders: boolean;
  loading?: boolean;
  lastUpdated?: Date;
}

export const CustomerQuickActionsToolbar: React.FC<CustomerQuickActionsToolbarProps> = ({
  onTrackLatest,
  onAddAddress,
  onRefresh,
  onViewLiveMap,
  hasActiveOrders,
  loading = false,
  lastUpdated = new Date(),
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing delivery report...');
    try {
      const response = await api.get('/customer/export', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `my_delivery_history_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Order history exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export delivery history.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Left: Quick Actions Group */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {/* Track Active Order */}
          {hasActiveOrders && (
            <button
              onClick={onTrackLatest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Navigation size={14} className="animate-pulse" />
              <span>Track Incoming Package</span>
            </button>
          )}

          {/* View Live Radar / Map */}
          <button
            onClick={onViewLiveMap}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <MapPin size={14} />
            <span>Live Map Radar</span>
          </button>

          {/* Add Address */}
          <button
            onClick={onAddAddress}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border border-slate-200/80 cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Add Location</span>
          </button>

          {/* Export Orders CSV */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-60 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet
              size={14}
              className={
                exporting ? 'animate-bounce text-emerald-600' : 'text-slate-500'
              }
            />
            <span>{exporting ? 'Exporting...' : 'Export History (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Right: Live Sync & Refresh */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <Clock size={12} />
          <span>
            Synced{' '}
            {lastUpdated.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer ${
            loading ? 'opacity-60' : ''
          }`}
          title="Refresh delivery status"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerQuickActionsToolbar;
