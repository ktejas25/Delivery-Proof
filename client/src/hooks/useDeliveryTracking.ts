import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

export default function useDeliveryTracking(uuid: string) {

  const socketRef = useRef<any>(null);

  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [status, setStatus] = useState("unknown");
  const [connected, setConnected] = useState(false);

  useEffect(() => {

    const socket = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_delivery", uuid);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("location_updated", (data: any) => {
      setLocation({
        lat: data.lat,
        lng: data.lng,
      });
    });

    const fetchLatest = async () => {
      try {
        const res = await api.get(`/customer/delivery/${uuid}/track`);

        if (res.data) {
          setLocation({
            lat: res.data.last_location_lat,
            lng: res.data.last_location_lng,
          });

          setDestination({
            lat: res.data.delivery_lat,
            lng: res.data.delivery_lng,
          });

          setStatus(res.data.delivery_status);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLatest();

    const interval = setInterval(fetchLatest, 30000);

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
  };
}