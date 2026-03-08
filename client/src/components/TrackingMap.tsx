import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "../lib/leaflet-fix";
import { io } from "socket.io-client";
import api from "../services/api";

interface TrackingMapProps {
  deliveryUuid: string;
  initialData?: any;
}

const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
};

const TrackingMap: React.FC<TrackingMapProps> = ({
  deliveryUuid,
  initialData,
}) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initialData?.last_location_lat
      ? {
          lat: initialData.last_location_lat,
          lng: initialData.last_location_lng,
        }
      : null,
  );
  const [status, setStatus] = useState(
    initialData?.delivery_status || "unknown",
  );

  useEffect(() => {
    const socket = io(
      (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000",
    );

    socket.on("connect", () => {
      console.log("Connected to tracking socket");
      socket.emit("join_delivery", deliveryUuid);
    });

    socket.on("location_updated", (data: { lat: number; lng: number }) => {
      console.log("Location update received:", data);
      setLocation({ lat: data.lat, lng: data.lng });
    });

    const fetchLatest = async () => {
      try {
        const res = await api.get(`/customer/delivery/${deliveryUuid}/track`);
        if (res.data && res.data.last_location_lat) {
          setLocation({
            lat: res.data.last_location_lat,
            lng: res.data.last_location_lng,
          });
          setStatus(res.data.delivery_status);
        }
      } catch (err) {
        console.error("Failed to fetch tracking data", err);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 30000); // Fallback poll every 30s

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [deliveryUuid]);

  if (!location) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
        Connecting to live tracking...
      </div>
    );
  }

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[location.lat, location.lng]}>
        <Popup>
          <strong>Driver Location</strong>
          <br />
          Status: {status.replace("_", " ")}
        </Popup>
      </Marker>
      <RecenterMap lat={location.lat} lng={location.lng} />
    </MapContainer>
  );
};

export default TrackingMap;
