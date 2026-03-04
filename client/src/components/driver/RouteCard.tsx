import React, { useMemo } from "react";
import { Phone, Navigation } from "lucide-react";
import { Delivery } from "./types";
import ActionButton from "./ui/ActionButton";
import StatusBadge from "./ui/StatusBadge";
import SLAIndicator from "./ui/SLAIndicator";
import { calculateSLAStatus, formatTime } from "./utils";
import { ACTION_BUTTON_CONFIG } from "./config";
import { cn } from "./utils";

interface RouteCardProps {
  delivery: Delivery;
  routeIndex: number;
  isNext?: boolean;
  onStatusChange: (uuid: string, status: Delivery["delivery_status"]) => void;
  onCall: (delivery: Delivery) => void;
  onNavigate: (delivery: Delivery) => void;
  onProofRequired: (uuid: string) => void;
  loading?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = React.memo(
  ({
    delivery,
    routeIndex,
    isNext = false,
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

    return (
      <div
        className={cn(
          "bg-white rounded-2xl border border-slate-200 p-4 transition-all hover:shadow-md animate-slide-in-up",
          isNext && "border-blue-200 bg-blue-50",
        )}
      >
        {/* Header with index and info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">
                  #{delivery.order_number ? delivery.order_number.replace('ORD-', '') : routeIndex}
                </span>
              </div>
              {!isNext && <div className="w-0.5 h-6 bg-slate-200" />}
            </div>

            {/* Customer info */}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-slate-900 truncate">
                {delivery.customer_name}
              </h4>
              <p className="text-xs text-slate-500">
                {formatTime(delivery.scheduled_time)}
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onCall(delivery)}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg text-slate-600 hover:text-slate-900 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Call customer"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={() => onNavigate(delivery)}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg text-slate-600 hover:text-slate-900 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Navigate to delivery"
            >
              <Navigation size={16} />
            </button>
          </div>
        </div>

        {/* Address */}
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {delivery.address}
        </p>

        {/* Status and SLA row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge
            status={delivery.delivery_status}
            size="sm"
            showIcon={true}
          />
          <SLAIndicator slaStatus={slaStatus} size="sm" showLabel={false} />
        </div>

        {/* Action Button */}
        {delivery.delivery_status !== "delivered" && (
          <ActionButton
            onClick={handleMainAction}
            label={actionConfig.label}
            variant={actionConfig.variant}
            loading={loading}
            size="sm"
          />
        )}

        {delivery.delivery_status === "delivered" && (
          <div className="w-full text-center bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-semibold">
            ✓ Completed
          </div>
        )}
      </div>
    );
  },
);

RouteCard.displayName = "RouteCard";

export default RouteCard;
