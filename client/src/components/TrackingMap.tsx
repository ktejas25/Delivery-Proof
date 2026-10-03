import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "../lib/leaflet-fix";
import useDeliveryTracking from "../hooks/useDeliveryTracking";
import { geocodeAddress } from "../services/geocodingService";
import { Truck, Maximize2, Compass } from "lucide-react";

interface TrackingMapProps {
  deliveryUuid: string;
  initialData?: any;
}

// Convert any coordinate representation to { lat: number, lng: number } | null
const toCoords = (loc: any): { lat: number; lng: number } | null => {
  if (!loc) return null;
  const lat = typeof loc.lat === "number" ? loc.lat : parseFloat(loc.lat);
  const lng = typeof loc.lng === "number" ? loc.lng : parseFloat(loc.lng);
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
  return { lat, lng };
};

const isValid = (loc: any): boolean => toCoords(loc) !== null;

// Haversine distance calculator in kilometers
const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Create custom animated Radar Driver Icon
const createDriverIcon = (driverName?: string) => {
  const safeName = driverName || "Delivery Driver";
  return L.divIcon({
    className: "custom-driver-radar-marker",
    html: `
      <div title="${safeName}" style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:-8px; border-radius:50%; background:rgba(79, 70, 229, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:absolute; inset:-4px; border-radius:50%; background:rgba(99, 102, 241, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #4f46e5, #3730a3); border:2.5px solid #ffffff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index:10;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
};

// Create custom Destination Pin Icon
const createDestinationIcon = () => {
  return L.divIcon({
    className: "custom-destination-marker",
    html: `
      <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
        <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #ef4444, #b91c1c); border:2.5px solid #ffffff; box-shadow:0 8px 16px -2px rgba(239, 68, 68, 0.4); display:flex; align-items:center; justify-content:center; z-index:10;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

// Sub-component to manage map bounds, invalidation, and programmatic recentering
const MapController: React.FC<{
  location: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  recenterTrigger: number;
}> = ({ location, destination, recenterTrigger }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately so tiles never render broken or gray
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    map.invalidateSize();

    if (location && destination) {
      const bounds = L.latLngBounds(
        [location.lat, location.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (location) {
      map.setView([location.lat, location.lng], 15);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 15);
    }
  }, [location, destination, recenterTrigger, map]);

  return null;
};

const TrackingMap: React.FC<TrackingMapProps> = ({
  deliveryUuid,
  initialData,
}) => {
  const { location, destination, status, connected, trackingDetails } =
    useDeliveryTracking(deliveryUuid, initialData);

  const [recenterCount, setRecenterCount] = useState(0);

  // Address geocoding fallback state
  const [geocodedDest, setGeocodedDest] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    const rawLat = initialData?.address_lat ?? initialData?.delivery_lat;
    const rawLng = initialData?.address_lng ?? initialData?.delivery_lng;
    return toCoords({ lat: rawLat, lng: rawLng });
  });

  // Effective Destination
  useEffect(() => {
    if (isValid(destination)) return;

    const rawLat = initialData?.address_lat ?? initialData?.delivery_lat;
    const rawLng = initialData?.address_lng ?? initialData?.delivery_lng;
    const fromInit = toCoords({ lat: rawLat, lng: rawLng });
    if (fromInit) {
      setGeocodedDest(fromInit);
      return;
    }

    const addr =
      initialData?.delivery_address ||
      initialData?.customer_address ||
      initialData?.address;

    if (addr) {
      let isMounted = true;
      geocodeAddress(addr).then((coords) => {
        if (isMounted && coords) {
          setGeocodedDest({ lat: coords[0], lng: coords[1] });
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [destination, initialData]);

  // Compute resolved Driver Coords
  const effectiveLocation = useMemo<{ lat: number; lng: number } | null>(() => {
    const fromHook = toCoords(location);
    if (fromHook) return fromHook;

    const initLat =
      initialData?.driver_lat ??
      initialData?.last_location_lat ??
      trackingDetails?.last_location_lat;
    const initLng =
      initialData?.driver_lng ??
      initialData?.last_location_lng ??
      trackingDetails?.last_location_lng;

    return toCoords({ lat: initLat, lng: initLng });
  }, [location, initialData, trackingDetails]);

  // Compute resolved Destination Coords
  const effectiveDestination = useMemo<{ lat: number; lng: number } | null>(() => {
    const fromHook = toCoords(destination);
    if (fromHook) return fromHook;

    const initLat =
      initialData?.delivery_lat ??
      initialData?.address_lat ??
      trackingDetails?.delivery_lat;
    const initLng =
      initialData?.delivery_lng ??
      initialData?.address_lng ??
      trackingDetails?.delivery_lng;

    const fromInit = toCoords({ lat: initLat, lng: initLng });
    if (fromInit) return fromInit;

    return toCoords(geocodedDest);
  }, [destination, initialData, trackingDetails, geocodedDest]);

  // Route Polyline
  const polylinePositions = useMemo(() => {
    if (effectiveLocation && effectiveDestination) {
      return [
        [effectiveLocation.lat, effectiveLocation.lng],
        [effectiveDestination.lat, effectiveDestination.lng],
      ] as [number, number][];
    }
    return [];
  }, [effectiveLocation, effectiveDestination]);

  // Distance Calculation
  const distanceKm = useMemo(() => {
    if (effectiveLocation && effectiveDestination) {
      return calculateDistanceKm(
        effectiveLocation.lat,
        effectiveLocation.lng,
        effectiveDestination.lat,
        effectiveDestination.lng
      );
    }
    return null;
  }, [effectiveLocation, effectiveDestination]);

  // Driver Icon & Destination Icon
  const driverIcon = useMemo(() => {
    return createDriverIcon(
      trackingDetails?.driver_name || initialData?.driver_name
    );
  }, [trackingDetails?.driver_name, initialData?.driver_name]);

  const destIcon = useMemo(() => createDestinationIcon(), []);

  // Display driver details
  const driverName =
    trackingDetails?.driver_name ||
    initialData?.driver_name ||
    "Delivery Driver";

  const customerAddress =
    trackingDetails?.customer_address ||
    initialData?.delivery_address ||
    initialData?.customer_address ||
    initialData?.address ||
    "Delivery Address";

  // Center coordinate determination
  const defaultCenter: [number, number] = [18.5204, 73.8567]; // Regional fallback
  const mapCenter: [number, number] = effectiveLocation
    ? [effectiveLocation.lat, effectiveLocation.lng]
    : effectiveDestination
    ? [effectiveDestination.lat, effectiveDestination.lng]
    : defaultCenter;

  const handleRecenter = () => {
    setRecenterCount((c) => c + 1);
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-2xl bg-slate-100">
      {/* Top Left: Live Status Radar Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-200/80">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              connected ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-75"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              connected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
          {connected ? "Satellite Radar Live" : "Syncing Telemetry"}
        </span>
      </div>

      {/* Top Right: Re-center & Map View Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-full shadow-md border border-slate-200/80 text-[11px] font-bold transition-all cursor-pointer"
          title="Recenter Map View"
        >
          <Maximize2 size={13} />
          <span>Fit Bounds</span>
        </button>
      </div>

      {/* Interactive Map View */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "#F1F5F9" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Dynamic Route Polyline */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#4f46e5",
              weight: 4,
              opacity: 0.8,
              dashArray: "8, 8",
            }}
          />
        )}

        {/* Customer Destination Marker */}
        {effectiveDestination && (
          <Marker
            position={[effectiveDestination.lat, effectiveDestination.lng]}
            icon={destIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 block w-fit">
                  Destination Drop-off
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1 leading-tight">
                  {customerAddress}
                </p>
                {distanceKm !== null && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    Distance: <strong className="text-indigo-600">{distanceKm} km away</strong>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Driver Radar Marker */}
        {effectiveLocation && (
          <Marker
            position={[effectiveLocation.lat, effectiveLocation.lng]}
            icon={driverIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block w-fit">
                  Active Courier
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {driverName}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  Status: {status.replace(/_/g, " ")}
                </p>
                {effectiveLocation && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    {effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Programmatic controller for smooth bounds fitting */}
        <MapController
          location={effectiveLocation}
          destination={effectiveDestination}
          recenterTrigger={recenterCount}
        />
      </MapContainer>

      {/* Bottom Floating Telemetry Info Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck size={15} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">
                {driverName}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {status.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {distanceKm !== null && (
            <>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <Compass size={14} />
                <span>{distanceKm} km to drop-off</span>
              </div>
            </>
          )}

          {!effectiveLocation && (
            <>
              <div className="w-px h-6 bg-slate-200" />
              <span className="text-[10px] font-semibold text-amber-600">
                Awaiting GPS Telemetry
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
