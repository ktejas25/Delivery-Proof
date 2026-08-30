import React, { useEffect, useState } from "react";
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
  X
} from "lucide-react";
import ProofModal from "../components/ProofModal";
import NewDeliveryModal from "../components/NewDeliveryModal";
import EditDeliveryModal from "../components/EditDeliveryModal";
import AssignDriverModal from "../components/AssignDriverModal";
import toast from "react-hot-toast";

// Status definitions & badges
const statusConfig: Record<
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

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
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

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [selectedDeliveryForProof, setSelectedDeliveryForProof] = useState<any | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [viewDetailsDelivery, setViewDetailsDelivery] = useState<any | null>(null);
  const [activeDeliveryUuid, setActiveDeliveryUuid] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination (10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchDeliveries = async () => {
    try {
      const [delRes, drvRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/auth/drivers").catch(() => ({ data: [] }))
      ]);
      setDeliveries(delRes.data);
      setDrivers(drvRes.data);
    } catch (error) {
      console.error("Fetch deliveries failed", error);
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStatusChange = async (deliveryUuid: string, newStatus: string) => {
    setActionMenuOpen(null);
    try {
      await api.patch(`/deliveries/${deliveryUuid}/status`, { status: newStatus });
      toast.success(`Order status updated to ${statusConfig[newStatus]?.label || newStatus}`);
      fetchDeliveries();
    } catch (error: any) {
      console.error("Status update error", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  const handleCancelDelivery = async (delivery: any) => {
    setActionMenuOpen(null);
    if (["delivered", "cancelled"].includes(delivery.delivery_status)) {
      toast.error(`Cannot cancel order #${delivery.order_number} as it is already ${delivery.delivery_status}.`);
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${delivery.order_number}? This action will halt dispatching.`
    );
    if (confirmed) {
      try {
        await api.patch(`/deliveries/${delivery.uuid}/status`, { status: "cancelled" });
        toast.success(`Order #${delivery.order_number} has been cancelled.`);
        fetchDeliveries();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const handleAction = (action: string, delivery: any) => {
    setActionMenuOpen(null);
    switch (action) {
      case "view":
        setViewDetailsDelivery(delivery);
        break;
      case "edit":
        if (["delivered", "cancelled"].includes(delivery.delivery_status)) {
          toast.error(`Cannot edit order #${delivery.order_number} in ${delivery.delivery_status} state.`);
          return;
        }
        setActiveDeliveryUuid(delivery.uuid);
        setShowEditModal(true);
        break;
      case "assign":
        if (["delivered", "cancelled"].includes(delivery.delivery_status)) {
          toast.error(`Cannot assign driver to order #${delivery.order_number} in ${delivery.delivery_status} state.`);
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

  const hasActiveFilters = search || statusFilter !== "all" || driverFilter !== "all" || priorityFilter !== "all" || dateFilter;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDriverFilter("all");
    setPriorityFilter("all");
    setDateFilter("");
    setCurrentPage(1);
  };

  // Filtered dataset
  const filtered = deliveries.filter((d) => {
    const matchesSearch =
      !search ||
      d.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      d.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.customer_address?.toLowerCase().includes(search.toLowerCase()) ||
      d.driver_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || d.delivery_status === statusFilter;

    const matchesDriver =
      driverFilter === "all" ||
      (driverFilter === "unassigned" ? !d.driver_id : String(d.driver_id) === String(driverFilter));

    const matchesPriority = priorityFilter === "all" || (d.priority_level || "medium") === priorityFilter;

    const matchesDate =
      !dateFilter ||
      (d.scheduled_time && d.scheduled_time.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesDriver && matchesPriority && matchesDate;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedDeliveries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const startRecord = filtered.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endRecord = Math.min(currentPage * PAGE_SIZE, filtered.length);

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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
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
                <option key={d.driver_id} value={d.driver_id}>
                  {d.first_name} {d.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
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
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white outline-none"
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                title="Reset All Filters"
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
                    Loading delivery operations...
                  </td>
                </tr>
              ) : paginatedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No delivery orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDeliveries.map((delivery) => {
                  const statusInfo = statusConfig[delivery.delivery_status] || statusConfig.scheduled;
                  const allowedNext = ALLOWED_STATUS_TRANSITIONS[delivery.delivery_status] || [];
                  const canEdit = !["delivered", "cancelled"].includes(delivery.delivery_status);
                  const canCancel = !["delivered", "cancelled"].includes(delivery.delivery_status);
                  const isMenuOpen = actionMenuOpen === delivery.uuid;

                  return (
                    <tr
                      key={delivery.uuid}
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

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            delivery.priority_level === "high"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : delivery.priority_level === "low"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {delivery.priority_level || "Medium"}
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>
                            {delivery.scheduled_time
                              ? new Date(delivery.scheduled_time).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not scheduled"}
                          </span>
                        </div>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(isMenuOpen ? null : delivery.uuid);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Dropdown Flyout */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-40 text-xs animate-in fade-in slide-in-from-top-1"
                            >
                              <button
                                onClick={() => handleAction("view", delivery)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                              >
                                <Eye size={13} className="text-slate-400" /> View Details
                              </button>

                              {canEdit && (
                                <>
                                  <button
                                    onClick={() => handleAction("edit", delivery)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                  >
                                    <Edit size={13} className="text-slate-400" /> Edit Order
                                  </button>
                                  <button
                                    onClick={() => handleAction("assign", delivery)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                  >
                                    <Truck size={13} className="text-slate-400" /> Assign Driver
                                  </button>
                                </>
                              )}

                              {delivery.delivery_status === "delivered" && (
                                <button
                                  onClick={() => handleAction("proof", delivery)}
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
                                      key={st}
                                      onClick={() => handleStatusChange(delivery.uuid, st)}
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
                                    onClick={() => handleAction("cancel", delivery)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                                  >
                                    <XCircle size={13} /> Cancel Order
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
            {filtered.length > 0 ? (
              <span>
                Showing <strong className="text-slate-800 font-bold">{startRecord}</strong>–<strong className="text-slate-800 font-bold">{endRecord}</strong> of <strong className="text-slate-800 font-bold">{filtered.length}</strong> orders
              </span>
            ) : (
              <span>No orders</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
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
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewDetailsDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Order #{viewDetailsDelivery.order_number}
                </h3>
                <p className="text-xs text-slate-400">UUID: {viewDetailsDelivery.uuid}</p>
              </div>
              <button
                onClick={() => setViewDetailsDelivery(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Customer & Drop-off
                </span>
                <p className="font-bold text-slate-800 text-sm">{viewDetailsDelivery.customer_name}</p>
                <p className="text-slate-600 mt-0.5">{viewDetailsDelivery.customer_address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Driver
                  </span>
                  <p className="font-bold text-slate-800">{viewDetailsDelivery.driver_name || "Unassigned"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Current Status
                  </span>
                  <p className="font-bold text-slate-800 uppercase">{viewDetailsDelivery.delivery_status}</p>
                </div>
              </div>

              {viewDetailsDelivery.delivery_notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Delivery Instructions
                  </span>
                  <p className="text-slate-700 italic">"{viewDetailsDelivery.delivery_notes}"</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewDetailsDelivery(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedDeliveryForProof && (
        <ProofModal
          delivery={selectedDeliveryForProof}
          isOpen={!!selectedDeliveryForProof}
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
