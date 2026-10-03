import { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

export interface LatLngCoords {
  lat: number;
  lng: number;
}

export default function useDeliveryTracking(uuid: string, initialData?: any) {
  const socketRef = useRef<any>(null);

  // Parse initial driver location if available
  const initialDriverLocation = useMemo<LatLngCoords | null>(() => {
    const rawLat = initialData?.driver_lat ?? initialData?.last_location_lat;
    const rawLng = initialData?.driver_lng ?? initialData?.last_location_lng;
    if (rawLat != null && rawLng != null) {
      const lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
      const lng = typeof rawLng === "number" ? rawLng : parseFloat(rawLng);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }
    return null;
  }, [initialData]);

  // Parse initial destination if available
  const initialDestination = useMemo<LatLngCoords | null>(() => {
    const rawLat = initialData?.delivery_lat ?? initialData?.address_lat;
    const rawLng = initialData?.delivery_lng ?? initialData?.address_lng;
    if (rawLat != null && rawLng != null) {
      const lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
      const lng = typeof rawLng === "number" ? rawLng : parseFloat(rawLng);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }
    return null;
  }, [initialData]);

  const [location, setLocation] = useState<LatLngCoords | null>(initialDriverLocation);
  const [destination, setDestination] = useState<LatLngCoords | null>(initialDestination);
  const [status, setStatus] = useState<string>(
    initialData?.delivery_status || initialData?.status || "in_transit"
  );
  const [connected, setConnected] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState<any>(initialData || null);

  // Sync state when uuid or initialData changes
  useEffect(() => {
    if (initialDriverLocation) {
      setLocation(initialDriverLocation);
    }
    if (initialDestination) {
      setDestination(initialDestination);
    }
    if (initialData?.delivery_status || initialData?.status) {
      setStatus(initialData.delivery_status || initialData.status);
    }
    if (initialData) {
      setTrackingDetails((prev: any) => ({ ...initialData, ...prev }));
    }
  }, [initialDriverLocation, initialDestination, initialData]);

  useEffect(() => {
    if (!uuid) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://localhost:5000" : undefined);

    const socket = socketUrl ? io(socketUrl) : io();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_delivery", uuid);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("location_updated", (data: any) => {
      if (data && data.lat != null && data.lng != null) {
        const lat = typeof data.lat === "number" ? data.lat : parseFloat(data.lat);
        const lng = typeof data.lng === "number" ? data.lng : parseFloat(data.lng);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          setLocation({ lat, lng });
        }
      }
    });

    const fetchLatest = async () => {
      try {
        const res = await api.get(`/customer/delivery/${uuid}/track`);
        if (res.data) {
          setTrackingDetails(res.data);

          // Update driver location
          const rawLat = res.data.last_location_lat;
          const rawLng = res.data.last_location_lng;
          if (rawLat != null && rawLng != null) {
            const lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
            const lng = typeof rawLng === "number" ? rawLng : parseFloat(rawLng);
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              setLocation({ lat, lng });
            }
          }

          // Update delivery destination
          const destLat = res.data.delivery_lat;
          const destLng = res.data.delivery_lng;
          if (destLat != null && destLng != null) {
            const lat = typeof destLat === "number" ? destLat : parseFloat(destLat);
            const lng = typeof destLng === "number" ? destLng : parseFloat(destLng);
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              setDestination({ lat, lng });
            }
          }

          if (res.data.delivery_status) {
            setStatus(res.data.delivery_status);
          }
        }
      } catch (err) {
        console.error("Live tracking telemetry fetch error:", err);
      }
    };

    fetchLatest();
    // Poll telemetry every 10 seconds for real-time responsiveness
    const interval = setInterval(fetchLatest, 10000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [uuid]);

  return {
    location,
    destination,
    status,
    connected,
    trackingDetails,
  };
}