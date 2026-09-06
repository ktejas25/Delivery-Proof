import React, { useMemo, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "../../lib/leaflet-fix";
import { Delivery, GPSPosition } from "./types";
import {
  getDeliveryCoordinates,
  formatTime,
  formatOrderNumber,
} from "./utils";
import StatusBadge from "./ui/StatusBadge";
import {
  Navigation,
  Phone,
  Crosshair,
  Maximize2,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface DriverRouteMapProps {
  deliveries: Delivery[];
  driverPosition: GPSPosition | null;
  selectedDeliveryUuid?: string | null;
  onSelectDelivery?: (delivery: Delivery) => void;
  onStatusChange?: (uuid: string, status: Delivery["delivery_status"]) => void;
  onProofRequired?: (uuid: string) => void;
  onCall?: (delivery: Delivery) => void;
  onNavigate?: (delivery: Delivery) => void;
  heightClass?: string;
}

// Map Controller for programmatically controlling bounds and views
const MapController: React.FC<{
  bounds: L.LatLngBoundsExpression | null;
  centerTarget: [number, number] | null;
  zoomTarget?: number;
}> = ({ bounds, centerTarget, zoomTarget }) => {
  const map = useMap();

  useEffect(() => {
    if (centerTarget) {
      map.setView(centerTarget, zoomTarget || 16, { animate: true });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [bounds, centerTarget, zoomTarget, map]);

  return null;
};

// Create custom Numbered Pin Marker Icon
const createStopIcon = (
  stopNumber: number,
  status: Delivery["delivery_status"],
  isSelected: boolean,
  isNext: boolean
) => {
  let bgColor = "#64748b"; // slate
  let ringColor = "rgba(100, 116, 139, 0.3)";

  if (status === "delivered") {
    bgColor = "#10b981"; // emerald
    ringColor = "rgba(16, 185, 129, 0.4)";
  } else if (status === "arrived") {
    bgColor = "#2563eb"; // blue
    ringColor = "rgba(37, 99, 235, 0.5)";
  } else if (status === "in_transit" || isNext) {
    bgColor = "#f59e0b"; // amber
    ringColor = "rgba(245, 158, 11, 0.5)";
  } else if (status === "failed") {
    bgColor = "#ef4444"; // red
    ringColor = "rgba(239, 68, 68, 0.4)";
  }

  const pulseRing =
    isNext || status === "in_transit" || status === "arrived"
      ? `<div style="position:absolute; inset:-6px; border-radius:50%; background:${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
      : "";

  const borderStyle = isSelected
    ? "border: 3px solid #ffffff; box-shadow: 0 0 0 3px #2563eb, 0 10px 15px -3px rgba(0,0,0,0.3);"
    : "border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);";

  const html = `
    <div style="position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px;">
      ${pulseRing}
      <div style="width:32px; height:32px; border-radius:50%; background:${bgColor}; color:white; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; ${borderStyle} z-index:2; cursor:pointer;">
        ${status === "delivered" ? "✓" : stopNumber}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-stop-marker",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

// Driver Location Marker Icon
const driverPinIcon = L.divIcon({
  className: "custom-driver-marker",
  html: `
    <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; inset:-8px; border-radius:50%; background:rgba(37, 99, 235, 0.25); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
      <div style="width:24px; height:24px; border-radius:50%; background:#2563eb; border:3px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index:2;">
        <div style="width:7px; height:7px; border-radius:50%; background:#ffffff;"></div>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const DriverRouteMap: React.FC<DriverRouteMapProps> = ({
  deliveries,
  driverPosition,
  selectedDeliveryUuid,
  onSelectDelivery,
  onProofRequired,
  onCall,
  onNavigate,
  heightClass = "h-[450px] sm:h-[550px]",
}) => {
  const [centerTarget, setCenterTarget] = useState<[number, number] | null>(null);
  const [zoomTarget, setZoomTarget] = useState<number>(15);
  const [activePreviewDelivery, setActivePreviewDelivery] = useState<Delivery | null>(null);

  // Baseline coordinates if GPS is absent (defaults to San Francisco or first delivery)
  const defaultBaseLat = driverPosition?.lat || 37.7749;
  const defaultBaseLng = driverPosition?.lng || -122.4194;

  // Compute geocoded stops with coordinates
  const stopsWithCoords = useMemo(() => {
    return deliveries.map((delivery, index) => {
      const [lat, lng] = getDeliveryCoordinates(
        delivery,
        index,
        defaultBaseLat,
        defaultBaseLng
      );
      return {
        delivery,
        stopIndex: index + 1,
        lat,
        lng,
      };
    });
  }, [deliveries, defaultBaseLat, defaultBaseLng]);

  // Overall bounds encompassing driver & stops
  const routeBounds = useMemo(() => {
    const points: [number, number][] = [];
    if (driverPosition?.lat && driverPosition?.lng) {
      points.push([driverPosition.lat, driverPosition.lng]);
    }
    stopsWithCoords.forEach((s) => points.push([s.lat, s.lng]));
    if (points.length === 0) return null;
    return L.latLngBounds(points);
  }, [stopsWithCoords, driverPosition]);

  // Route Polyline positions: driver -> stop 1 -> stop 2 ...
  const polylineCoords = useMemo(() => {
    const coords: [number, number][] = [];
    if (driverPosition?.lat && driverPosition?.lng) {
      coords.push([driverPosition.lat, driverPosition.lng]);
    }
    stopsWithCoords.forEach((s) => coords.push([s.lat, s.lng]));
    return coords;
  }, [stopsWithCoords, driverPosition]);

  // Keep active preview delivery synchronized
  useEffect(() => {
    if (selectedDeliveryUuid) {
      const match = deliveries.find((d) => d.uuid === selectedDeliveryUuid);
      if (match) setActivePreviewDelivery(match);
    }
  }, [selectedDeliveryUuid, deliveries]);

  // Handlers for quick view controls
  const handleFitRoute = () => {
    setCenterTarget(null);
  };

  const handleCenterDriver = () => {
    if (driverPosition?.lat && driverPosition?.lng) {
      setCenterTarget([driverPosition.lat, driverPosition.lng]);
      setZoomTarget(16);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${heightClass}`}>
      <MapContainer
        bounds={routeBounds || undefined}
        center={
          driverPosition?.lat
            ? [driverPosition.lat, driverPosition.lng]
            : [defaultBaseLat, defaultBaseLng]
        }
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapController
          bounds={centerTarget ? null : routeBounds}
          centerTarget={centerTarget}
          zoomTarget={zoomTarget}
        />

        {/* Clean, high-performance Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: "#2563eb",
              weight: 4,
              opacity: 0.75,
              dashArray: "6, 8",
            }}
          />
        )}

        {/* Driver GPS Marker & Accuracy Circle */}
        {driverPosition?.lat && driverPosition?.lng && (
          <>
            <Circle
              center={[driverPosition.lat, driverPosition.lng]}
              radius={Math.min(100, Math.max(20, driverPosition.accuracy || 30))}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
            <Marker
              position={[driverPosition.lat, driverPosition.lng]}
              icon={driverPinIcon}
            >
              <Popup>
                <div className="text-center py-1">
                  <span className="font-bold text-xs text-blue-700 block">Your Live Location</span>
                  <span className="text-[10px] text-slate-500">
                    Accuracy: ±{Math.round(driverPosition.accuracy || 10)}m
                  </span>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Numbered Delivery Stop Markers */}
        {stopsWithCoords.map(({ delivery, stopIndex, lat, lng }) => {
          const isSelected = activePreviewDelivery?.uuid === delivery.uuid;
          const isNext =
            delivery.delivery_status === "in_transit" ||
            delivery.delivery_status === "pending";

          return (
            <Marker
              key={delivery.uuid}
              position={[lat, lng]}
              icon={createStopIcon(
                stopIndex,
                delivery.delivery_status,
                isSelected,
                isNext
              )}
              eventHandlers={{
                click: () => {
                  setActivePreviewDelivery(delivery);
                  onSelectDelivery?.(delivery);
                },
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      Stop #{stopIndex}
                    </span>
                    <StatusBadge status={delivery.delivery_status} size="sm" />
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {delivery.customer_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {delivery.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={11} className="text-slate-400" />
                      {formatTime(delivery.scheduled_time)}
                    </span>
                    {delivery.earnings && (
                      <span className="font-bold text-emerald-700">
                        +${delivery.earnings}
                      </span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => onNavigate?.(delivery)}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Navigation size={12} />
                      <span>Nav</span>
                    </button>
                    {delivery.customer_phone && (
                      <button
                        onClick={() => onCall?.(delivery)}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                        title="Call customer"
                      >
                        <Phone size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl shadow-md border border-slate-200/80">
        <button
          onClick={handleFitRoute}
          title="Fit full route in view"
          className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Maximize2 size={16} />
        </button>
        {driverPosition && (
          <button
            onClick={handleCenterDriver}
            title="Recenter on driver location"
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <Crosshair size={16} />
          </button>
        )}
      </div>

      {/* Floating Bottom Stop Card (Mobile & Desktop interactive preview) */}
      {activePreviewDelivery && (
        <div className="absolute bottom-3 inset-x-3 sm:left-4 sm:right-auto sm:max-w-sm z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200 animate-fade-in">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                #{formatOrderNumber(activePreviewDelivery.order_number, 1)}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {activePreviewDelivery.customer_name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {activePreviewDelivery.address}
                </p>
              </div>
            </div>
            <StatusBadge status={activePreviewDelivery.delivery_status} size="sm" />
          </div>

          {/* Actions inside drawer */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate?.(activePreviewDelivery)}
              className="flex-1 min-h-[36px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Navigation size={13} />
              <span>Navigate</span>
            </button>
            {activePreviewDelivery.customer_phone && (
              <button
                onClick={() => onCall?.(activePreviewDelivery)}
                className="min-h-[36px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Phone size={13} />
                <span>Call</span>
              </button>
            )}
            {activePreviewDelivery.delivery_status === "arrived" && onProofRequired && (
              <button
                onClick={() => onProofRequired(activePreviewDelivery.uuid)}
                className="min-h-[36px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={13} />
                <span>Proof</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverRouteMap;
