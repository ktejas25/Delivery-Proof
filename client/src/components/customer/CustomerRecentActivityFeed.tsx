import React from 'react';
import {
  PackageCheck,
  Truck,
  ShieldCheck,
  Star,
  AlertTriangle,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';

interface CustomerRecentActivityFeedProps {
  deliveries: any[];
  onSelectDelivery: (delivery: any) => void;
  onViewAll: () => void;
}

export const CustomerRecentActivityFeed: React.FC<CustomerRecentActivityFeedProps> = ({
  deliveries,
  onSelectDelivery,
  onViewAll,
}) => {
  const recentItems = deliveries.slice(0, 6);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <PackageCheck size={16} className="text-emerald-500" />;
      case 'en_route':
      case 'dispatched':
      case 'in_transit':
        return <Truck size={16} className="text-indigo-500" />;
      case 'disputed':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Package size={16} className="text-slate-400" />;
    }
  };

  const getStatusDescription = (item: any) => {
    const status = (item.status || item.delivery_status || '').toLowerCase();
    switch (status) {
      case 'delivered':
        return `Successfully dropped off by ${item.driver_name || 'courier'}. Photo proof verified.`;
      case 'en_route':
        return `Driver ${item.driver_name || 'personnel'} is heading towards your delivery address.`;
      case 'dispatched':
      case 'scheduled':
        return `Order confirmed and scheduled for route fulfillment.`;
      case 'disputed':
        return `Customer dispute open for investigation.`;
      default:
        return `Order received and logged in system.`;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Shipment Activity
            </h3>
            <p className="text-xs text-slate-400">
              Live status updates and proof milestones
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Feed list */}
      {recentItems.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
          {recentItems.map((item) => {
            const statusKey = (
              item.status ||
              item.delivery_status ||
              'pending'
            )
              .toLowerCase()
              .replace(/[\s-]/g, '_') as DeliveryStatus;

            return (
              <div
                key={item.uuid}
                onClick={() => onSelectDelivery(item)}
                className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                  {getStatusIcon(statusKey)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      Order #{item.order_number?.substring(0, 8)}
                    </span>
                    <StatusBadge status={statusKey} />
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {getStatusDescription(item)}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-400">
                    <span>
                      {new Date(
                        item.actual_arrival || item.created_at || Date.now()
                      ).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.driver_name && (
                      <span className="text-slate-500 font-semibold truncate">
                        &bull; Driver: {item.driver_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          <Clock size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold">No recent activity logged yet.</p>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any delivery entry to view proofs or file a claim</span>
        <span className="font-semibold text-indigo-600">Enterprise Live Feed</span>
      </div>
    </div>
  );
};

export default CustomerRecentActivityFeed;
