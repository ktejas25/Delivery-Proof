export type DeliveryStatus = 'pending' | 'in_transit' | 'arrived' | 'delivered';

export interface Delivery {
  uuid: string;
  order_number?: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  scheduled_time: string;
  delivery_status: DeliveryStatus;
  earnings?: number;
  items_count?: number;
}

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export type GPSStatus = 'connecting' | 'live' | 'denied' | 'unavailable';

export interface SyncQueueItem {
  uuid: string;
  status: DeliveryStatus;
  timestamp: number;
}

export interface DriverMetrics {
  earnings: number;
  completionPercentage: number;
  onTimePercentage: number;
  routeProgress: number;
}

export interface SLAStatus {
  status: 'on-time' | 'at-risk' | 'late';
  minutesRemaining: number;
}
