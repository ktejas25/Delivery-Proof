import React, { useMemo } from "react";
import { Phone, Navigation, MapPin, CheckCircle2, Clock } from "lucide-react";
import { Delivery } from "./types";
import StatusBadge from "./ui/StatusBadge";
import SLAIndicator from "./ui/SLAIndicator";
import { calculateSLAStatus, formatTime, formatOrderNumber } from "./utils";
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
      () => calculateSLAStatus(delivery.scheduled_time || new Date().toISOString()),
      [delivery?.scheduled_time]
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

    const orderDisplay = formatOrderNumber(delivery.order_number, routeIndex);

    return (
      <div
        className={cn(
          "bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-2xs hover:shadow-xs",
          isNext ? "border-blue-300 bg-blue-50/20" : "border-slate-200"
        )}
      >
        {/* Top Header: Stop Number + Order ID + Customer Name + Status */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Route Index Avatar */}
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
              #{orderDisplay}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Stop {routeIndex}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock size={11} className="text-slate-400" />
                  {formatTime(delivery.scheduled_time)}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {delivery.customer_name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge status={delivery.delivery_status} size="sm" showIcon />
            <SLAIndicator slaStatus={slaStatus} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Address Row (1-2 lines) */}
        <div className="flex items-start gap-1.5 mb-3 text-xs text-slate-600 bg-slate-50/60 p-2 rounded-xl">
          <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed font-medium">
            {delivery.address}
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2">
          {/* Quick Call */}
          <button
            onClick={() => onCall(delivery)}
            disabled={loading || !delivery.customer_phone}
            className="min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer border border-slate-200/60"
            title={delivery.customer_phone ? `Call ${delivery.customer_phone}` : "No phone number"}
          >
            <Phone size={15} />
          </button>

          {/* Quick Navigate */}
          <button
            onClick={() => onNavigate(delivery)}
            disabled={loading}
            className="min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer border border-slate-200/60"
            title="Navigate to destination"
          >
            <Navigation size={15} className="text-blue-600" />
          </button>

          {/* Primary Action */}
          {delivery.delivery_status !== "delivered" ? (
            <button
              onClick={handleMainAction}
              disabled={loading}
              className={cn(
                "flex-1 min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]",
                delivery.delivery_status === "arrived"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
                loading && "opacity-75 pointer-events-none"
              )}
            >
              <span>{actionConfig.label}</span>
            </button>
          ) : (
            <div className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200/60">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Delivered</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RouteCard.displayName = "RouteCard";

export default RouteCard;
