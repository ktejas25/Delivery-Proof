import React, { useMemo } from "react";
import {
  Phone,
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  KeyRound,
  Camera,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";
import { Delivery } from "./types";
import StatusBadge from "./ui/StatusBadge";
import SLAIndicator from "./ui/SLAIndicator";
import {
  calculateSLAStatus,
  formatTime,
  formatOrderNumber,
  playDriverSound,
  triggerHaptic,
  cn,
} from "./utils";
import { ACTION_BUTTON_CONFIG } from "./config";

interface RouteCardProps {
  delivery: Delivery;
  routeIndex: number;
  isNext?: boolean;
  onStatusChange: (uuid: string, status: Delivery["delivery_status"]) => void;
  onCall: (delivery: Delivery) => void;
  onNavigate: (delivery: Delivery) => void;
  onProofRequired: (uuid: string) => void;
  onOpenContact?: (delivery: Delivery) => void;
  onReportIssue?: (delivery: Delivery) => void;
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
    onOpenContact,
    onReportIssue,
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
        playDriverSound("arrive");
        triggerHaptic([60, 40, 80]);
        onProofRequired(delivery.uuid);
      } else if (actionConfig?.nextStatus) {
        if (actionConfig.nextStatus === "arrived") {
          playDriverSound("arrive");
        } else {
          playDriverSound("click");
        }
        triggerHaptic(50);
        onStatusChange(delivery.uuid, actionConfig.nextStatus);
      }
    };

    const orderDisplay = formatOrderNumber(delivery.order_number, routeIndex);
    const isUrgent = delivery.priority_level === "urgent" || delivery.priority_level === "high";

    return (
      <div
        className={cn(
          "bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-2xs hover:shadow-xs flex flex-col justify-between",
          isNext ? "border-blue-300 bg-blue-50/20" : "border-slate-200"
        )}
      >
        <div>
          {/* Top Header: Stop Number + Order ID + Customer Name + Status */}
          <div className="flex items-start justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Route Index Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs",
                  isNext
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-100 border-slate-200 text-slate-800"
                )}
              >
                #{orderDisplay}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Stop {routeIndex}
                  </span>
                  {isUrgent && (
                    <span className="text-[9px] font-extrabold text-red-600 bg-red-100 px-1.5 py-0.2 rounded uppercase">
                      Urgent
                    </span>
                  )}
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

          {/* Address Row */}
          <div className="flex items-start gap-1.5 mb-2 text-xs text-slate-600 bg-slate-50/60 p-2 rounded-xl">
            <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed font-medium">
              {delivery.address}
            </p>
          </div>

          {/* Customer Instruction Preview if present */}
          {delivery.delivery_instructions && (
            <div className="flex items-center gap-1.5 mb-2.5 px-2 py-1 bg-amber-50/70 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 truncate font-medium">
              <KeyRound size={12} className="text-amber-600 flex-shrink-0" />
              <span className="truncate">{delivery.delivery_instructions}</span>
            </div>
          )}

          {/* Verification tags */}
          {(delivery.requires_photo || delivery.requires_signature) && (
            <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-semibold text-slate-500">
              {delivery.requires_photo && (
                <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                  <Camera size={10} /> Photo
                </span>
              )}
              {delivery.requires_signature && (
                <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                  <FileCheck2 size={10} /> Signature
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-1">
          {/* Quick Contact */}
          <button
            onClick={() => onOpenContact ? onOpenContact(delivery) : onCall(delivery)}
            disabled={loading}
            className="min-h-[40px] min-w-[40px] p-2 bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer border border-slate-200/60"
            title={delivery.customer_phone ? `Contact ${delivery.customer_phone}` : "No phone number"}
          >
            <Phone size={14} />
          </button>

          {/* Quick Navigate */}
          <button
            onClick={() => onNavigate(delivery)}
            disabled={loading}
            className="min-h-[40px] min-w-[40px] p-2 bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer border border-slate-200/60"
            title="Navigate to destination"
          >
            <Navigation size={14} className="text-blue-600" />
          </button>

          {/* Report Issue Exception (if active) */}
          {onReportIssue && delivery.delivery_status !== "delivered" && (
            <button
              onClick={() => onReportIssue(delivery)}
              disabled={loading}
              className="min-h-[40px] min-w-[40px] p-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl transition flex items-center justify-center cursor-pointer border border-red-200/70"
              title="Report delivery exception"
            >
              <AlertTriangle size={14} />
            </button>
          )}

          {/* Primary Action */}
          {delivery.delivery_status !== "delivered" ? (
            <button
              onClick={handleMainAction}
              disabled={loading}
              className={cn(
                "flex-1 min-h-[40px] px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]",
                delivery.delivery_status === "arrived"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
                loading && "opacity-75 pointer-events-none"
              )}
            >
              <span>{actionConfig.label}</span>
            </button>
          ) : (
            <div className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200/60">
              <CheckCircle2 size={14} className="text-emerald-600" />
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
