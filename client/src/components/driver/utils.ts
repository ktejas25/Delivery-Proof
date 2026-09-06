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

export const playDriverSound = (type: 'arrive' | 'complete' | 'alert' | 'click') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'arrive') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'complete') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
};

export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }
};

/**
 * Calculates a synthetic coordinate for deliveries without stored coordinates,
 * clustered logically around the driver's GPS or a regional baseline.
 */
export const getDeliveryCoordinates = (
  delivery: Delivery,
  index: number,
  baseLat = 37.7749,
  baseLng = -122.4194
): [number, number] => {
  if (delivery.address_lat && delivery.address_lng && delivery.address_lat !== 0) {
    return [delivery.address_lat, delivery.address_lng];
  }
  // Deterministic offset based on UUID char codes
  let hash = 0;
  for (let i = 0; i < (delivery.uuid || '').length; i++) {
    hash = (hash << 5) - hash + delivery.uuid.charCodeAt(i);
    hash |= 0;
  }
  const angle = ((Math.abs(hash) % 360) * Math.PI) / 180;
  const radius = 0.008 + (index * 0.004); // ~1-3 km
  const latOffset = Math.sin(angle) * radius;
  const lngOffset = Math.cos(angle) * radius;
  return [baseLat + latOffset, baseLng + lngOffset];
};


