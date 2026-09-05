import React, { useState, memo } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Eye } from "lucide-react";
import { Delivery } from "./types";
import { formatOrderNumber, formatTime } from "./utils";


interface CompletedDeliveriesProps {
  deliveries: Delivery[];
  onViewProof?: (delivery: Delivery) => void;
}

const CompletedDeliveries: React.FC<CompletedDeliveriesProps> = memo(
  ({ deliveries, onViewProof }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (deliveries.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Toggle Button Header */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between text-left transition cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Completed Deliveries · {deliveries.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <span>{isExpanded ? "Hide" : "Show"}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Collapsible List */}
        {isExpanded && (
          <div className="divide-y divide-slate-100 p-2 space-y-1">
            {deliveries.map((delivery, idx) => {
              const orderDisplay = formatOrderNumber(delivery.order_number, idx + 1);

              return (
                <div
                  key={delivery.uuid}
                  className="p-2.5 rounded-xl hover:bg-slate-50/70 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>#{orderDisplay}</span>
                        <span>·</span>
                        <span className="truncate">{delivery.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={11} />
                          {formatTime(delivery.scheduled_time)}
                        </span>
                        <span className="truncate max-w-[160px] sm:max-w-[280px]">
                          {delivery.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {onViewProof && (
                    <button
                      onClick={() => onViewProof(delivery)}
                      className="min-h-[36px] px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer flex-shrink-0"
                      title="View Proof of Delivery"
                    >
                      <Eye size={12} />
                      <span className="hidden sm:inline">Proof</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

CompletedDeliveries.displayName = "CompletedDeliveries";

export default CompletedDeliveries;
