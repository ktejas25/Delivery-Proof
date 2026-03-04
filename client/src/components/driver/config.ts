import { DeliveryStatus } from './types';

export const STATUS_CONFIG: Record<DeliveryStatus, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  pending: {
    label: 'Pending',
    color: '#64748b',
    bgColor: '#f1f5f9',
    textColor: '#475569',
    icon: '⏳',
  },
  in_transit: {
    label: 'In Transit',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    icon: '🚚',
  },
  arrived: {
    label: 'Arrived',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    textColor: '#1e40af',
    icon: '📍',
  },
  delivered: {
    label: 'Delivered',
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    icon: '✓',
  },
};

export const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ['in_transit'],
  in_transit: ['arrived'],
  arrived: ['delivered'],
  delivered: [],
};

export const ACTION_BUTTON_CONFIG: Record<DeliveryStatus, {
  label: string;
  nextStatus: DeliveryStatus | null;
  variant: 'primary' | 'secondary' | 'success' | 'disabled';
}> = {
  pending: {
    label: 'Start Delivery',
    nextStatus: 'in_transit',
    variant: 'primary',
  },
  in_transit: {
    label: 'Mark Arrived',
    nextStatus: 'arrived',
    variant: 'primary',
  },
  arrived: {
    label: 'Complete Delivery',
    nextStatus: 'delivered',
    variant: 'success',
  },
  delivered: {
    label: 'Completed',
    nextStatus: null,
    variant: 'disabled',
  },
};

export const SLA_CONFIG = {
  at_risk_threshold: 15, // minutes before scheduled time
  late_threshold: 0, // minutes after scheduled time
};

export const GPS_STATUS_CONFIG = {
  connecting: {
    label: 'Connecting...',
    color: '#f59e0b',
    icon: '📡',
  },
  live: {
    label: 'Live GPS',
    color: '#10b981',
    icon: '✓',
  },
  denied: {
    label: 'GPS Denied',
    color: '#ef4444',
    icon: '✗',
  },
  unavailable: {
    label: 'Unavailable',
    color: '#6b7280',
    icon: '—',
  },
};

export const TOUCH_TARGET_MIN = 48; // pixels - minimum touch target size for accessibility
