import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "../../lib/leaflet-fix";
import { Navigation, ExternalLink, MapPin, Crosshair, RefreshCw } from "lucide-react";
import { geocodeAddress, DEFAULT_REGIONAL_CENTER } from "../../services/geocodingService";

interface DeliveryAddressMapProps {
  address: string;
  lat?: number;
  lng?: number;
  customerName?: string;
  orderNumber?: string;
  onNavigate?: () => void;
  heightClass?: string;
}

// Custom Destination Marker Icon
const destinationPinIcon = L.divIcon({
  className: "custom-customer-address-marker",
  html: `
    <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; inset:-4px; border-radius:50%; background:rgba(239, 68, 68, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width:32px; height:32px; border-radius:50%; background:#ef4444; border:3px solid #ffffff; box-shadow:0 6px 14px rgba(239,68,68,0.45); display:flex; align-items:center; justify-content:center; z-index:2; color:white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// Map View Controller for animated recentering
const MapViewController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 16 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    // Invalidate map size to prevent gray tiles on flex/grid resize
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [center, zoom, map]);
  return null;
};

const DeliveryAddressMap: React.FC<DeliveryAddressMapProps> = ({
  address,
  lat,
  lng,
  customerName = "Customer",
  orderNumber,
  onNavigate,
  heightClass = "h-[190px] sm:h-[230px]",
}) => {
  const [coords, setCoords] = useState<[number, number] | null>(() => {
    if (lat && lng && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return null;
  });
  const [isResolving, setIsResolving] = useState<boolean>(!coords);
  const [errorResolving, setErrorResolving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // If explicit valid coordinates were passed, use them directly
    if (lat && lng && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
      setCoords([lat, lng]);
      setIsResolving(false);
      setErrorResolving(false);
      return;
    }

    if (!address) {
      setCoords(DEFAULT_REGIONAL_CENTER);
      setIsResolving(false);
      return;
    }

    // Otherwise, dynamically geocode customer address
    setIsResolving(true);
    setErrorResolving(false);

    geocodeAddress(address)
      .then((resolved) => {
        if (!isMounted) return;
        if (resolved) {
          setCoords(resolved);
          setErrorResolving(false);
        } else {
          setCoords(DEFAULT_REGIONAL_CENTER);
          setErrorResolving(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setCoords(DEFAULT_REGIONAL_CENTER);
        setErrorResolving(true);
      })
      .finally(() => {
        if (isMounted) setIsResolving(false);
      });

    return () => {
      isMounted = false;
    };
  }, [address, lat, lng]);

  const handleRecenter = () => {
    if (coords) {
      setCoords([...coords]);
    }
  };

  const handleOpenExternal = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank"
      );
    }
  };

  const activeCenter = coords || DEFAULT_REGIONAL_CENTER;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${heightClass}`}>
      {/* Map Display */}
      <MapContainer
        center={activeCenter}
        zoom={16}
        scrollWheelZoom={false}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <MapViewController center={activeCenter} zoom={16} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {coords && (
          <Marker position={coords} icon={destinationPinIcon}>
            <Popup className="custom-popup" autoPan>
              <div className="p-1 space-y-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                  <MapPin size={13} />
                  <span>Customer Destination</span>
                </div>
                {orderNumber && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Order #{orderNumber}
                  </span>
                )}
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {customerName}
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                  {address}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Loading Overlay */}
      {isResolving && (
        <div className="absolute inset-0 z-[400] bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="text-blue-600 animate-spin" />
          <span className="text-xs font-bold text-slate-700">Locating customer address...</span>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-1.5">
        <button
          onClick={handleRecenter}
          title="Recenter on customer location"
          className="p-1.5 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-md border border-slate-200 transition cursor-pointer active:scale-95"
        >
          <Crosshair size={14} className="text-slate-600" />
        </button>

        <button
          onClick={handleOpenExternal}
          title="Open in Navigation Maps"
          className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <Navigation size={12} />
          <span>Navigate</span>
          <ExternalLink size={10} className="text-blue-200" />
        </button>
      </div>

      {/* Bottom Address Banner */}
      <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={12} className="text-red-500 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-700 truncate">
            {address}
          </span>
        </div>
        {errorResolving && (
          <span className="text-[10px] text-amber-600 font-bold shrink-0">Approximate</span>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddressMap;
