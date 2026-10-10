import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  Plus,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Star,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  FileText,
  ArrowRight,
  AlertTriangle,
  Menu,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import io from "socket.io-client";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

import CustomerSidebar, { CustomerTabId } from "../components/customer/CustomerSidebar";
import NotificationBell from "../components/customer/NotificationBell";
import CustomerKpiGrid from "../components/customer/CustomerKpiGrid";
import CustomerQuickActionsToolbar from "../components/customer/CustomerQuickActionsToolbar";
import CustomerAIInsights from "../components/customer/CustomerAIInsights";
import CustomerDeliveryChart from "../components/customer/CustomerDeliveryChart";
import CustomerLiveMapTracker from "../components/customer/CustomerLiveMapTracker";
import CustomerRecentActivityFeed from "../components/customer/CustomerRecentActivityFeed";

// Modals & UI Components
import DeliveryCard from "../components/customer/DeliveryCard";
import RatingModal from "../components/customer/RatingModal";
import DisputeModal from "../components/customer/DisputeModal";
import OrderDetailsModal from "../components/customer/OrderDetailsModal";
import AddressCard from "../components/customer/AddressCard";
import AddressModal from "../components/customer/AddressModal";
import StatusBadge, { DeliveryStatus } from "../components/ui/StatusBadge";
import { SkeletonList } from "../components/ui/SkeletonCard";
import DashboardEmptyState from "../components/ui/DashboardEmptyState";
import AppRefreshOverlay from "../components/ui/AppRefreshOverlay";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<CustomerTabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delivery instructions preference
  const [deliveryInstruction, setDeliveryInstruction] = useState(() => {
    return localStorage.getItem("customer_pref_instructions") || "Leave package at front door";
  });
  const [savedInstructionSuccess, setSavedInstructionSuccess] = useState(false);

  // Modals status
  const [ratingDelivery, setRatingDelivery] = useState<any | null>(null);
  const [disputeDelivery, setDisputeDelivery] = useState<any | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedRadarUuid, setSelectedRadarUuid] = useState<string | null>(null);

  const handleViewOnRadar = useCallback((deliveryOrUuid?: any) => {
    if (typeof deliveryOrUuid === "string") {
      setSelectedRadarUuid(deliveryOrUuid);
    } else if (deliveryOrUuid?.uuid) {
      setSelectedRadarUuid(deliveryOrUuid.uuid);
    }
    setActiveTab("radar");
  }, []);

  // History Tab Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = useCallback(async (isLocal = false) => {
    if (isLocal) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [delRes, addrRes] = await Promise.all([
        api.get("/customer/deliveries"),
        api.get("/customer/addresses"),
      ]);
      setDeliveries(Array.isArray(delRes.data) ? delRes.data : []);
      setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
      toast.error("Failed to load dashboard data. Retrying...");
      setTimeout(() => fetchData(false), 4000);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh data every 25 seconds for live status sync
    const interval = setInterval(fetchData, 25000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Socket.IO Real-time Synchronization
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://localhost:5000" : undefined);
    const socket = socketUrl ? io(socketUrl) : io();

    socket.on("location_updated", () => {
      fetchData();
    });

    socket.on("driver_location_updated", () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchData]);

  // Derived Data
  const getStatusKey = useCallback((d: any) => {
    if (!d) return "pending";
    const statusStr = (d.status || d.delivery_status || "").toString();
    return statusStr.toLowerCase().replace(/[\s-]/g, "_");
  }, []);

  const activeDeliveries = useMemo(() => {
    if (!Array.isArray(deliveries)) return [];
    return deliveries
      .filter((d) => {
        const status = getStatusKey(d);
        return ["pending", "scheduled", "dispatched", "en_route", "arrived"].includes(status);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deliveries, getStatusKey]);

  const pastDeliveriesList = useMemo(() => {
    if (!Array.isArray(deliveries)) return [];
    let filtered = deliveries.filter((d) => {
      const status = getStatusKey(d);
      return ["delivered", "cancelled", "failed", "disputed"].includes(status);
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.order_number?.toLowerCase().includes(query) ||
          d.driver_name?.toLowerCase().includes(query) ||
          d.delivery_address?.toLowerCase().includes(query) ||
          d.address?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => getStatusKey(d) === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deliveries, searchQuery, statusFilter, getStatusKey]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pastDeliveriesList.slice(start, start + itemsPerPage);
  }, [pastDeliveriesList, currentPage]);

  const totalPages = Math.ceil(pastDeliveriesList.length / itemsPerPage);

  // Statistics calculation for KPI cards
  const stats = useMemo(() => {
    const totalOrders = deliveries.length;
    const activeOrders = activeDeliveries.length;
    const deliveredOrders = deliveries.filter(
      (d) => getStatusKey(d) === "delivered"
    ).length;
    const totalAddresses = addresses.length;
    const verifiedProofOrders = deliveries.filter(
      (d) => getStatusKey(d) === "delivered" && (d.proof_photo || d.proof_signature || d.verification_score)
    ).length;
    const verificationRate = deliveredOrders > 0 
      ? Math.round((verifiedProofOrders / deliveredOrders) * 100) 
      : 100;
    const ratingsCount = deliveries.filter((d) => d.driver_avg_rating).length;

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      totalAddresses,
      ratingsCount,
      verificationRate,
    };
  }, [deliveries, activeDeliveries, addresses, getStatusKey]);

  // Memoized Handlers
  const handleRate = useCallback((delivery: any) => setRatingDelivery(delivery), []);
  const handleDispute = useCallback((delivery: any) => setDisputeDelivery(delivery), []);
  const handleDetails = useCallback((delivery: any) => setSelectedDelivery(delivery), []);

  const handleAddAddress = useCallback(() => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  }, []);

  const handleEditAddress = useCallback((addr: any) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  }, []);

  const handleDeleteAddress = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this delivery address?")) return;
      try {
        await api.delete(`/customer/address/${id}`);
        toast.success("Address removed successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete address");
      }
    },
    [fetchData]
  );

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success(`Copied Order #${orderNumber.substring(0, 8)}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("customer_pref_instructions", deliveryInstruction);
    setSavedInstructionSuccess(true);
    toast.success("Delivery preferences updated!");
    setTimeout(() => setSavedInstructionSuccess(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const displayName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : null) ||
    user?.email?.split("@")[0] ||
    "Valued Customer";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      {/* Branded Local Refresh Overlay */}
      {isRefreshing && (
        <AppRefreshOverlay
          fullScreen
          message="Refreshing..."
          submessage="Updating deliveries, live tracking & radar..."
        />
      )}

      {/* 1. AppShell Sidebar */}
      <CustomerSidebar
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setCurrentPage(1);
        }}
        activeOrdersCount={activeDeliveries.length}
        totalOrdersCount={deliveries.length}
        addressesCount={addresses.length}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={logout}
      />

      {/* 2. Main Area (Header + Scrollable Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {activeTab === "overview" && "Customer Overview"}
                {activeTab === "active" && "Active Deliveries"}
                {activeTab === "radar" && "Live Map Radar"}
                {activeTab === "history" && "Order History"}
                {activeTab === "addresses" && "Saved Locations"}
                {activeTab === "preferences" && "Preferences & Support"}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Calendar size={13} className="text-slate-400" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>


            <NotificationBell
              deliveries={deliveries}
              count={activeDeliveries.length}
              onSelectDelivery={(del) => {
                setSelectedDelivery(del);
              }}
              onViewRadar={(del) => {
                handleViewOnRadar(del);
              }}
              onNavigateTab={(tabId) => {
                setActiveTab(tabId as CustomerTabId);
              }}
            />

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials || "C"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 space-y-8">
          {/* Section Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === "overview" && "Customer Command Center"}
                {activeTab === "active" && "Active Packages in Transit"}
                {activeTab === "radar" && "Live Delivery Radar & Route Visualizer"}
                {activeTab === "history" && "Order History & Verification Records"}
                {activeTab === "addresses" && "Saved Delivery Locations"}
                {activeTab === "preferences" && "Drop-off Preferences & Claims Assistance"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === "overview" && `Welcome back, ${displayName}! Track shipments, view KPIs, and manage preferences.`}
                {activeTab === "active" && "Track live courier progress, view real-time maps, and adjust delivery notes before arrival."}
                {activeTab === "radar" && "Interactive real-time satellite tracking of couriers heading to your drop-off addresses."}
                {activeTab === "history" && "Search past orders, inspect cryptographic delivery proof photos and signatures, and rate couriers."}
                {activeTab === "addresses" && "Configure verified delivery properties and manage default drop-off locations."}
                {activeTab === "preferences" && "Set default special instructions for couriers and view claims resolution assistance."}
              </p>
            </div>
          </div>

        {/* 3. Tab Contents with Animation */}
        <AnimatePresence mode="wait">
          {loading && deliveries.length === 0 ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonList count={3} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* ============================================================== */}
              {/* TAB 1: OVERVIEW / COMMAND CENTER */}
              {/* ============================================================== */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Quick Actions Toolbar */}
                  <CustomerQuickActionsToolbar
                    onTrackLatest={() => {
                      if (activeDeliveries.length > 0) {
                        handleViewOnRadar(activeDeliveries[0]);
                      } else if (deliveries.length > 0) {
                        handleViewOnRadar(deliveries[0]);
                      } else {
                        toast("No incoming packages at the moment.", { icon: "📦" });
                      }
                    }}
                    onViewLiveMap={() => handleViewOnRadar()}
                    onAddAddress={handleAddAddress}
                    onRefresh={() => fetchData(true)}
                    hasActiveOrders={activeDeliveries.length > 0}
                    loading={isRefreshing || loading}
                    lastUpdated={lastUpdated}
                  />

                  {/* Primary 5-Card KPI Grid */}
                  <CustomerKpiGrid
                    stats={stats}
                    onNavigateTab={(tabId) => setActiveTab(tabId as CustomerTabId)}
                  />

                  {/* Incoming Package Live Highlight Banner (if in-transit) */}
                  {activeDeliveries.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-indigo-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                      <div className="space-y-2 relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-xs border border-white/20">
                            Incoming Shipment
                          </span>
                          <span className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
                            <Clock size={13} />
                            ETA: {activeDeliveries[0].estimated_arrival ? new Date(activeDeliveries[0].estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "In Transit"}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Package #{activeDeliveries[0].order_number?.substring(0, 8)} is on the way!
                        </h3>
                        <p className="text-xs sm:text-sm text-indigo-100 leading-snug">
                          Assigned driver <strong className="text-white font-bold">{activeDeliveries[0].driver_name || "Delivery courier"}</strong> is actively navigating to your destination.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 relative z-10 shrink-0">
                        <button
                          onClick={() => handleViewOnRadar(activeDeliveries[0])}
                          className="px-6 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <MapPin size={16} />
                          <span>View on Live Radar</span>
                        </button>
                        <button
                          onClick={() => handleDetails(activeDeliveries[0])}
                          className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs uppercase tracking-wider border border-white/20 transition-all active:scale-95 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2-Column Grid: Delivery Frequency Chart + AI Intelligence Assistant */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left: Recharts Fulfillment Trends (7 cols) */}
                    <div className="lg:col-span-7 min-w-0">
                      <CustomerDeliveryChart deliveries={deliveries} />
                    </div>

                    {/* Right: AI Insights Panel (5 cols) */}
                    <div className="lg:col-span-5 min-w-0">
                      <CustomerAIInsights
                        activeDeliveries={activeDeliveries}
                        deliveredCount={stats.deliveredOrders}
                        savedAddressesCount={stats.totalAddresses}
                        onNavigateTab={(tabId) => setActiveTab(tabId as CustomerTabId)}
                        onTrackDelivery={(del) => handleViewOnRadar(del)}
                      />
                    </div>
                  </div>

                  {/* Full 12-Col: Recent Activity Stream */}
                  <div className="w-full">
                    <CustomerRecentActivityFeed
                      deliveries={deliveries}
                      onSelectDelivery={handleDetails}
                      onViewAll={() => setActiveTab("history")}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: ACTIVE DELIVERIES */}
              {/* ============================================================== */}
              {activeTab === "active" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        Active Packages in Transit
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track live courier progress, view real-time maps, and adjust delivery notes before arrival.
                      </p>
                    </div>

                    {activeDeliveries.length > 0 && (
                      <button
                        onClick={() => handleViewOnRadar()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <MapPin size={14} />
                        <span>Switch to Full Radar Map</span>
                      </button>
                    )}
                  </div>

                  {activeDeliveries.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {activeDeliveries.map((delivery) => (
                        <DeliveryCard
                          key={delivery.uuid}
                          delivery={delivery}
                          onDetails={() => handleDetails(delivery)}
                          onDispute={() => handleDispute(delivery)}
                          onTrack={() => handleViewOnRadar(delivery)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <DashboardEmptyState
                      icon={PackageOpen}
                      title="Everything's Arrived"
                      message="You don't have any incoming shipments at the moment. All previous orders have been securely fulfilled."
                      action={
                        <button
                          onClick={() => setActiveTab("history")}
                          className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          View Order History
                        </button>
                      }
                    />
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: LIVE MAP RADAR */}
              {/* ============================================================== */}
              {activeTab === "radar" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200/80 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Live Delivery Radar & Route Visualizer
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Interactive real-time satellite tracking of couriers heading to your drop-off addresses.
                    </p>
                  </div>

                  <CustomerLiveMapTracker
                    activeDeliveries={activeDeliveries}
                    allDeliveries={deliveries}
                    selectedDeliveryUuid={selectedRadarUuid}
                    onSelectDeliveryUuid={setSelectedRadarUuid}
                    onOpenDetails={handleDetails}
                  />
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: ORDER HISTORY */}
              {/* ============================================================== */}
              {activeTab === "history" && (
                <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
                  {/* Filters & Search Toolbar */}
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                      <Search
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Search by order ID, driver, address..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                        <Filter size={13} /> Status:
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                      >
                        <option value="all">All Statuses ({deliveries.length})</option>
                        <option value="delivered">Delivered ({deliveries.filter(d => getStatusKey(d) === 'delivered').length})</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                        <option value="disputed">Disputed</option>
                      </select>
                    </div>
                  </div>

                  {/* History Data Table */}
                  {pastDeliveriesList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Order Number
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Fulfillment Status
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Delivery Address
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Assigned Driver
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">
                              Proof & Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {paginatedHistory.map((d) => {
                            const statusKey = getStatusKey(d) as DeliveryStatus;
                            const isDelivered = statusKey === "delivered";

                            return (
                              <tr
                                key={d.uuid}
                                onClick={() => handleDetails(d)}
                                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                              >
                                {/* Order Number with copy button */}
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <span>#{d.order_number?.substring(0, 8)}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyOrderNumber(d.order_number || d.uuid);
                                      }}
                                      className="text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer p-1"
                                      title="Copy Order ID"
                                    >
                                      {copiedId === (d.order_number || d.uuid) ? (
                                        <Check size={12} className="text-emerald-500" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                  <StatusBadge status={statusKey} />
                                </td>

                                {/* Destination Address */}
                                <td className="px-6 py-4 max-w-[220px]">
                                  <p className="text-slate-600 font-medium truncate">
                                    {d.delivery_address || d.customer_address || d.address || "Address on record"}
                                  </p>
                                </td>

                                {/* Courier / Driver */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                                      {d.driver_name?.charAt(0) || "D"}
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                      {d.driver_name || "Unassigned"}
                                    </span>
                                  </div>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-4 text-slate-500 font-medium">
                                  {new Date(d.actual_arrival || d.created_at).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </td>

                                {/* Actions / Proof */}
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isDelivered && (
                                      <button
                                        type="button"
                                        title="Rate Driver"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRate(d);
                                        }}
                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                                      >
                                        <Star size={15} className="fill-amber-400 text-amber-400" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      title="Report Issue / Dispute"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDispute(d);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                                    >
                                      <AlertCircle size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDetails(d);
                                      }}
                                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                                    >
                                      Inspect Proof
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20">
                      <DashboardEmptyState
                        icon={History}
                        title="No Deliveries Found"
                        message="Your completed and archived orders will appear here once processed."
                      />
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                      <p className="text-xs text-slate-500 font-medium">
                        Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                        <span className="font-bold text-slate-900">{totalPages}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <ChevronLeft size={13} /> Prev
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Next <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 5: SAVED ADDRESSES */}
              {/* ============================================================== */}
              {activeTab === "addresses" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        Saved Delivery Locations
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure verified delivery addresses and default drop-off instructions.
                      </p>
                    </div>
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                    >
                      <Plus size={15} /> Add New Location
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {addresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          onEdit={() => handleEditAddress(address)}
                          onDelete={() => handleDeleteAddress(address.id)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <DashboardEmptyState
                      icon={MapPin}
                      title="Coordinates Missing"
                      message="You haven't added any delivery addresses to your profile yet."
                      action={
                        <button
                          onClick={handleAddAddress}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 mt-4 cursor-pointer"
                        >
                          <Plus size={15} /> Add First Address
                        </button>
                      }
                    />
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 6: PREFERENCES & SUPPORT */}
              {/* ============================================================== */}
              {activeTab === "preferences" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Delivery Instructions (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          Default Drop-off Instructions
                        </h3>
                        <p className="text-xs text-slate-500">
                          These instructions are automatically shared with drivers during package dispatch.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSavePreferences} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Special Instructions for Driver
                        </label>
                        <textarea
                          rows={3}
                          value={deliveryInstruction}
                          onChange={(e) => setDeliveryInstruction(e.target.value)}
                          placeholder="e.g. Leave package on front porch behind flower pot, gate code #4829..."
                          className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      {/* Quick options */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Suggested Quick Presets:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Leave package at front door",
                            "Ring doorbell and hand to resident",
                            "Leave in parcel locker / mailroom",
                            "Call recipient upon arrival",
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setDeliveryInstruction(preset)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                        >
                          Save Delivery Instructions
                        </button>
                        {savedInstructionSuccess && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Saved!
                          </span>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right: Dispute & Verification FAQ (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Cryptographic Proof Assurance */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 text-indigo-400">
                        <ShieldCheck size={20} />
                        <h4 className="font-bold text-sm tracking-tight text-white">
                          DeliveryProof Trust & Security
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Every delivery is cryptographically verified through real-time GPS coordinates, tamper-proof photos, and digital recipient signatures stored with SHA-256 hash chains.
                      </p>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span>100% Proof Guarantee</span>
                        <span className="text-emerald-400 font-bold">Audited System</span>
                      </div>
                    </div>

                    {/* Claims & Support Helpline */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            Have an Issue with a Package?
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Dispute claims resolution team
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        If a delivered package is missing, damaged, or dropped off incorrectly, you can file a formal dispute on that order within 7 days. Our operations team reviews verified photos and GPS geotags to resolve claims promptly.
                      </p>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Past Orders to File a Dispute</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* 4. Modals */}
      <AnimatePresence>
        {ratingDelivery && (
          <RatingModal
            delivery={ratingDelivery}
            isOpen={!!ratingDelivery}
            onClose={() => setRatingDelivery(null)}
            onSuccess={fetchData}
          />
        )}

        {disputeDelivery && (
          <DisputeModal
            delivery={disputeDelivery}
            isOpen={!!disputeDelivery}
            onClose={() => setDisputeDelivery(null)}
          />
        )}

        {selectedDelivery && (
          <OrderDetailsModal
            delivery={selectedDelivery}
            onClose={() => setSelectedDelivery(null)}
            onAddressUpdated={fetchData}
            onTrackOnRadar={handleViewOnRadar}
            savedAddresses={addresses}
          />
        )}

        {isAddressModalOpen && (
          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => {
              setIsAddressModalOpen(false);
              setEditingAddress(null);
            }}
            onSuccess={fetchData}
            address={editingAddress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;
