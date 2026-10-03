import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Phone,
  ShieldCheck,
  ChevronRight,
  Package,
  Star,
  Info,
} from 'lucide-react';
import TrackingMap from '../TrackingMap';
import DeliveryTimeline from './DeliveryTimeline';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';

interface CustomerLiveMapTrackerProps {
  activeDeliveries: any[];
  allDeliveries?: any[];
  selectedDeliveryUuid?: string | null;
  onSelectDeliveryUuid?: (uuid: string) => void;
  onOpenDetails: (delivery: any) => void;
}

export const CustomerLiveMapTracker: React.FC<CustomerLiveMapTrackerProps> = ({
  activeDeliveries,
  allDeliveries = [],
  selectedDeliveryUuid,
  onSelectDeliveryUuid,
  onOpenDetails,
}) => {
  // Determine available pool of deliveries (active first, fallback to all recent deliveries)
  const availableDeliveries = useMemo(() => {
    if (activeDeliveries && activeDeliveries.length > 0) {
      return activeDeliveries;
    }
    return allDeliveries || [];
  }, [activeDeliveries, allDeliveries]);

  const [selectedUuid, setSelectedUuid] = useState<string>(() => {
    return (
      selectedDeliveryUuid ||
      activeDeliveries[0]?.uuid ||
      availableDeliveries[0]?.uuid ||
      ''
    );
  });

  // Sync external selectedDeliveryUuid if provided
  useEffect(() => {
    if (selectedDeliveryUuid) {
      setSelectedUuid(selectedDeliveryUuid);
    }
  }, [selectedDeliveryUuid]);

  // Sync if selected package was deleted or changed
  const selectedDelivery = useMemo(() => {
    return (
      availableDeliveries.find((d) => d.uuid === selectedUuid) ||
      availableDeliveries[0] ||
      null
    );
  }, [availableDeliveries, selectedUuid]);

  const handleSelectDelivery = (uuid: string) => {
    setSelectedUuid(uuid);
    if (onSelectDeliveryUuid) {
      onSelectDeliveryUuid(uuid);
    }
  };

  if (!selectedDelivery) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
          <Truck size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            No Orders Found for Live Tracking
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            When a driver dispatches a shipment addressed to you, the real-time GPS
            tracking radar and interactive map will display here automatically.
          </p>
        </div>
      </div>
    );
  }

  const isHistoricalOnly =
    activeDeliveries.length === 0 && availableDeliveries.length > 0;

  const statusKey = (
    selectedDelivery.status ||
    selectedDelivery.delivery_status ||
    'pending'
  )
    .toLowerCase()
    .replace(/[\s-]/g, '_') as DeliveryStatus;

  return (
    <div className="space-y-6">
      {/* Notice if viewing a completed/past delivery because no in-transit delivery exists */}
      {isHistoricalOnly && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-800">
          <Info size={18} className="text-amber-600 shrink-0" />
          <p>
            You have no active shipments en route right now. Displaying delivery route
            and location details for recent order{" "}
            <strong>#{selectedDelivery.order_number?.substring(0, 8)}</strong>.
          </p>
        </div>
      )}

      {/* Top Selector if multiple deliveries available */}
      {availableDeliveries.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Order:
          </span>
          {availableDeliveries.map((del) => {
            const isSelected = del.uuid === selectedDelivery.uuid;
            const delStatus = (del.status || del.delivery_status || '').toLowerCase();
            const isActive = [
              'pending',
              'scheduled',
              'dispatched',
              'en_route',
              'arrived',
            ].includes(delStatus);

            return (
              <button
                key={del.uuid}
                onClick={() => handleSelectDelivery(del.uuid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Package size={14} />
                <span>#{del.order_number?.substring(0, 8)}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : isActive
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Map + Card Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Map (8 cols) */}
        <div className="lg:col-span-8 min-w-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[480px] lg:h-[580px] relative">
          {/* Map Header Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Live Dispatch Radar: #{selectedDelivery.order_number?.substring(0, 8)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedDelivery.driver_name
                    ? `Driven by ${selectedDelivery.driver_name}`
                    : 'Courier assigned'}
                </p>
              </div>
            </div>
            <StatusBadge status={statusKey} />
          </div>

          {/* Interactive Map Component */}
          <div className="flex-1 w-full h-full relative">
            <TrackingMap
              key={selectedDelivery.uuid}
              deliveryUuid={selectedDelivery.uuid}
              initialData={selectedDelivery}
            />
          </div>
        </div>

        {/* Right: Driver Card & Live Step Progression (4 cols) */}
        <div className="lg:col-span-4 min-w-0 flex flex-col justify-between space-y-4">
          {/* Driver & Delivery Information Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Assigned Driver
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {selectedDelivery.driver_name || 'Driver In Transit'}
                </h4>
              </div>

              {selectedDelivery.driver_phone && (
                <a
                  href={`tel:${selectedDelivery.driver_phone}`}
                  className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="Contact Driver"
                >
                  <Phone size={18} />
                </a>
              )}
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Vehicle
                </span>
                <p className="font-bold text-slate-800 truncate">
                  {selectedDelivery.driver_vehicle || 'Delivery Van'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Driver Rating
                </span>
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star size={13} className="fill-amber-400" />
                  <span>
                    {selectedDelivery.driver_avg_rating
                      ? Number(selectedDelivery.driver_avg_rating).toFixed(1)
                      : '5.0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} className="text-indigo-600" />
                Destination Drop-off
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                {selectedDelivery.delivery_address ||
                  selectedDelivery.customer_address ||
                  selectedDelivery.address ||
                  'Saved Primary Address'}
              </p>
            </div>

            {/* Delivery Timeline Progression */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Live Milestones
              </span>
              <DeliveryTimeline status={statusKey} />
            </div>

            {/* Open Full Details Modal Button */}
            <button
              onClick={() => onOpenDetails(selectedDelivery)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>View Full Order Details & Instructions</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Security & Proof Advisory */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <ShieldCheck size={16} />
              <span>Contactless Proof Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Upon drop-off, your driver will record high-resolution photo proof and
              geotagged confirmation to guarantee receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLiveMapTracker;
