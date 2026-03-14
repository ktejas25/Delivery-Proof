import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBox, FaMapMarkerAlt, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';
import TrackingMap from '../TrackingMap';

interface DeliveryCardProps {
  delivery: any;
  onDetails: () => void;
  onRate?: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onDetails, onRate }) => {
  const currentStatus = ((delivery.status || delivery.delivery_status || 'pending').toLowerCase().replace(/[\s-]/g, '_')) as DeliveryStatus;
  const isEnRoute = currentStatus === 'en_route' || currentStatus === 'arrived';
  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Order</span>
              <h3 className="text-lg font-extrabold text-gray-900">#{orderNum}</h3>
            </div>
            <div className="flex items-center text-gray-400 text-xs gap-1">
              <FaCalendarAlt size={10} />
              <span>{delivery.created_at || delivery.scheduled_time ? new Date(delivery.created_at || delivery.scheduled_time).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <FaUser size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Driver</p>
              <p className="text-sm font-semibold text-gray-700">{delivery.driver_name || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <FaBox size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Destination</p>
              <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">
                {delivery.delivery_address || 'Address not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative group">
          {isEnRoute ? (
            <div className="h-48 md:h-64 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
              <TrackingMap deliveryUuid={delivery.uuid} initialData={delivery} />
            </div>
          ) : (
            <div className="h-48 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FaMapMarkerAlt className={currentStatus === 'delivered' ? 'text-green-400' : 'text-gray-300'} size={20} />
              </div>
              <p className="text-xs font-medium px-6 text-center">
                {currentStatus === 'delivered' 
                  ? 'Delivery completed successfully' 
                  : 'Map available once driver is en route'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
        <button
          onClick={onDetails}
          className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Details <FaChevronRight size={10} />
        </button>
        
        {currentStatus === 'delivered' && !delivery.customer_rating && onRate && (
          <button
            onClick={onRate}
            className="px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Rate Delivery
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DeliveryCard;