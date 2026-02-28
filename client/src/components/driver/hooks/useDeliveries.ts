import { useState, useCallback, useEffect } from 'react';
import { Delivery } from '../types';
import api from '../../../services/api';

const MOCK_DELIVERIES: Delivery[] = [
  {
    uuid: '1',
    customer_name: 'John Smith',
    customer_phone: '+1234567890',
    address: '123 Main St, New York, NY 10001',
    scheduled_time: new Date(Date.now() + 30 * 60000).toISOString(),
    delivery_status: 'pending',
    earnings: 50
  },
  {
    uuid: '2',
    customer_name: 'Sarah Johnson',
    customer_phone: '+1987654321',
    address: '456 Oak Ave, Brooklyn, NY 11201',
    scheduled_time: new Date(Date.now() + 90 * 60000).toISOString(),
    delivery_status: 'pending',
    earnings: 50
  }
];

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDeliveries = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/deliveries/today');
      const data = res.data;
      setDeliveries(data || MOCK_DELIVERIES);
      localStorage.setItem('cachedDeliveries', JSON.stringify(data || MOCK_DELIVERIES));
    } catch (err: any) {
      console.error('Fetch failed, using mock data:', err);
      const cached = localStorage.getItem('cachedDeliveries');
      if (cached) {
        try {
          setDeliveries(JSON.parse(cached));
        } catch {
          setDeliveries(MOCK_DELIVERIES);
        }
      } else {
        setDeliveries(MOCK_DELIVERIES);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return { deliveries, setDeliveries, loading, error, offline, refetch: fetchDeliveries };
};
