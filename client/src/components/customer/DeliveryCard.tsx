import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBox, FaMapMarkerAlt, FaCalendarAlt, FaChevronRight, FaClock, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';
import TrackingMap from '../TrackingMap';
import DeliveryTimeline from './DeliveryTimeline';

interface DeliveryCardProps {
  delivery: any;
  onDetails: () => void;
  onRate?: () => void;
  onDispute?: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onDetails, onRate, onDispute }) => {
  const currentStatus = useMemo(() => 
    ((delivery.status || delivery.delivery_status || 'pending').toLowerCase().replace(/[\s-]/g, '_')) as DeliveryStatus,
    [delivery.status, delivery.delivery_status]
  );

  const isEnRoute = currentStatus === 'en_route' || currentStatus === 'arrived';
  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';
  
  // Format ETA if available
  const eta = useMemo(() => {
    if (!delivery.estimated_arrival_time) return null;
    const date = new Date(delivery.estimated_arrival_time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [delivery.estimated_arrival_time]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)' }}
      className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-gray-100 overflow-hidden transition-all duration-500 group"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                Order
              </span>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">#{orderNum}</h3>
            </div>
            <div className="flex items-center text-gray-400 text-xs font-bold gap-1.5 ml-1">
              <FaCalendarAlt size={12} className="text-indigo-400" />
              <span>{delivery.created_at || delivery.scheduled_time ? new Date(delivery.created_at || delivery.scheduled_time).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Timeline Integration */}
        {['scheduled', 'dispatched', 'en_route', 'delivered'].includes(currentStatus) && (
          <div className="mb-8 bg-gray-50/50 rounded-2xl px-2">
            <DeliveryTimeline status={currentStatus} />
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-transparent group-hover:border-indigo-50 group-hover:bg-indigo-50/30 transition-all duration-500">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100">
              <FaUser size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Driver</p>
              <p className="text-sm font-bold text-gray-700 truncate">{delivery.driver_name || 'Assigning...'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-transparent group-hover:border-indigo-50 group-hover:bg-indigo-50/30 transition-all duration-500">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100">
              <FaClock size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">ETA</p>
              <p className="text-sm font-bold text-gray-700">{eta || (delivery.scheduled_time ? new Date(delivery.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending')}</p>
            </div>
          </div>
        </div>

        {/* Address & Items */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0">
               <FaMapMarkerAlt className="text-red-400" size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Destination</p>
              <p className="text-sm font-bold text-gray-600 line-clamp-2 leading-relaxed italic">
                {delivery.delivery_address || 'Address not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaBox className="text-orange-400 flex-shrink-0" size={16} />
            <p className="text-sm font-bold text-gray-600">
              {delivery.items_count || 1} <span className="text-gray-400 font-medium">Standard Package(s)</span>
            </p>
          </div>
        </div>

        {/* Map Section */}
        <div className="relative group/map rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
          {isEnRoute ? (
            <div className="h-56 transition-transform duration-700 group-hover:scale-105">
              <TrackingMap deliveryUuid={delivery.uuid} initialData={delivery} />
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md animate-bounce">
                <FaMapMarkerAlt className={currentStatus === 'delivered' ? 'text-green-400' : 'text-indigo-200'} size={28} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">
                  {currentStatus === 'delivered' ? 'Package Delivered' : 'Waiting for Dispatch'}
                </p>
                <p className="text-xs font-bold text-gray-400 max-w-[200px] mx-auto">
                  {currentStatus === 'delivered' 
                    ? 'Your order has been safely dropped off.' 
                    : 'Real-time tracking will be available once the driver begins the route.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <button
          onClick={onDetails}
          className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-800 transition-all group/btn"
        >
          View Full Details 
          <FaChevronRight size={10} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
        
        <div className="flex gap-2">
          {currentStatus === 'delivered' && onRate && (
            <button
              onClick={onRate}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-yellow-200 active:scale-95"
            >
              <FaStar size={14} /> Rate Driver
            </button>
          )}

          {(['delivered', 'failed', 'cancelled'].includes(currentStatus)) && onDispute && (
            <button
              onClick={onDispute}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95"
            >
              <FaExclamationTriangle size={14} /> Dispute
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryCard;