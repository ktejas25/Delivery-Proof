import React from 'react';
import { Phone, Navigation, CheckCircle, Loader } from 'lucide-react';

interface Delivery {
  uuid: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  scheduled_time: string;
  delivery_status: string;
}

interface RouteCardProps {
  delivery: Delivery;
  routeIndex: number;
  onStatusChange: (uuid: string, status: string) => void;
  onCall: () => void;
  onNavigate: () => void;
  onProofRequired: (uuid: string) => void;
  loading?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({
  delivery,
  routeIndex,
  onStatusChange,
  onCall,
  onNavigate,
  onProofRequired,
  loading = false
}) => {
  const getStatusColor = () => {
    switch (delivery.delivery_status) {
      case 'pending':
        return 'bg-slate-50 border-slate-200';
      case 'in_transit':
        return 'bg-amber-50 border-amber-200';
      case 'delivered':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getIndexColor = () => {
    switch (delivery.delivery_status) {
      case 'pending':
        return 'text-slate-600';
      case 'in_transit':
        return 'text-amber-600';
      case 'delivered':
        return 'text-emerald-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg ${getIndexColor()}`}>#{routeIndex}</span>
          <div>
            <h4 className="font-semibold text-slate-900">{delivery.customer_name}</h4>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(delivery.scheduled_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCall}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={onNavigate}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition"
          >
            <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* Address */}
      <p className="text-sm text-slate-600 mb-4">{delivery.address}</p>

      {/* Action Button */}
      {delivery.delivery_status === 'pending' && (
        <button
          onClick={() => onStatusChange(delivery.uuid, 'in_transit')}
          disabled={loading}
          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : 'Start Transit'}
        </button>
      )}

      {delivery.delivery_status === 'in_transit' && (
        <button
          onClick={() => onStatusChange(delivery.uuid, 'arrived')}
          disabled={loading}
          className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : 'Mark Arrived'}
        </button>
      )}

      {delivery.delivery_status === 'arrived' && (
        <button
          onClick={() => onProofRequired(delivery.uuid)}
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : (
            <>
              <CheckCircle size={16} /> Complete Delivery
            </>
          )}
        </button>
      )}

      {delivery.delivery_status === 'delivered' && (
        <div className="w-full py-2 text-center text-emerald-600 text-sm font-semibold">
          ✓ Completed
        </div>
      )}
    </div>
  );
};

export default RouteCard;
