import React, {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
  Fragment,
} from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import {
  MapPin,
  Clock,
  FileCheck,
  MoreVertical,
  Edit,
  XCircle,
  Eye,
  Search,
  Plus,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import ProofModal from "../components/ProofModal";
import NewDeliveryModal from "../components/NewDeliveryModal";
import EditDeliveryModal from "../components/EditDeliveryModal";
import AssignDriverModal from "../components/AssignDriverModal";
import ReasonPromptModal from "../components/ReasonPromptModal";
import toast from "react-hot-toast";

// ==========================================
// Types & Configuration
// ==========================================

export interface DeliveryItem {
  id?: number;
  uuid: string;
  business_id?: number;
  order_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer_address?: string;
  driver_id?: number | string | null;
  driver_name?: string;
  delivery_status?: string;
  scheduled_time?: string | null;
  estimated_arrival?: string | null;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  delivery_notes?: string | null;
  requires_signature?: boolean;
  requires_photo?: boolean;
  priority_level?: string;
  route_optimization_data?: unknown;
  created_at?: string;
  updated_at?: string;
}

export interface DriverItem {
  id?: number;
  driver_id: number | string;
  first_name: string;
  last_name: string;
  status?: string;
}

export type PriorityLevel = "low" | "medium" | "high";

// Status definitions & badges
export const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  scheduled: {
    label: "Scheduled",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
  pending: {
    label: "Pending",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
  dispatched: {
    label: "Dispatched",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  en_route: {
    label: "Out for Delivery",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  arrived: {
    label: "Arrived",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Failed Attempt",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  disputed: {
    label: "Disputed Claim",
    bg: "bg-pink-50",
    text: "text-pink-700",
    dot: "bg-pink-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
};

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled: ["dispatched", "cancelled"],
  pending: ["dispatched", "cancelled"],
  dispatched: ["en_route", "failed", "cancelled"],
  en_route: ["arrived", "failed", "cancelled"],
  arrived: ["delivered", "failed", "cancelled"],
  delivered: ["disputed"],
  failed: ["scheduled", "cancelled"],
  disputed: ["delivered", "cancelled"],
  cancelled: [],
};

const SENSITIVE_STATUSES = new Set(["delivered", "disputed", "cancelled"]);

// ==========================================
// Helper Functions
// ==========================================

export function normalizeStatus(status?: string | null): string {
  if (!status) return "pending";
  const normalized = status.trim().toLowerCase();
  return statusConfig[normalized] ? normalized : "pending";
}

export function normalizePriority(priority?: string | null): PriorityLevel {
  if (!priority) return "medium";
  const p = priority.trim().toLowerCase();
  if (p === "high" || p === "urgent") return "high";
  if (p === "low") return "low";
  return "medium";
}

export function getLocalDateString(dateInput?: string | Date | null): string | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatScheduledDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "Not scheduled";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==========================================
// Portal Action Menu Component
// ==========================================

interface ActionMenuPortalProps {
  delivery: DeliveryItem;
  triggerRect: DOMRect;
  onClose: () => void;
  onAction: (action: string, delivery: DeliveryItem) => void;
  onStatusChangeRequest: (delivery: DeliveryItem, newStatus: string) => void;
}

const ActionMenuPortal: React.FC<ActionMenuPortalProps> = ({
  delivery,
  triggerRect,
  onClose,
  onAction,
  onStatusChangeRequest,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const currentStatus = normalizeStatus(delivery.delivery_status);
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const canEdit = !["delivered", "cancelled"].includes(currentStatus);
  const canCancel = !["delivered", "cancelled"].includes(currentStatus);

  useLayoutEffect(() => {
    const MENU_WIDTH = 192; // 12rem = 192px
    const menuEl = menuRef.current;
    const menuHeight = menuEl ? menuEl.offsetHeight : 240;

    let top = triggerRect.bottom + 4;
    let left = triggerRect.right - MENU_WIDTH;

    // Viewport overflow boundary handling:
    // If overflowing below bottom boundary, flip to above the trigger
    if (top + menuHeight > window.innerHeight && triggerRect.top - menuHeight > 0) {
      top = triggerRect.top - menuHeight - 4;
    }

    // Viewport horizontal boundaries:
    if (left < 8) {
      left = 8;
    } else if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    setCoords({ top, left });
  }, [triggerRect]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: coords ? `${coords.top}px` : "-9999px",
        left: coords ? `${coords.left}px` : "-9999px",
      }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label="Delivery action options"
      aria-orientation="vertical"
      className="w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 text-xs animate-in fade-in duration-100"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onAction("view", delivery);
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
      >
        <Eye size={13} className="text-slate-400" /> View Details
      </button>

      {canEdit && (
        <>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onAction("edit", delivery);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
          >
            <Edit size={13} className="text-slate-400" /> Edit Order
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onAction("assign", delivery);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
          >
            <Truck size={13} className="text-slate-400" /> Assign Driver
          </button>
        </>
      )}

      {currentStatus === "delivered" && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onAction("proof", delivery);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 font-medium cursor-pointer"
        >
          <FileCheck size={13} className="text-emerald-500" /> View Proof
        </button>
      )}

      {allowedNext.length > 0 && (
        <div className="border-t border-slate-100 my-1 pt-1">
          <span className="px-2 py-0.5 text-[9px] font-black uppercase text-slate-400 tracking-wider block">
            Change Status
          </span>
          {allowedNext.map((st) => (
            <button
              type="button"
              role="menuitem"
              key={st}
              onClick={() => {
                onClose();
                onStatusChangeRequest(delivery, st);
              }}
              className="w-full text-left px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              → {statusConfig[st]?.label || st}
            </button>
          ))}
        </div>
      )}

      {canCancel && (
        <div className="border-t border-slate-100 my-1 pt-1">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onAction("cancel", delivery);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-medium cursor-pointer"
          >
            <XCircle size={13} /> Cancel Order
          </button>
        </div>
      )}
    </div>,
    document.body
  );
};

// ==========================================
// Main Deliveries Component
// ==========================================

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals & Active selections
  const [selectedDeliveryForProof, setSelectedDeliveryForProof] = useState<DeliveryItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeDeliveryUuid, setActiveDeliveryUuid] = useState<string | null>(null);
  const [selectedDetailsUuid, setSelectedDetailsUuid] = useState<string | null>(null);

  // Portal Action Menu State
  const [activeMenu, setActiveMenu] = useState<{
    delivery: DeliveryItem;
    triggerRect: DOMRect;
  } | null>(null);

  // Reason Modal State
  const [reasonModalConfig, setReasonModalConfig] = useState<{
    isOpen: boolean;
    delivery: DeliveryItem;
    targetStatus: string;
    actionType: "status_change" | "cancel";
  } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination (10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // View Details Delivery derived from stable identifier
  const viewDetailsDelivery = useMemo(() => {
    if (!selectedDetailsUuid) return null;
    return deliveries.find((d) => d.uuid === selectedDetailsUuid) || null;
  }, [deliveries, selectedDetailsUuid]);

  // Handle Escape key for view details modal
  useEffect(() => {
    if (!selectedDetailsUuid) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDetailsUuid(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDetailsUuid]);

  // Data Fetching
  const fetchDeliveries = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [delRes, drvRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/auth/drivers").catch(() => ({ data: [] })),
      ]);
      setDeliveries(Array.isArray(delRes.data) ? delRes.data : []);
      setDrivers(Array.isArray(drvRes.data) ? drvRes.data : []);
    } catch (error: any) {
      console.error("Fetch deliveries failed", error);
      const msg = error.response?.data?.message || error.message || "Failed to load deliveries";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filter Reset Handlers
  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== "all" ||
    driverFilter !== "all" ||
    priorityFilter !== "all" ||
    dateFilter
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDriverFilter("all");
    setPriorityFilter("all");
    setDateFilter("");
    setCurrentPage(1);
  };

  // Filtered dataset
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return deliveries.filter((d) => {
      const matchesSearch =
        !q ||
        Boolean(
          (d.order_number && String(d.order_number).toLowerCase().includes(q)) ||
          (d.customer_name && String(d.customer_name).toLowerCase().includes(q)) ||
          (d.customer_address && String(d.customer_address).toLowerCase().includes(q)) ||
          (d.driver_name && String(d.driver_name).toLowerCase().includes(q)) ||
          (d.uuid && String(d.uuid).toLowerCase().includes(q))
        );

      const normStatus = normalizeStatus(d.delivery_status);
      const matchesStatus = statusFilter === "all" || normStatus === statusFilter;

      const matchesDriver =
        driverFilter === "all" ||
        (driverFilter === "unassigned"
          ? !d.driver_id
          : String(d.driver_id) === String(driverFilter));

      const normPriority = normalizePriority(d.priority_level);
      const matchesPriority =
        priorityFilter === "all" || normPriority === priorityFilter;

      const localDate = getLocalDateString(d.scheduled_time);
      const matchesDate = !dateFilter || localDate === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDriver &&
        matchesPriority &&
        matchesDate
      );
    });
  }, [deliveries, search, statusFilter, driverFilter, priorityFilter, dateFilter]);

  // Pagination calculation & clamping
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedDeliveries = useMemo(() => {
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, totalPages]);

  const startRecord = totalCount > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endRecord = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Status Change Execution
  const performStatusUpdate = async (
    deliveryUuid: string,
    newStatus: string,
    reasonText?: string
  ): Promise<void> => {
    try {
      const payload: { status: string; reason?: string } = { status: newStatus };
      if (reasonText && reasonText.trim()) {
        payload.reason = reasonText.trim();
      }
      await api.patch(`/deliveries/${deliveryUuid}/status`, payload);
      toast.success(`Order status updated to ${statusConfig[newStatus]?.label || newStatus}`);
      await fetchDeliveries();
    } catch (error: any) {
      console.error("Status update error", error);
      const msg = error.response?.data?.message || "Failed to update order status";
      toast.error(msg);
      throw error;
    }
  };

  // Status Change Request Handler (Enforces ALLOWED_STATUS_TRANSITIONS & Reason Modal)
  const handleStatusChangeRequest = (delivery: DeliveryItem, newStatus: string) => {
    setActiveMenu(null);
    const currentStatus = normalizeStatus(delivery.delivery_status);
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    // 1. Strict transition validation against client transition map
    if (!allowed.includes(newStatus)) {
      toast.error(
        `Transition from "${statusConfig[currentStatus]?.label || currentStatus}" to "${
          statusConfig[newStatus]?.label || newStatus
        }" is not permitted.`
      );
      return;
    }

    // 2. Sensitive statuses require reason prompt
    if (SENSITIVE_STATUSES.has(newStatus)) {
      setReasonModalConfig({
        isOpen: true,
        delivery,
        targetStatus: newStatus,
        actionType: newStatus === "cancelled" ? "cancel" : "status_change",
      });
      return;
    }

    // 3. Allowed standard transition
    performStatusUpdate(delivery.uuid, newStatus);
  };

  // Cancel Delivery Handler
  const handleCancelDelivery = (delivery: DeliveryItem) => {
    setActiveMenu(null);
    const currentStatus = normalizeStatus(delivery.delivery_status);
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes("cancelled")) {
      toast.error(
        `Cannot cancel Order #${delivery.order_number || delivery.uuid?.slice(0, 8)} in "${
          statusConfig[currentStatus]?.label || currentStatus
        }" state.`
      );
      return;
    }

    setReasonModalConfig({
      isOpen: true,
      delivery,
      targetStatus: "cancelled",
      actionType: "cancel",
    });
  };

  // Action Dispatcher
  const handleAction = (action: string, delivery: DeliveryItem) => {
    setActiveMenu(null);
    const currentStatus = normalizeStatus(delivery.delivery_status);

    switch (action) {
      case "view":
        setSelectedDetailsUuid(delivery.uuid);
        break;
      case "edit":
        if (["delivered", "cancelled"].includes(currentStatus)) {
          toast.error(
            `Cannot edit Order #${delivery.order_number || delivery.uuid?.slice(0, 8)} in "${
              statusConfig[currentStatus]?.label || currentStatus
            }" state.`
          );
          return;
        }
        setActiveDeliveryUuid(delivery.uuid);
        setShowEditModal(true);
        break;
      case "assign":
        if (["delivered", "cancelled"].includes(currentStatus)) {
          toast.error(
            `Cannot assign driver to Order #${
              delivery.order_number || delivery.uuid?.slice(0, 8)
            } in "${statusConfig[currentStatus]?.label || currentStatus}" state.`
          );
          return;
        }
        setActiveDeliveryUuid(delivery.uuid);
        setShowAssignModal(true);
        break;
      case "proof":
        setSelectedDeliveryForProof(delivery);
        break;
      case "cancel":
        handleCancelDelivery(delivery);
        break;
      default:
        break;
    }
  };

  // Submit Handler from ReasonPromptModal
  const handleReasonSubmit = async (reasonText: string) => {
    if (!reasonModalConfig) return;
    const { delivery, targetStatus } = reasonModalConfig;
    await performStatusUpdate(delivery.uuid, targetStatus, reasonText);
    setReasonModalConfig(null);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-full p-6 lg:p-8 space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Deliveries & Orders Command Center
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time dispatch management, status transitions, driver assignment & proofs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} /> New Delivery
          </button>
        </div>
      </div>

      {/* 2. Comprehensive Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Text Search (4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              aria-label="Search deliveries"
              placeholder="Search Order #, customer, driver, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Status Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter by delivery status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="dispatched">Dispatched</option>
              <option value="en_route">Out for Delivery</option>
              <option value="arrived">Arrived</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed Attempt</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Driver Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter by assigned driver"
              value={driverFilter}
              onChange={(e) => {
                setDriverFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Drivers</option>
              <option value="unassigned">Unassigned Only</option>
              {drivers.map((d) => (
                <option key={d.driver_id || d.id} value={d.driver_id || d.id}>
                  {d.first_name} {d.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High / Express</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Date Picker & Reset (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <input
              type="date"
              aria-label="Filter by scheduled date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white outline-none"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                title="Reset All Filters"
                aria-label="Reset all filters"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer & Destination</th>
                <th className="py-3.5 px-4">Assigned Driver</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Scheduled Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs font-semibold text-slate-500">
                        Loading delivery operations...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Failed to load delivery operations
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{fetchError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchDeliveries}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw size={13} /> Retry Loading
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck size={24} className="text-slate-300" />
                      <span className="text-xs font-medium">
                        No delivery orders found matching the filter criteria.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDeliveries.map((delivery) => {
                  const normStatus = normalizeStatus(delivery.delivery_status);
                  const statusInfo = statusConfig[normStatus] || statusConfig.pending;
                  const priority = normalizePriority(delivery.priority_level);
                  const isMenuOpen = activeMenu?.delivery.uuid === delivery.uuid;

                  return (
                    <tr
                      key={delivery.uuid || `delivery-${delivery.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{delivery.order_number || delivery.uuid?.slice(0, 8)}
                      </td>

                      {/* Customer & Address */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <p className="font-bold text-slate-900 truncate">
                          {delivery.customer_name || "Guest Customer"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span>{delivery.customer_address || "No address specified"}</span>
                        </p>
                      </td>

                      {/* Driver */}
                      <td className="py-3.5 px-4">
                        {delivery.driver_name ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                              {delivery.driver_name[0]}
                            </div>
                            <span>{delivery.driver_name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            priority === "high"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : priority === "low"
                              ? "bg-slate-100 text-slate-600 border border-slate-200/60"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {priority}
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>{formatScheduledDate(delivery.scheduled_time)}</span>
                        </div>
                      </td>

                      {/* Actions Trigger Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMenuOpen) {
                              setActiveMenu(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setActiveMenu({ delivery, triggerRect: rect });
                            }
                          }}
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          aria-label={`Actions for Order #${delivery.order_number || delivery.uuid?.slice(0, 8)}`}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isMenuOpen
                              ? "bg-slate-200 text-slate-800"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            {totalCount > 0 ? (
              <span>
                Showing <strong className="text-slate-800 font-bold">{startRecord}</strong>–
                <strong className="text-slate-800 font-bold">{endRecord}</strong> of{" "}
                <strong className="text-slate-800 font-bold">{totalCount}</strong> orders
              </span>
            ) : (
              <span>No orders found</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading || totalCount === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prevP = arr[idx - 1];
                  const showEllipsis = prevP && p - prevP > 1;
                  return (
                    <Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    </Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading || totalCount === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Portal Action Menu */}
      {activeMenu && (
        <ActionMenuPortal
          delivery={activeMenu.delivery}
          triggerRect={activeMenu.triggerRect}
          onClose={() => setActiveMenu(null)}
          onAction={handleAction}
          onStatusChangeRequest={handleStatusChangeRequest}
        />
      )}

      {/* View Details Modal */}
      {selectedDetailsUuid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedDetailsUuid(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-modal-title"
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {viewDetailsDelivery ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3
                      id="details-modal-title"
                      className="text-base font-extrabold text-slate-900"
                    >
                      Order #{viewDetailsDelivery.order_number || viewDetailsDelivery.uuid?.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-slate-400">UUID: {viewDetailsDelivery.uuid}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailsUuid(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    aria-label="Close dialog"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Customer & Drop-off
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {viewDetailsDelivery.customer_name || "Guest Customer"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {viewDetailsDelivery.customer_address || "No address specified"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Assigned Driver
                      </span>
                      <p className="font-bold text-slate-800">
                        {viewDetailsDelivery.driver_name || "Unassigned"}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Current Status
                      </span>
                      <p className="font-bold text-slate-800 uppercase">
                        {statusConfig[normalizeStatus(viewDetailsDelivery.delivery_status)]?.label ||
                          viewDetailsDelivery.delivery_status}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Priority Level
                      </span>
                      <p className="font-bold text-slate-800 uppercase">
                        {normalizePriority(viewDetailsDelivery.priority_level)}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Scheduled Time
                      </span>
                      <p className="font-semibold text-slate-700">
                        {formatScheduledDate(viewDetailsDelivery.scheduled_time)}
                      </p>
                    </div>
                  </div>

                  {viewDetailsDelivery.delivery_notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Delivery Instructions
                      </span>
                      <p className="text-slate-700 italic">
                        "{viewDetailsDelivery.delivery_notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailsUuid(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <p className="text-sm font-semibold">Delivery record not found.</p>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsUuid(null)}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Reason Prompt Modal for Sensitive Statuses & Cancellations */}
      {reasonModalConfig && (
        <ReasonPromptModal
          isOpen={reasonModalConfig.isOpen}
          onClose={() => setReasonModalConfig(null)}
          onSubmit={handleReasonSubmit}
          targetStatus={reasonModalConfig.targetStatus}
          orderNumber={
            reasonModalConfig.delivery.order_number ||
            reasonModalConfig.delivery.uuid?.slice(0, 8)
          }
          actionType={reasonModalConfig.actionType}
        />
      )}

      {/* Proof Modal */}
      {selectedDeliveryForProof && (
        <ProofModal
          delivery={selectedDeliveryForProof as any}
          isOpen={Boolean(selectedDeliveryForProof)}
          mode="view"
          onClose={() => setSelectedDeliveryForProof(null)}
        />
      )}

      {/* New Delivery Modal */}
      {showNewModal && (
        <NewDeliveryModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            fetchDeliveries();
            toast.success("Delivery scheduled successfully");
          }}
        />
      )}

      {/* Edit Delivery Modal */}
      {showEditModal && activeDeliveryUuid && (
        <EditDeliveryModal
          deliveryUuid={activeDeliveryUuid}
          onClose={() => {
            setShowEditModal(false);
            setActiveDeliveryUuid(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setActiveDeliveryUuid(null);
            fetchDeliveries();
            toast.success("Delivery updated");
          }}
        />
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && activeDeliveryUuid && (
        <AssignDriverModal
          deliveryUuid={activeDeliveryUuid}
          onClose={() => {
            setShowAssignModal(false);
            setActiveDeliveryUuid(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setActiveDeliveryUuid(null);
            fetchDeliveries();
            toast.success("Driver assigned");
          }}
        />
      )}
    </div>
  );
};

export default Deliveries;
