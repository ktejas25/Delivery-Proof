import React from 'react';
import { 
  FaClock, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';

export type DeliveryStatus = 
  | 'scheduled' 
  | 'dispatched' 
  | 'en_route' 
  | 'delivered' 
  | 'cancelled' 
  | 'failed'
  | 'arrived'
  | 'disputed'
  | 'pending';

interface StatusBadgeProps {
  status: DeliveryStatus;
}

const statusConfig = {
  scheduled: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: FaClock,
    label: 'Scheduled'
  },
  dispatched: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FaTruck,
    label: 'Dispatched'
  },
  en_route: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: FaMapMarkerAlt,
    label: 'En Route'
  },
  delivered: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: FaCheckCircle,
    label: 'Delivered'
  },
  cancelled: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: FaTimesCircle,
    label: 'Cancelled'
  },
  failed: {
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: FaExclamationTriangle,
    label: 'Failed'
  },
  pending: {
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: FaClock,
    label: 'Pending'
  },
  arrived: {
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: FaMapMarkerAlt,
    label: 'Arrived'
  },
  disputed: {
    color: 'bg-red-50 text-red-600 border-red-100',
    icon: FaExclamationTriangle,
    label: 'Disputed'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
