import React, { useMemo, useState } from "react";
import {
  Phone,
  Navigation,
  MapPin,
  ExternalLink,
  Clock,
  AlertCircle,
  Package,
  CheckCircle2,
  Play,
  ClipboardCheck,
  KeyRound,
  FileCheck2,
  Camera,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Delivery } from "./types";
import StatusBadge from "./ui/StatusBadge";
import {
  calculateSLAStatus,
  formatTime,
  formatOrderNumber,
  formatDuration,
  playDriverSound,
  triggerHaptic,
  cn,
} from "./utils";
import { ACTION_BUTTON_CONFIG } from "./config";
import toast from "react-hot-toast";

interface NextDeliveryCardProps {
  delivery: Delivery;
  routeIndex?: number;
  onStatusChange: (uuid: string, status: Delivery["delivery_status"]) => void;
  onCall: (delivery: Delivery) => void;
  onNavigate: (delivery: Delivery) => void;
  onProofRequired: (uuid: string) => void;
  onReportIssue?: (delivery: Delivery) => void;
  onOpenContact?: (delivery: Delivery) => void;
  loading?: boolean;
}

const NextDeliveryCard: React.FC<NextDeliveryCardProps> = React.memo(
  ({
    delivery,
    routeIndex = 1,
    onStatusChange,
    onCall,
    onNavigate,
    onProofRequired,
    onReportIssue,
    onOpenContact,
    loading = false,
  }) => {
    const [copiedInstructions, setCopiedInstructions] = useState(false);

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

    const handleCopyInstructions = () => {
      if (delivery.delivery_instructions) {
        navigator.clipboard.writeText(delivery.delivery_instructions);
        setCopiedInstructions(true);
        toast.success("Instructions copied to clipboard");
        setTimeout(() => setCopiedInstructions(false), 2000);
      }
    };

    const isLate = slaStatus.status === "late";
    const isAtRisk = slaStatus.status === "at-risk";
    const orderDisplay = formatOrderNumber(delivery.order_number, routeIndex);
    const isUrgent = delivery.priority_level === "urgent" || delivery.priority_level === "high";

    // Primary button icon & styling depending on delivery status
    const getPrimaryActionDetails = () => {
      switch (delivery.delivery_status) {
        case "pending":
          return {
            label: "START DELIVERY",
            icon: Play,
            bgClass:
              "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-600/20",
          };
        case "in_transit":
          return {
            label: "MARK ARRIVED",
            icon: MapPin,
            bgClass:
              "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-md shadow-amber-500/20",
          };
        case "arrived":
          return {
            label: "COMPLETE DELIVERY & PROOF",
            icon: ClipboardCheck,
            bgClass:
              "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20",
          };
        default:
          return {
            label: "DELIVERY COMPLETED",
            icon: CheckCircle2,
            bgClass: "bg-slate-100 text-slate-400 cursor-not-allowed",
          };
      }
    };

    const primaryAction = getPrimaryActionDetails();
    const ActionIcon = primaryAction.icon;

    return (
      <div
        className={cn(
          "bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm",
          isLate ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
        )}
      >
        {/* Header: Stop #, Customer Name, Scheduled Time, Status Badge */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                #{orderDisplay}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    Next Delivery · Stop {routeIndex}
                  </span>
                  {isUrgent && (
                    <span className="bg-red-100 text-red-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Urgent Priority
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate leading-snug">
                  {delivery.customer_name}
                </h3>
              </div>
            </div>

            <StatusBadge status={delivery.delivery_status} size="md" showIcon />
          </div>

          {/* Time & Item/Earnings Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock size={13} className="text-slate-400" />
              <span>Target: {formatTime(delivery.scheduled_time)}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {delivery.requires_photo && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Camera size={11} className="text-slate-500" />
                  Photo
                </span>
              )}
              {delivery.requires_signature && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <FileCheck2 size={11} className="text-slate-500" />
                  Signature
                </span>
              )}
              {delivery.items_count && (
                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                  <Package size={12} className="text-slate-400" />
                  {delivery.items_count} {delivery.items_count === 1 ? "pkg" : "pkgs"}
                </span>
              )}
              {delivery.earnings && (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  +${delivery.earnings.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Destination Address */}
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100 flex items-start gap-2.5">
          <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed">
            {delivery.address}
          </p>
        </div>

        {/* Customer Delivery Instructions & Gate Code Banner */}
        {delivery.delivery_instructions && (
          <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 min-w-0">
              <KeyRound size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-amber-900 text-[11px] block">
                  Delivery Notes / Gate Code:
                </span>
                <p className="text-amber-800 font-medium truncate">
                  {delivery.delivery_instructions}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyInstructions}
              className="flex-shrink-0 p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg transition cursor-pointer"
              title="Copy instructions"
            >
              {copiedInstructions ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Compact Map Preview */}
        <div className="relative h-[180px] sm:h-[220px] bg-slate-100 overflow-hidden group">
          <iframe
            title={`map-${delivery.uuid}`}
            width="100%"
            height="100%"
            frameBorder="0"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(delivery.address)}&z=15&output=embed`}
            className="w-full h-full border-0"
          />

          {/* Floating Navigate overlay button on map */}
          <button
            onClick={() => onNavigate(delivery)}
            aria-label="Open in Navigation App"
            className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
          >
            <Navigation size={13} className="text-blue-600" />
            <span>Open Maps</span>
            <ExternalLink size={11} className="text-slate-400" />
          </button>
        </div>

        {/* Actions & SLA Section */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* SLA Overdue / Warning Banner */}
          {isLate && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
              <span>🔴 {formatDuration(slaStatus.minutesRemaining)} overdue</span>
            </div>
          )}

          {isAtRisk && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2">
              <Clock size={15} className="text-amber-600 flex-shrink-0" />
              <span>🟡 {formatDuration(slaStatus.minutesRemaining)} remaining until scheduled window</span>
            </div>
          )}

          {/* Secondary Actions Row: Call/SMS, Navigate, and Report Issue */}
          <div className="grid grid-cols-12 gap-2">
            {/* Contact / SMS Button */}
            <button
              onClick={() => onOpenContact ? onOpenContact(delivery) : onCall(delivery)}
              disabled={loading}
              className="col-span-5 min-h-[44px] bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 transition font-bold text-xs sm:text-sm cursor-pointer border border-slate-200/60"
            >
              <Phone size={15} className="text-slate-600" />
              <span>{delivery.customer_phone ? "Contact" : "No Phone"}</span>
            </button>

            {/* Navigate */}
            <button
              onClick={() => onNavigate(delivery)}
              disabled={loading}
              className="col-span-4 min-h-[44px] bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition font-bold text-xs sm:text-sm cursor-pointer border border-slate-200/60"
            >
              <Navigation size={15} className="text-blue-600" />
              <span>Navigate</span>
            </button>

            {/* Report Issue (Exception) */}
            {onReportIssue && (
              <button
                onClick={() => onReportIssue(delivery)}
                disabled={loading}
                title="Report Delivery Issue / Non-delivery"
                className="col-span-3 min-h-[44px] bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center gap-1 transition font-bold text-xs cursor-pointer border border-red-200/80"
              >
                <AlertTriangle size={14} />
                <span className="hidden sm:inline">Issue</span>
              </button>
            )}
          </div>

          {/* PRIMARY DOMINANT ACTION BUTTON */}
          <button
            onClick={handleMainAction}
            disabled={loading || delivery.delivery_status === "delivered"}
            className={cn(
              "w-full min-h-[48px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all cursor-pointer outline-none active:scale-[0.99]",
              primaryAction.bgClass,
              loading && "opacity-75 pointer-events-none"
            )}
          >
            <ActionIcon size={18} />
            <span>{primaryAction.label}</span>
          </button>
        </div>
      </div>
    );
  }
);

NextDeliveryCard.displayName = "NextDeliveryCard";

export default NextDeliveryCard;
