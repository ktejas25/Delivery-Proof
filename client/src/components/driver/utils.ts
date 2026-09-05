import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Delivery, SLAStatus } from './types';
import { SLA_CONFIG } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const searchDeliveries = (deliveries: Delivery[], query: string): Delivery[] => {
  if (!query.trim()) return deliveries;
  const q = query.toLowerCase();
  return deliveries.filter(
    (d: Delivery) =>
      d.customer_name?.toLowerCase().includes(q) ||
      d.address?.toLowerCase().includes(q) || 
      d.uuid.toLowerCase().includes(q)
  );
};

export const sortDeliveriesByTime = (deliveries: Delivery[]): Delivery[] => {
  return [...deliveries].sort(
    (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  );
};

export const getRouteStats = (deliveries: Delivery[]) => {
  const total = deliveries.length;
  const completed = deliveries.filter((d) => d.delivery_status === 'delivered').length;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const totalEarnings = deliveries
    .filter((d) => d.delivery_status === 'delivered')
    .reduce((sum, d) => sum + (d.earnings || 50), 0);

  return { total, completed, completionPercentage, totalEarnings };
};

export const calculateSLAStatus = (scheduledTimeStr: string): SLAStatus => {
  const scheduledDate = new Date(scheduledTimeStr);
  const scheduledTime = scheduledDate.getTime();
  const now = Date.now();

  if (isNaN(scheduledTime)) {
    return { status: 'on-time', minutesRemaining: 999 };
  }

  const diffMinutes = Math.floor((scheduledTime - now) / 60000);

  if (diffMinutes < SLA_CONFIG.late_threshold) {
    return { status: 'late', minutesRemaining: diffMinutes };
  } else if (diffMinutes <= SLA_CONFIG.at_risk_threshold) {
    return { status: 'at-risk', minutesRemaining: diffMinutes };
  } else {
    return { status: 'on-time', minutesRemaining: diffMinutes };
  }
};

export const formatDuration = (minutes: number): string => {
  const absMin = Math.abs(minutes);
  if (absMin < 1) return '< 1 min';
  if (absMin < 60) return `${absMin} min`;
  const hours = Math.floor(absMin / 60);
  const remainingMins = absMin % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${String(remainingMins).padStart(2, '0')}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const formatTime = (isoString: string): string => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTimeRemaining = (minutes: number): string => {
  const duration = formatDuration(minutes);
  if (minutes < 0) return `${duration} overdue`;
  return `${duration} remaining`;
};

export const formatOrderNumber = (orderNumber?: string, fallbackIndex?: number): string => {
  if (orderNumber) {
    return orderNumber.replace(/^ORD-?/i, '');
  }
  return fallbackIndex !== undefined ? String(fallbackIndex).padStart(2, '0') : '';
};

