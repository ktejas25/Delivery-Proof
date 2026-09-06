export type DeliveryStatus = 'pending' | 'in_transit' | 'arrived' | 'delivered' | 'failed' | 'disputed';

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
  address_lat?: number;
  address_lng?: number;
  delivery_instructions?: string;
  priority_level?: 'low' | 'normal' | 'high' | 'urgent';
  requires_signature?: boolean;
  requires_photo?: boolean;
}

export type DeliveryIssueType =
  | 'customer_unavailable'
  | 'gate_access_denied'
  | 'invalid_address'
  | 'damaged_package'
  | 'unsafe_location'
  | 'other';


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
