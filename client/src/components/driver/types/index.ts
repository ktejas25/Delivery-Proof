export interface Delivery {
  uuid: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  scheduled_time: string;
  delivery_status: 'pending' | 'in_transit' | 'arrived' | 'delivered' | 'failed';
  earnings?: number;
}

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}
