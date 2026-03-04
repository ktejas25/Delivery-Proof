import React, { useMemo } from "react";
import { Phone, Navigation, MapPin, Package } from "lucide-react";
import { Delivery } from "./types";
import ActionButton from "./ui/ActionButton";
import StatusBadge from "./ui/StatusBadge";
import SLAIndicator from "./ui/SLAIndicator";
import { calculateSLAStatus, formatTime } from "./utils";
import { ACTION_BUTTON_CONFIG } from "./config";
import { cn } from "./utils";

interface NextDeliveryCardProps {
  delivery: Delivery;
  routeIndex: number;
  onStatusChange: (uuid: string, status: Delivery["delivery_status"]) => void;
  onCall: (delivery: Delivery) => void;
  onNavigate: (delivery: Delivery) => void;
  onProofRequired: (uuid: string) => void;
  loading?: boolean;
}

const NextDeliveryCard: React.FC<NextDeliveryCardProps> = React.memo(
  ({
    delivery,
    routeIndex,
    onStatusChange,
    onCall,
    onNavigate,
    onProofRequired,
    loading = false,
  }) => {
    if (!delivery) return null;

    const slaStatus = useMemo(
      () =>
        calculateSLAStatus(delivery.scheduled_time || new Date().toISOString()),
      [delivery?.scheduled_time],
    );
    const actionConfig =
      ACTION_BUTTON_CONFIG[delivery.delivery_status] ||
      ACTION_BUTTON_CONFIG["pending"];

    const handleMainAction = () => {
      if (delivery.delivery_status === "arrived") {
        onProofRequired(delivery.uuid);
      } else if (actionConfig?.nextStatus) {
        onStatusChange(delivery.uuid, actionConfig.nextStatus);
      }
    };

    const isSLAAtRisk = slaStatus.status !== "on-time";

    return (
      <div
        className={cn(
          "bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-in",
          isSLAAtRisk && slaStatus.status === "late"
            ? "border-red-200"
            : "border-slate-200",
        )}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                #
                {delivery.order_number
                  ? delivery.order_number.replace("ORD-", "")
                  : routeIndex}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                {delivery.customer_name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatTime(delivery.scheduled_time)}
              </p>
            </div>
          </div>
          <StatusBadge status={delivery.delivery_status} size="md" />
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
          <iframe
            title="delivery-location-map"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(delivery.address)}&z=15&output=embed`}
            className="w-full h-full"
          />
          {/* Fallback overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 to-slate-200/50 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-0">
            <MapPin className="text-slate-400" size={32} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Location & Details */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <MapPin
                size={18}
                className="text-slate-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {delivery.address}
                </p>
              </div>
            </div>

            {delivery.items_count && (
              <div className="flex gap-3 text-sm">
                <Package size={18} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">
                  {delivery.items_count} item
                  {delivery.items_count !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* SLA & Earnings */}
          <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
            <SLAIndicator slaStatus={slaStatus} size="md" showLabel={true} />
            {delivery.earnings && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Earnings</p>
                <p className="text-lg font-bold text-emerald-600">
                  ${delivery.earnings.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onCall(delivery)}
              disabled={loading}
              className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-sm min-h-[48px]"
            >
              <Phone size={18} />
              Call
            </button>

            <button
              onClick={() => onNavigate(delivery)}
              disabled={loading}
              className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-sm min-h-[48px]"
            >
              <Navigation size={18} />
              Navigate
            </button>
          </div>

          {/* Main Action Button */}
          <ActionButton
            onClick={handleMainAction}
            label={actionConfig.label}
            variant={actionConfig.variant}
            loading={loading}
            size="lg"
          />

          {/* SLA Warning */}
          {isSLAAtRisk && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm font-semibold text-center",
                slaStatus.status === "late"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {slaStatus.status === "late"
                ? `${Math.abs(slaStatus.minutesRemaining)}m overdue`
                : `${slaStatus.minutesRemaining}m until deadline`}
            </div>
          )}
        </div>
      </div>
    );
  },
);

NextDeliveryCard.displayName = "NextDeliveryCard";

export default NextDeliveryCard;
