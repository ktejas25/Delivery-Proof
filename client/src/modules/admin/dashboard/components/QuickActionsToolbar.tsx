import React, { useState } from 'react';
import { PlusCircle, UserPlus, RefreshCw, Users, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

interface QuickActionsToolbarProps {
  onNewOrder: () => void;
  onAddDriver: () => void;
  onAddCustomer?: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onNewOrder,
  onAddDriver,
  onAddCustomer,
  onRefresh,
  loading = false
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Generating enterprise logistics report...');
    try {
      const response = await api.get('/admin/dashboard/export?type=deliveries&format=csv', {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `delivery_proof_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {/* New Order */}
          <button
            onClick={onNewOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all duration-150 active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Create Order</span>
          </button>

          {/* Add Customer */}
          {onAddCustomer && (
            <button
              onClick={onAddCustomer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all duration-150 active:scale-95"
            >
              <Users size={15} />
              <span>Add Customer</span>
            </button>
          )}

          {/* Add Driver */}
          <button
            onClick={onAddDriver}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border border-slate-200/80"
          >
            <UserPlus size={15} />
            <span>Add Driver</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-60 active:scale-95"
          >
            <FileSpreadsheet size={14} className={exporting ? 'animate-bounce text-emerald-600' : 'text-slate-500'} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all ${
            loading ? 'opacity-60' : ''
          }`}
          title="Refresh real-time dashboard data"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
