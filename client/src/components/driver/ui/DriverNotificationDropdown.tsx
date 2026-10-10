import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Truck,
  PackageCheck,
  Clock,
  X,
  Check,
  FileText,
  ChevronRight,
  Flame,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Delivery } from "../types";
import { calculateSLAStatus } from "../utils";

export interface DriverNotificationItem {
  id: string;
  orderNumber: string;
  title: string;
  message: string;
  timestamp: string;
  type: "urgent" | "in_transit" | "sla" | "instruction" | "delivered" | "exception";
  statusTag: string;
  delivery: Delivery;
  actionType: "route" | "proof" | "issue" | "history";
  actionLabel: string;
}

interface DriverNotificationDropdownProps {
  deliveries: Delivery[];
  onSelectDelivery: (delivery: Delivery) => void;
  onOpenProofModal?: (delivery: Delivery, mode?: "upload" | "view") => void;
  onOpenIssueModal?: (delivery: Delivery) => void;
  onNavigateTab?: (tab: "route" | "history" | "earnings" | "profile") => void;
}

const formatRelativeTime = (timestamp?: string): string => {
  if (!timestamp) return "Today";
  try {
    const now = new Date();
    const past = new Date(timestamp);
    if (isNaN(past.getTime())) return "Today";

    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Today";
  }
};

export const DriverNotificationDropdown: React.FC<DriverNotificationDropdownProps> = ({
  deliveries = [],
  onSelectDelivery,
  onOpenProofModal,
  onOpenIssueModal,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("driver_read_notifications");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate driver-specific real notifications from assigned route stops
  const notifications: DriverNotificationItem[] = useMemo(() => {
    if (!Array.isArray(deliveries) || deliveries.length === 0) return [];

    const items: DriverNotificationItem[] = [];

    deliveries.forEach((d) => {
      const orderNum = d.order_number || (d.uuid ? d.uuid.slice(0, 8).toUpperCase() : "ORD-REQ");
      const sla = calculateSLAStatus(d.scheduled_time);

      // 1. In-transit Stop
      if (d.delivery_status === "in_transit") {
        items.push({
          id: `transit-${d.uuid}`,
          orderNumber: orderNum,
          title: `Current Destination: #${orderNum}`,
          message: `En route to ${d.address}. Customer: ${d.customer_name}. Tap to open navigation.`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "in_transit",
          statusTag: "In Transit",
          delivery: d,
          actionType: "route",
          actionLabel: "Open Route Navigation",
        });
      }

      // 2. Urgent / High Priority Stops (not delivered)
      if (
        (d.priority_level === "urgent" || d.priority_level === "high") &&
        d.delivery_status !== "delivered" &&
        d.delivery_status !== "failed"
      ) {
        items.push({
          id: `priority-${d.uuid}`,
          orderNumber: orderNum,
          title: `Priority Stop: #${orderNum}`,
          message: `${d.priority_level?.toUpperCase()} priority delivery for ${d.customer_name}. Deliver before SLA expires.`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "urgent",
          statusTag: `${d.priority_level?.toUpperCase() || "HIGH"} PRIORITY`,
          delivery: d,
          actionType: "route",
          actionLabel: "Prioritize Stop",
        });
      }

      // 3. SLA Alert (at-risk or late)
      if (
        (sla.status === "late" || sla.status === "at-risk") &&
        d.delivery_status !== "delivered" &&
        d.delivery_status !== "failed"
      ) {
        items.push({
          id: `sla-${d.uuid}`,
          orderNumber: orderNum,
          title: `SLA Alert: #${orderNum}`,
          message: `Delivery window is ${sla.status === "late" ? "overdue" : "approaching limit"} (${Math.abs(sla.minutesRemaining)}m). Immediate drop-off recommended.`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "sla",
          statusTag: sla.status === "late" ? "SLA Overdue" : "SLA At Risk",
          delivery: d,
          actionType: "route",
          actionLabel: "Jump to Stop",
        });
      }

      // 4. Customer Delivery Note / Gate Code
      if (
        d.delivery_instructions &&
        d.delivery_status !== "delivered" &&
        d.delivery_status !== "failed"
      ) {
        items.push({
          id: `note-${d.uuid}`,
          orderNumber: orderNum,
          title: `Customer Note: #${orderNum}`,
          message: `"${d.delivery_instructions}". Stop: ${d.customer_name}.`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "instruction",
          statusTag: "Special Note",
          delivery: d,
          actionType: "route",
          actionLabel: "View Instructions",
        });
      }

      // 5. Delivered Stop
      if (d.delivery_status === "delivered") {
        items.push({
          id: `delivered-${d.uuid}`,
          orderNumber: orderNum,
          title: `Delivered: #${orderNum}`,
          message: `Safely dropped off for ${d.customer_name}. Proof recorded (+₹${d.earnings || 50}).`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "delivered",
          statusTag: "Verified",
          delivery: d,
          actionType: "proof",
          actionLabel: "Review Proof",
        });
      }

      // 6. Exception / Failed
      if (d.delivery_status === "failed" || d.delivery_status === "disputed") {
        items.push({
          id: `issue-${d.uuid}`,
          orderNumber: orderNum,
          title: `Exception: #${orderNum}`,
          message: `Issue reported for ${d.address}. Exception recorded in shift logs.`,
          timestamp: d.scheduled_time || new Date().toISOString(),
          type: "exception",
          statusTag: "Exception",
          delivery: d,
          actionType: "issue",
          actionLabel: "View Details",
        });
      }
    });

    return items.slice(0, 15);
  }, [deliveries]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.has(n.id)).length;
  }, [notifications, readIds]);

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem("driver_read_notifications", JSON.stringify(Array.from(allIds)));
    } catch {
      // ignore
    }
  };

  const handleItemClick = (item: DriverNotificationItem) => {
    const next = new Set(readIds);
    next.add(item.id);
    setReadIds(next);
    try {
      localStorage.setItem("driver_read_notifications", JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }

    setIsOpen(false);

    // Deep Redirection based on actual stop type
    if (item.actionType === "proof" && onOpenProofModal) {
      onOpenProofModal(item.delivery, "view");
    } else if (item.actionType === "issue" && onOpenIssueModal) {
      onOpenIssueModal(item.delivery);
    } else {
      if (onNavigateTab) {
        onNavigateTab("route");
      }
      onSelectDelivery(item.delivery);
    }
  };

  const getBadgeStyling = (type: DriverNotificationItem["type"]) => {
    switch (type) {
      case "urgent":
        return {
          icon: <Flame size={16} className="text-rose-600" />,
          boxBg: "bg-rose-50 border-rose-200/80",
          tagBg: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "in_transit":
        return {
          icon: <Truck size={16} className="text-blue-600" />,
          boxBg: "bg-blue-50 border-blue-200/80",
          tagBg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "sla":
        return {
          icon: <Clock size={16} className="text-amber-600" />,
          boxBg: "bg-amber-50 border-amber-200/80",
          tagBg: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "instruction":
        return {
          icon: <FileText size={16} className="text-purple-600" />,
          boxBg: "bg-purple-50 border-purple-200/80",
          tagBg: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "delivered":
        return {
          icon: <CheckCircle2 size={16} className="text-emerald-600" />,
          boxBg: "bg-emerald-50 border-emerald-200/80",
          tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          icon: <AlertCircle size={16} className="text-red-600" />,
          boxBg: "bg-red-50 border-red-200/80",
          tagBg: "bg-red-50 text-red-700 border-red-200",
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Driver notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group shadow-2xs"
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            unreadCount > 0 ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-800"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4.5 min-w-4.5 px-1 bg-indigo-600 border-2 border-white text-[9px] font-extrabold items-center justify-center text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-[370px] xs:w-[420px] sm:w-[460px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xs gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/90 shadow-2xs shrink-0">
                  <Bell size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-none truncate">
                      Dispatch Alerts
                    </h3>
                    {unreadCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap shrink-0">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap shrink-0">
                        All caught up
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px] xs:max-w-[240px]">
                    Stops, SLA deadlines, & instructions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/80 border border-slate-200/90 hover:border-indigo-200 rounded-xl shadow-2xs transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
                    title="Mark all as read"
                  >
                    <Check size={12} className="text-indigo-600" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                  title="Close notifications"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 p-2 space-y-1">
              {notifications.length > 0 ? (
                notifications.map((item) => {
                  const style = getBadgeStyling(item.type);
                  const isUnread = !readIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`group p-3 rounded-2xl hover:bg-slate-50 border transition-all cursor-pointer flex items-start gap-3 relative ${
                        isUnread
                          ? "bg-indigo-50/20 border-indigo-100/60 shadow-2xs"
                          : "border-transparent"
                      }`}
                    >
                      {isUnread && (
                        <span className="absolute top-3.5 left-1 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}

                      <div
                        className={`w-9 h-9 rounded-xl ${style.boxBg} border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ml-1`}
                      >
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                            <Clock size={10} className="text-slate-300" />
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${style.tagBg}`}
                          >
                            {item.statusTag}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 transition-colors">
                            <span>{item.actionLabel}</span>
                            <ChevronRight
                              size={12}
                              className="group-hover:translate-x-0.5 transition-transform"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                    <PackageCheck size={22} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Route clear!</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                    No urgent dispatch alerts or issues for your current shift.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {onNavigateTab && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateTab("route");
                  }}
                  className="flex-1 py-2 px-3 text-center text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  View Route Stops
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateTab("history");
                  }}
                  className="flex-1 py-2 px-3 text-center text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Completed Deliveries
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverNotificationDropdown;
