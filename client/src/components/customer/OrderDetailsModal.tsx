import React from 'react';
import Modal from '../ui/Modal';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';
import { FaUser, FaMapMarkerAlt, FaBox } from 'react-icons/fa';

interface OrderDetailsModalProps {
  delivery: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ delivery, onClose }) => {
  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details #${orderNum}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</p>
            <StatusBadge status={delivery.status as DeliveryStatus} />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Placed On</p>
            <p className="text-sm font-bold text-gray-700">{new Date(delivery.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaUser size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Driver</p>
              <p className="text-base font-semibold text-gray-800">{delivery.driver_name || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Delivery Address</p>
              <p className="text-base font-semibold text-gray-800">{delivery.delivery_address || 'N/A'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaBox size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Items</p>
              <p className="text-base font-semibold text-gray-800">
                {delivery.items_count || 1} Standard Package(s)
              </p>
            </div>
          </div>
        </div>

        {delivery.status === 'delivered' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Delivery Confirmation</span>
              <span className="text-green-600 font-bold">Confirmed by Driver</span>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;