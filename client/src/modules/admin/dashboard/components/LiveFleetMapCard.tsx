import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import '../../../../lib/leaflet-fix';
import { Gauge, Radio, Car, AlertTriangle, ArrowUpRight, Navigation } from 'lucide-react';
import { FleetOverview } from '../types';

interface LiveFleetMapCardProps {
  fleet: FleetOverview;
  onOpenFullMap?: () => void;
  onSelectDriver?: (driverId: number) => void;
}

// Custom vehicle icons based on driver status
const createVehicleIcon = (status: string) => {
  const colorUrl = status === 'on_delivery'
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png'
    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';

  return new L.Icon({
    iconUrl: colorUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export const LiveFleetMapCard: React.FC<LiveFleetMapCardProps> = ({
  fleet,
  onOpenFullMap,
  onSelectDriver
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate center
    let centerLat = 18.5204;
    let centerLng = 73.8567;
    if (fleet.vehicles && fleet.vehicles.length > 0) {
      centerLat = fleet.vehicles.reduce((sum, v) => sum + v.location.lat, 0) / fleet.vehicles.length;
      centerLng = fleet.vehicles.reduce((sum, v) => sum + v.location.lng, 0) / fleet.vehicles.length;
    }

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], 13);
    }

    // Update Markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      if (fleet.vehicles && fleet.vehicles.length > 0) {
        fleet.vehicles.forEach((v) => {
          const marker = L.marker([v.location.lat, v.location.lng], {
            icon: createVehicleIcon(v.status)
          });

          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 space-y-1.5 min-w-[160px] text-xs';
          popupContent.innerHTML = `
            <div class="flex items-center justify-between border-b border-gray-100 pb-1">
              <p class="font-bold text-xs text-gray-900">${v.driverName}</p>
              <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                v.status === 'on_delivery' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }">${v.status.replace('_', ' ')}</span>
            </div>
            <p class="text-[11px] text-gray-500">${v.vehicleType} • ${v.licensePlate}</p>
            <p class="text-[11px] font-bold text-emerald-600">Speed: ${v.speed} km/h</p>
          `;

          if (onSelectDriver) {
            const btn = document.createElement('button');
            btn.className = 'w-full mt-1.5 py-1 px-2 text-[10px] font-bold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-center block';
            btn.innerText = 'View Driver Profile';
            btn.onclick = () => onSelectDriver(v.driverId);
            popupContent.appendChild(btn);
          }

          marker.bindPopup(popupContent);
          markersLayerRef.current?.addLayer(marker);
        });
      }
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [fleet.vehicles, onSelectDriver]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-sm flex flex-col justify-between h-full">
      {/* Header & Fleet Telemetry Row */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Navigation size={18} className="text-emerald-600" />
                Live Fleet Command
              </h3>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {fleet.liveTrackers} Trackers Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time vehicle telemetry, transit speeds & congestion monitoring
            </p>
          </div>

          {onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Open Full Map <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        {/* Telemetry KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/80">
            <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Active Vehicles</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{fleet.activeVehicles}</span>
              <Car size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/80">
            <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Avg Fleet Velocity</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{fleet.averageVelocity} {fleet.velocityUnit}</span>
              <Gauge size={16} className="text-emerald-500" />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/80">
            <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Congestion Status</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600">{fleet.congestion?.level || 'Moderate'}</span>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/80">
            <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Drivers Dispatched</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-600">{fleet.onDeliveryCount} on road</span>
              <Radio size={16} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-72 rounded-xl overflow-hidden border border-gray-100 relative shadow-inner bg-slate-50 z-0"
      />
    </div>
  );
};
