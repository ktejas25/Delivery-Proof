import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from 'leaflet';
import "../lib/leaflet-fix";
import useDeliveryTracking from "../hooks/useDeliveryTracking";

interface TrackingMapProps {
  deliveryUuid: string;
  initialData?: any;
}

// Custom Icons
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RecenterMap: React.FC<{ location: any; destination: any }> = ({ location, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (location && destination) {
      const bounds = L.latLngBounds([location.lat, location.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (location) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, destination, map]);
  return null;
};

const TrackingMap: React.FC<TrackingMapProps> = ({
  deliveryUuid,
}) => {
  const { location, destination, status, connected } = useDeliveryTracking(deliveryUuid);

  const polylinePositions = useMemo(() => {
    if (location && destination) {
      return [[location.lat, location.lng], [destination.lat, destination.lng]] as [number, number][];
    }
    return [];
  }, [location, destination]);

  if (!location) {
    return (
      <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Satellites...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Connection Status Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-100 transition-all duration-500">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
          {connected ? 'Live' : 'Reconnecting'}
        </span>
      </div>

      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: '#F8FAFC' }}
        scrollWheelZoom={false}
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Route Line */}
        {polylinePositions.length > 0 && (
          <Polyline 
            positions={polylinePositions} 
            color="#6366f1" 
            weight={3} 
            opacity={0.6} 
            dashArray="10, 10"
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup className="custom-popup">
              <div className="p-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                <p className="text-sm font-bold text-gray-900">Delivery Point</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Marker */}
        <Marker position={[location.lat, location.lng]} icon={driverIcon}>
          <Popup className="custom-popup">
            <div className="p-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Driver</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{status.replace("_", " ")}</p>
            </div>
          </Popup>
        </Marker>

        <RecenterMap location={location} destination={destination} />
      </MapContainer>
      
      {/* Bottom Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-gray-100 text-center pointer-events-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tracking Real-time</p>
          <p className="text-xs font-bold text-indigo-600">Secure Logistics Protocol Active</p>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
