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
  const scheduledTime = new Date(scheduledTimeStr).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((scheduledTime - now) / 60000);

  if (diffMinutes < SLA_CONFIG.late_threshold) {
    return { status: 'late', minutesRemaining: diffMinutes };
  } else if (diffMinutes <= SLA_CONFIG.at_risk_threshold) {
    return { status: 'at-risk', minutesRemaining: diffMinutes };
  } else {
    return { status: 'on-time', minutesRemaining: diffMinutes };
  }
};

export const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeRemaining = (minutes: number): string => {
  if (minutes < 0) return `${Math.abs(minutes)}m overdue`;
  return `${minutes}m remaining`;
};
