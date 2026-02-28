import React from 'react';
import { Phone, Navigation, Loader } from 'lucide-react';

interface Delivery {
  uuid: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  scheduled_time: string;
  delivery_status: string;
}

interface Props {
  delivery: Delivery;
  routeIndex: number;
  onStatusChange: (uuid: string, status: string) => void;
  onCall: () => void;
  onNavigate: () => void;
  onProofRequired: (uuid: string) => void;
  loading?: boolean;
}

const NextDeliveryCard: React.FC<Props> = ({
  delivery,
  routeIndex,
  onStatusChange,
  onCall,
  onNavigate,
  onProofRequired,
  loading = false
}) => {
  const getActionButton = () => {
    switch (delivery.delivery_status) {
      case 'pending':
        return (
          <button
            onClick={() => onStatusChange(delivery.uuid, 'in_transit')}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : 'START DELIVERY'}
          </button>
        );

      case 'in_transit':
        return (
          <button
            onClick={() => onProofRequired(delivery.uuid)}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : 'COMPLETE DELIVERY'}
          </button>
        );

      case 'delivered':
        return (
          <div className="w-full text-center bg-emerald-100 text-emerald-700 py-3 rounded-xl font-semibold">
            ✓ DELIVERY COMPLETED
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 flex justify-between items-center">
        <span className="text-blue-600 font-bold text-lg">#{routeIndex}</span>
        <span className="text-xs text-slate-600 font-medium">
          {new Date(delivery.scheduled_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Map */}
      <div className="h-40 bg-slate-200 overflow-hidden">
        <iframe
          title="map"
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            delivery.address
          )}&z=15&output=embed`}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{delivery.customer_name}</h3>
        <p className="text-sm text-slate-600 mb-6">{delivery.address}</p>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onCall}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg flex items-center justify-center gap-2 transition font-medium text-sm"
          >
            <Phone size={16} />
            Call
          </button>

          <button
            onClick={onNavigate}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg flex items-center justify-center gap-2 transition font-medium text-sm"
          >
            <Navigation size={16} />
            Navigate
          </button>
        </div>

        {/* Main Action */}
        {getActionButton()}
      </div>
    </div>
  );
};

export default NextDeliveryCard;
