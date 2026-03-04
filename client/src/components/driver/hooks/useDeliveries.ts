import { useState, useCallback, useEffect } from 'react';
import { Delivery, SyncQueueItem } from '../types';
import api from '../../../services/api';

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  // Sync queued updates when connection is restored
  const syncQueuedUpdates = useCallback(async () => {
    if (syncQueue.length === 0) return;

    for (const item of syncQueue) {
      try {
        // Map frontend status back to backend enum
        let dbStatus = item.status as string;
        if (dbStatus === 'pending') dbStatus = 'dispatched'; // or scheduled based on your rules
        else if (dbStatus === 'in_transit') dbStatus = 'en_route';

        await api.patch(`/deliveries/${item.uuid}/status`, { status: dbStatus });
        setSyncQueue((prev) => prev.filter((q) => q.uuid !== item.uuid));
      } catch (err) {
        console.error('Failed to sync item:', item.uuid, err);
      }
    }
  }, [syncQueue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      // Trigger sync when reconnected
      syncQueuedUpdates();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueuedUpdates]);

  // Optimistic update with sync queue fallback
  const updateDeliveryStatus = useCallback(
    async (uuid: string, newStatus: Delivery['delivery_status']) => {
      // Optimistic update
      const updated = deliveries.map((d) =>
        d.uuid === uuid ? { ...d, delivery_status: newStatus } : d
      );
      setDeliveries(updated);
      localStorage.setItem('deliveries', JSON.stringify(updated));

      // Add to sync queue
      const queueItem: SyncQueueItem = {
        uuid,
        status: newStatus,
        timestamp: Date.now(),
      };
      setSyncQueue((prev) => [...prev, queueItem]);

      // Try to sync if online
      if (!offline) {
        try {
          // Map frontend status to backend enum before patch
          let dbStatus = newStatus as string;
          if (dbStatus === 'pending') dbStatus = 'dispatched';
          else if (dbStatus === 'in_transit') dbStatus = 'en_route';

          await api.patch(`/deliveries/${uuid}/status`, { status: dbStatus });
          setSyncQueue((prev) => prev.filter((item) => item.uuid !== uuid));
        } catch (err) {
          console.error('Failed to sync delivery update:', err);
        }
      }
    },
    [deliveries, offline]
  );

  // Initialize with mock data
  useEffect(() => {
    const initDeliveries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/deliveries/driver');
        const fetchedDeliveries = response.data
          .filter(Boolean)
          .map((d: any) => {
            let mappedStatus = d.delivery_status || 'pending';
            if (mappedStatus === 'scheduled' || mappedStatus === 'dispatched') mappedStatus = 'pending';
            else if (mappedStatus === 'en_route') mappedStatus = 'in_transit';
            else if (mappedStatus === 'failed' || mappedStatus === 'cancelled' || mappedStatus === 'disputed') mappedStatus = 'delivered'; // fail-safe

            return {
              uuid: d.uuid || d.id || Math.random().toString(),
              order_number: d.order_number,
              customer_name: d.customer_name || 'Unknown',
              customer_phone: d.customer_phone,
              address: d.customer_address || d.address || 'Unknown Address',
              scheduled_time: d.scheduled_time || new Date().toISOString(),
              delivery_status: mappedStatus as Delivery['delivery_status'],
              earnings: d.earnings || 50,
              items_count: d.items_count || 1,
            };
          });
        setDeliveries(fetchedDeliveries);
        localStorage.setItem('deliveries', JSON.stringify(fetchedDeliveries));
      } catch (err: any) {
        setError('Failed to load deliveries');
        console.error('Failed to load deliveries:', err);
      } finally {
        setLoading(false);
      }
    };

    initDeliveries();
  }, []);

  const submitDeliveryProof = useCallback(
    async (uuid: string, proof: { photoUrl?: string; signature?: string; notes?: string; gps?: any }) => {
      if (offline) {
        throw new Error("You must be online to submit proof.");
      }

      try {
        // 1. Upload photo if exists (base64)
        let finalPhotoUrl = null;
        if (proof.photoUrl) {
          const photoRes = await api.post("/upload/photo", {
            photo: proof.photoUrl,
          });
          finalPhotoUrl = photoRes.data.url;
        }

        // 2. Upload signature if exists (base64)
        let finalSignatureUrl = null;
        if (proof.signature) {
          const sigRes = await api.post("/upload/signature", {
            signature: proof.signature,
          });
          finalSignatureUrl = sigRes.data.url;
        }

        // 3. Submit proof artifacts to delivery
        // The backend status will be automatically set to 'delivered' by this endpoint
        await api.post(`/deliveries/${uuid}/proof`, {
          photo_url: finalPhotoUrl,
          signature_url: finalSignatureUrl,
          gps_lat: proof.gps?.lat || 0,
          gps_lng: proof.gps?.lng || 0,
          gps_accuracy: proof.gps?.accuracy || 0,
          recorded_at: Date.now(),
        });

        // 4. Update local state optimistically
        const updated = deliveries.map((d) =>
          d.uuid === uuid
            ? ({ ...d, delivery_status: "delivered" } as Delivery)
            : d
        );
        setDeliveries(updated);
        localStorage.setItem("deliveries", JSON.stringify(updated));

        return true;
      } catch (err) {
        console.error("Proof submission failed:", err);
        throw err;
      }
    },
    [deliveries, offline]
  );

  return {
    deliveries,
    setDeliveries,
    syncQueue,
    loading,
    error,
    offline,
    updateDeliveryStatus,
    submitDeliveryProof,
    syncQueuedUpdates,
  };
};
