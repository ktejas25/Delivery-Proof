import React, { useState, useMemo, memo } from "react";
import {
  Search,
  Eye,
  Clock,
  MapPin,
  History,
  Package,
} from "lucide-react";


import { Delivery } from "../types";
import StatusBadge from "../ui/StatusBadge";
import { formatOrderNumber, formatTime } from "../utils";
import { cn } from "../utils";

interface DriverHistoryViewProps {
  deliveries: Delivery[];
  onViewProof: (delivery: Delivery) => void;
}

type FilterStatus = "all" | "delivered" | "failed" | "disputed";

const DriverHistoryView: React.FC<DriverHistoryViewProps> = memo(
  ({ deliveries, onViewProof }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");

    // Consider deliveries with completed/terminal status for history
    const historyDeliveries = useMemo(() => {
      return deliveries.filter(
        (d) =>
          d.delivery_status === "delivered" ||
          d.delivery_status === "failed" ||
          d.delivery_status === "disputed"
      );
    }, [deliveries]);

    // Filter by search query and status tab
    const filteredDeliveries = useMemo(() => {
      return historyDeliveries.filter((d) => {
        const matchesStatus =
          selectedStatus === "all" || d.delivery_status === selectedStatus;

        if (!matchesStatus) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.customer_name?.toLowerCase().includes(q) ||
          d.address?.toLowerCase().includes(q) ||
          d.order_number?.toLowerCase().includes(q) ||
          d.uuid.toLowerCase().includes(q)
        );
      });
    }, [historyDeliveries, selectedStatus, searchQuery]);

    // Summary counts
    const deliveredCount = historyDeliveries.filter(
      (d) => d.delivery_status === "delivered"
    ).length;
    const failedCount = historyDeliveries.filter(
      (d) => d.delivery_status === "failed"
    ).length;
    const disputedCount = historyDeliveries.filter(
      (d) => d.delivery_status === "disputed"
    ).length;

    return (
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <History size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Delivery History
                </h2>
                <p className="text-xs text-slate-500">
                  Record of all completed and finalized drops
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {historyDeliveries.length} Total Logs
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 block">
                Delivered
              </span>
              <span className="text-base font-bold text-emerald-800">
                {deliveredCount}
              </span>
            </div>
            <div className="bg-red-50 rounded-xl p-2 border border-red-100">
              <span className="text-[11px] font-semibold text-red-700 block">
                Failed
              </span>
              <span className="text-base font-bold text-red-800">
                {failedCount}
              </span>
            </div>
            <div className="bg-amber-50 rounded-xl p-2 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-700 block">
                Disputed
              </span>
              <span className="text-base font-bold text-amber-800">
                {disputedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by order, customer, address..."
              aria-label="Search delivery history"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="min-h-[44px] min-w-[44px] absolute right-0 top-0 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: `All (${historyDeliveries.length})` },
              { id: "delivered", label: `Delivered (${deliveredCount})` },
              { id: "failed", label: `Failed (${failedCount})` },
              { id: "disputed", label: `Disputed (${disputedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as FilterStatus)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer",
                  selectedStatus === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length > 0 ? (
          <div className="space-y-2.5">
            {filteredDeliveries.map((delivery, idx) => {
              const orderDisplay = formatOrderNumber(delivery.order_number, idx + 1);

              return (
                <div
                  key={delivery.uuid}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-2.5"
                >
                  {/* Card Header: Order #, Customer Name, Status Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        #{orderDisplay}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {delivery.customer_name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-medium">
                          <Clock size={12} />
                          <span>{formatTime(delivery.scheduled_time)}</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={delivery.delivery_status} size="sm" showIcon />
                  </div>

                  {/* Destination Address */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50/70 p-2 rounded-xl">
                    <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed font-medium">
                      {delivery.address}
                    </p>
                  </div>

                  {/* Footer & Proof Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-semibold">
                      Payout:{" "}
                      <strong className="text-emerald-700 font-bold">
                        +${(delivery.earnings || 50).toFixed(2)}
                      </strong>
                    </span>

                    <button
                      onClick={() => onViewProof(delivery)}
                      className="min-h-[40px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Proof</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Package size={32} className="mx-auto text-slate-300 mb-1" />
            <p className="font-bold text-slate-700 text-sm">
              No delivery records found
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? "Try searching with different keywords"
                : "Deliveries will appear here after they are finalized."}
            </p>
          </div>
        )}
      </div>
    );
  }
);

DriverHistoryView.displayName = "DriverHistoryView";

export default DriverHistoryView;
