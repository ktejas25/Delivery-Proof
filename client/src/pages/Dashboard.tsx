import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Truck,
  Users,
  UserCircle,
  LogOut,
  Bell,
  Menu,
  X,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Calendar,
  CheckCircle2,
  Settings,
} from "lucide-react";
import io from "socket.io-client";
import api from "../services/api";

// Modals & Sub-pages
import Deliveries from "./Deliveries";
import Drivers from "./Drivers";
import Disputes from "./Disputes";
import Customers from "./Customers";
import UserProfileSettings from "../components/UserProfileSettings";
import NewDeliveryModal from "../components/NewDeliveryModal";
import RegisterDriverModal from "../components/RegisterDriverModal";
import DriverPerformanceModal from "../components/DriverPerformanceModal";
import DisputeDetailsModal from "../components/DisputeDetailsModal";
import ProofModal from "../components/ProofModal";

// Modular Enterprise Admin Components
import { AdminKpiGrid } from "../modules/admin/dashboard/components/AdminKpiGrid";
import { DeliveryTrendChart } from "../modules/admin/dashboard/components/DeliveryTrendChart";
import { PerformanceGauge } from "../modules/admin/dashboard/components/PerformanceGauge";
import { RevenueCustomerChart } from "../modules/admin/dashboard/components/RevenueCustomerChart";
import { AttentionRequiredCard } from "../modules/admin/dashboard/components/AttentionRequiredCard";
import { SystemHealthCard } from "../modules/admin/dashboard/components/SystemHealthCard";
import { FleetSnapshotCard } from "../modules/admin/dashboard/components/FleetSnapshotCard";
import { FleetOperationsView } from "../modules/admin/dashboard/components/FleetOperationsView";
import { AIInsightsPanel } from "../modules/admin/dashboard/components/AIInsightsPanel";
import { ProofsAndDisputesSummary } from "../modules/admin/dashboard/components/ProofsAndDisputesSummary";
import { RecentActivityFeed } from "../modules/admin/dashboard/components/RecentActivityFeed";
import { GlobalSearchDropdown } from "../modules/admin/dashboard/components/GlobalSearchDropdown";
import { DashboardSkeleton } from "../modules/admin/dashboard/components/DashboardSkeleton";
import { QuickActionsToolbar } from "../modules/admin/dashboard/components/QuickActionsToolbar";
import { NotificationDropdown } from "../modules/admin/dashboard/components/NotificationDropdown";
import AppRefreshOverlay from "../components/ui/AppRefreshOverlay";

// Types
import {
  DashboardOverview,
  DeliveryTrendPoint,
  DriverLeaderboardItem,
  AIInsightItem,
  RecentActivityItem,
  FleetOverview,
} from "../modules/admin/dashboard/types";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Dashboard Data States
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<DeliveryTrendPoint[]>([]);
  const [selectedTrendRange, setSelectedTrendRange] = useState("7d");
  const [financialRefreshTrigger, setFinancialRefreshTrigger] = useState(0);
  const [topDrivers, setTopDrivers] = useState<DriverLeaderboardItem[]>([]);
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(
    null,
  );
  const [aiInsights, setAiInsights] = useState<AIInsightItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<
    RecentActivityItem[]
  >([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{
    uuid: string;
    name: string;
  } | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [selectedProofDelivery, setSelectedProofDelivery] = useState<
    string | null
  >(null);

  const { user, logout } = useAuth();

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target as Node)
      ) {
        setNotificationDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 1. Fetch Overview & Enterprise Dashboard Data (Resilient)
  const fetchDashboardData = useCallback(async (isLocalRefresh = false) => {
    if (isLocalRefresh) {
      setIsRefreshing(true);
    }
    try {
      setError(null);
      const results = await Promise.allSettled([
        api.get("/admin/dashboard/overview"),
        api.get("/admin/dashboard/drivers?limit=5"),
        api.get("/admin/dashboard/fleet"),
        api.get("/admin/dashboard/ai-insights"),
        api.get("/admin/dashboard/activity?limit=10"),
      ]);

      const [overviewRes, driversRes, fleetRes, insightsRes, activityRes] =
        results;

      if (overviewRes.status === "fulfilled") {
        setOverview(overviewRes.value.data);
      } else {
        console.error("Dashboard overview error:", overviewRes.reason);
        setError(
          overviewRes.reason?.response?.data?.message ||
            "Failed to load enterprise administration metrics",
        );
      }

      if (driversRes.status === "fulfilled") {
        setTopDrivers(driversRes.value.data);
      }
      if (fleetRes.status === "fulfilled") {
        setFleetOverview(fleetRes.value.data);
      }
      if (insightsRes.status === "fulfilled") {
        setAiInsights(insightsRes.value.data);
      }
      if (activityRes.status === "fulfilled") {
        const actData = activityRes.value.data;
        const activityList = Array.isArray(actData?.activities)
          ? actData.activities
          : Array.isArray(actData)
            ? actData
            : [];
        setRecentActivities(activityList);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load enterprise administration metrics",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 2. Fetch Trend Data on Range Change
  const fetchTrendData = useCallback(async (range: string) => {
    setTrendsLoading(true);
    try {
      const res = await api.get(
        `/admin/dashboard/delivery-trends?range=${range}`,
      );
      setTrends(res.data.data);
    } catch (err) {
      console.error("Trends fetch error:", err);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  // 3. User-Initiated Local Refresh
  const handleLocalRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchDashboardData(true),
      fetchTrendData(selectedTrendRange),
    ]);
    setFinancialRefreshTrigger((prev) => prev + 1);
  }, [fetchDashboardData, fetchTrendData, selectedTrendRange]);

  useEffect(() => {
    fetchDashboardData(false);
    fetchTrendData(selectedTrendRange);
  }, [fetchDashboardData, fetchTrendData, selectedTrendRange]);

  // 3. Socket.IO Real-time Synchronization
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://localhost:5000" : undefined);
    const socket = socketUrl ? io(socketUrl) : io();

    if (user?.business_id) {
      socket.emit("join_dashboard", user.business_id);
    }

    socket.on("dashboard_activity_update", () => {
      fetchDashboardData();
      fetchTrendData(selectedTrendRange);
      setFinancialRefreshTrigger((prev) => prev + 1);
    });

    socket.on("driver_location_updated", () => {
      api.get("/admin/dashboard/fleet").then((res) => {
        setFleetOverview(res.data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.business_id, fetchDashboardData, fetchTrendData, selectedTrendRange]);

  const handleRangeChange = (newRange: string) => {
    setSelectedTrendRange(newRange);
    fetchTrendData(newRange);
  };

  const [readActivityIds, setReadActivityIds] = useState<Set<string | number>>(() => {
    try {
      const saved = localStorage.getItem("admin_read_notifications");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const unreadActivityCount = useMemo(() => {
    return recentActivities.filter((act) => !readActivityIds.has(act.id)).length;
  }, [recentActivities, readActivityIds]);

  const handleMarkAllActivitiesRead = useCallback(() => {
    const allIds = new Set<string | number>(recentActivities.map((act) => act.id));
    setReadActivityIds(allIds);
    try {
      localStorage.setItem("admin_read_notifications", JSON.stringify(Array.from(allIds)));
    } catch {
      // ignore
    }
  }, [recentActivities]);

  const handleMarkActivityRead = useCallback((id: string | number) => {
    setReadActivityIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("admin_read_notifications", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleSelectNotification = useCallback((act: RecentActivityItem) => {
    handleMarkActivityRead(act.id);
    setNotificationDropdownOpen(false);

    // If dispute event: redirect to Disputes tab and open modal if uuid exists
    if (act.action?.includes("DISPUTE") || act.type === "dispute") {
      setActiveTab("Disputes");
      if (act.deliveryUuid) {
        setSelectedDispute(act.deliveryUuid);
      }
      return;
    }

    // If driver event: redirect to Drivers tab
    if (act.action?.includes("DRIVER") || act.type === "driver") {
      setActiveTab("Drivers");
      return;
    }

    // If customer event: redirect to Customers tab
    if (act.type === "customer") {
      setActiveTab("Customers");
      return;
    }

    // If delivery event and has UUID: open ProofModal & switch to Deliveries
    if (act.deliveryUuid) {
      setSelectedProofDelivery(act.deliveryUuid);
      setActiveTab("Deliveries");
      return;
    }

    // Default: redirect to Deliveries
    setActiveTab("Deliveries");
  }, []);

  const displayName =
    user?.name ||
    (user?.first_name
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : "") ||
    user?.email?.split("@")[0] ||
    "Administrator";
  const roleLabel =
    user?.user_type === "admin"
      ? "Enterprise Administrator"
      : "Operations Manager";

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      {/* Branded Local Refresh Overlay */}
      {isRefreshing && (
        <AppRefreshOverlay
          fullScreen
          message="Refreshing..."
          submessage="Syncing real-time enterprise metrics & fleet telemetry..."
        />
      )}

      {/* 1. AppShell Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 overflow-hidden
        ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Logo & Enterprise Branding */}
          <div className="flex items-center justify-between mb-6 px-1 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center border border-slate-200/80 shrink-0 bg-slate-50">
                <img
                  src="/deliveryproof_app_icon_large_original.png"
                  alt="DeliveryProof Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                    Delivery<span className="text-blue-600">Proof</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                    Enterprise Suite
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">
                    Live
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Structured Scrollable Navigation Categories */}
          <nav className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 scrollbar-none">
            {/* OVERVIEW */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Overview
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("Dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Dashboard"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      size={17}
                      className={
                        activeTab === "Dashboard"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Admin Dashboard</span>
                  </div>
                  {activeTab === "Dashboard" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* MANAGEMENT */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Management
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("Customers");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Customers"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCircle
                      size={17}
                      className={
                        activeTab === "Customers"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Customers</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("Drivers");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Drivers"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users
                      size={17}
                      className={
                        activeTab === "Drivers"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Fleet & Drivers</span>
                  </div>
                  {topDrivers.length > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === "Drivers"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {topDrivers.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* OPERATIONS & COMPLIANCE */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Operations
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("Deliveries");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Deliveries"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck
                      size={17}
                      className={
                        activeTab === "Deliveries"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Deliveries & Orders</span>
                  </div>
                  {overview?.summary?.totalDeliveries ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === "Deliveries"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {overview.summary.totalDeliveries}
                    </span>
                  ) : null}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("Disputes");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Disputes"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      size={17}
                      className={
                        activeTab === "Disputes"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Disputes & Claims</span>
                  </div>
                  {overview?.disputes && overview.disputes.new > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                      {overview.disputes.new}
                    </span>
                  ) : null}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("FleetOps");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "FleetOps"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Navigation
                      size={17}
                      className={
                        activeTab === "FleetOps"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Fleet Operations</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </button>
              </div>
            </div>

            {/* SYSTEM & SETTINGS */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                System & Settings
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("Settings");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "Settings"
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings
                      size={17}
                      className={
                        activeTab === "Settings"
                          ? "text-white"
                          : "text-slate-400"
                      }
                    />
                    <span>Profile & Settings</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Enhanced User Account & Settings Footer */}
        <div className="pt-4 mt-auto border-t border-slate-200/80 space-y-2 shrink-0">
          <div className="p-3 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Settings");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer group"
                title="View Profile & Settings"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                    {displayName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                    title="Active Session"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Role & Status Pill Bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate max-w-[170px]">
                {roleLabel}
              </span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs shrink-0">
          {/* Left: Mobile Toggle & Section Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {activeTab === "Dashboard"
                  ? "Admin Overview"
                  : activeTab === "FleetOps"
                    ? "Fleet Operations"
                    : activeTab === "Settings"
                      ? "User Profile & Settings"
                      : activeTab}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Network
              </span>
            </div>
          </div>

          {/* Center: Global Search (Controlled 460px max width) */}
          <div className="hidden lg:flex flex-1 justify-center max-w-[460px]">
            <GlobalSearchDropdown
              onSelectOrder={(uuid) => setSelectedProofDelivery(uuid)}
              onSelectDriver={(driver) => setSelectedDriver(driver)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          </div>

          {/* Right: Date, Notifications, Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Live Date Pill */}
            <span className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Calendar size={13} className="text-slate-400" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            {/* Notification Bell & Dropdown */}
            <div ref={notificationDropdownRef} className="relative">
              <button
                onClick={() =>
                  setNotificationDropdownOpen(!notificationDropdownOpen)
                }
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications & Live Activity Feed"
              >
                <Bell size={18} />
                {unreadActivityCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {unreadActivityCount > 9 ? "9+" : unreadActivityCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={notificationDropdownOpen}
                onClose={() => setNotificationDropdownOpen(false)}
                activities={recentActivities}
                readIds={readActivityIds}
                onMarkAllRead={handleMarkAllActivitiesRead}
                onSelectActivity={handleSelectNotification}
                onViewAll={() => {
                  setNotificationDropdownOpen(false);
                  setActiveTab("Deliveries");
                }}
              />
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          {activeTab === "Dashboard" ? (
            loading && !overview ? (
              <DashboardSkeleton />
            ) : error && !overview ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-red-100 shadow-xs max-w-lg mx-auto mt-10">
                <AlertTriangle
                  size={36}
                  className="text-red-500 mx-auto mb-3"
                />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Unable to Load Enterprise Metrics
                </h3>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <button
                  onClick={handleLocalRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            ) : overview ? (
              <div className="max-w-[1536px] w-full mx-auto space-y-6">
                {/* 1. Page Header & Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Enterprise Admin Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Monitor enterprise performance, customers, deliveries,
                      revenue, and system health.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      All Services Healthy
                    </span>
                  </div>
                </div>

                {/* 2. Quick Actions Toolbar */}
                <QuickActionsToolbar
                  onNewOrder={() => setShowNewOrderModal(true)}
                  onAddDriver={() => setShowAddDriverModal(true)}
                  onRefresh={handleLocalRefresh}
                  loading={isRefreshing || loading}
                />

                {/* 3. Primary KPI Grid (8 Equal Height Cards) */}
                <AdminKpiGrid
                  summary={overview.summary}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />

                {/* 4. Enterprise Performance Trends & SLA Gauges (8 cols + 4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 min-w-0">
                    <DeliveryTrendChart
                      data={trends}
                      selectedRange={selectedTrendRange}
                      onRangeChange={handleRangeChange}
                      loading={trendsLoading}
                      onRefresh={handleLocalRefresh}
                    />
                  </div>
                  <div className="lg:col-span-4 min-w-0">
                    <PerformanceGauge metrics={overview.performance} />
                  </div>
                </div>

                {/* 5. Revenue / Customer Growth & AI Risk Intelligence (7 cols + 5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-7 min-w-0">
                    <RevenueCustomerChart
                      currencySymbol={overview.summary.currencySymbol || "₹"}
                      refreshTrigger={financialRefreshTrigger}
                    />
                  </div>
                  <div className="lg:col-span-5 min-w-0">
                    <AIInsightsPanel insights={aiInsights} />
                  </div>
                </div>

                {/* 6. Attention Required Exceptions & System Infrastructure Health (6 cols + 6 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6 min-w-0">
                    <AttentionRequiredCard
                      exceptions={
                        overview.attentionRequired || {
                          activeDisputes: overview.disputes.total,
                          highPriorityDisputes: overview.disputes.highPriority,
                          failedProofs: overview.proofs.failed,
                          failedDeliveries: overview.summary.failedDeliveries,
                          systemWarnings: 1,
                        }
                      }
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  </div>
                  <div className="lg:col-span-6 min-w-0">
                    <SystemHealthCard
                      services={overview.systemHealth}
                      onRefresh={handleLocalRefresh}
                    />
                  </div>
                </div>

                {/* 7. Proof & Compliance Breakdown + Concise Fleet Snapshot (7 cols + 5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-7 min-w-0">
                    <ProofsAndDisputesSummary
                      proofs={overview.proofs}
                      disputes={overview.disputes}
                      onNavigateDeliveries={() => setActiveTab("Deliveries")}
                      onNavigateDisputes={() => setActiveTab("Disputes")}
                    />
                  </div>
                  <div className="lg:col-span-5 min-w-0">
                    <FleetSnapshotCard
                      fleet={
                        overview.fleetSnapshot || {
                          totalDrivers: overview.summary.totalDrivers,
                          driversOnline: overview.summary.driversOnline,
                          totalVehicles: overview.summary.totalDrivers,
                          activeTrackers: overview.summary.driversOnline,
                          avgSpeed: 34,
                          speedUnit: "km/h",
                        }
                      }
                      onOpenFleetOperations={() => setActiveTab("FleetOps")}
                    />
                  </div>
                </div>

                {/* 8. Recent Enterprise Activity Stream (Full 12 cols) */}
                <div className="w-full min-w-0">
                  <RecentActivityFeed
                    activities={recentActivities}
                    onViewAll={() => setActiveTab("Deliveries")}
                    onSelectOrder={(uuid) => setSelectedProofDelivery(uuid)}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-xs max-w-lg mx-auto mt-10">
                <AlertTriangle
                  size={36}
                  className="text-amber-500 mx-auto mb-3"
                />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No Metrics Available
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Click below to fetch real-time enterprise metrics.
                </p>
                <button
                  onClick={handleLocalRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Dashboard
                </button>
              </div>
            )
          ) : activeTab === "FleetOps" && fleetOverview ? (
            <FleetOperationsView
              fleet={fleetOverview}
              topDrivers={topDrivers}
              onBackToAdmin={() => setActiveTab("Dashboard")}
              onSelectDriver={(d) => setSelectedDriver(d)}
              onViewDriversList={() => setActiveTab("Drivers")}
            />
          ) : activeTab === "Deliveries" ? (
            <Deliveries />
          ) : activeTab === "Customers" ? (
            <Customers />
          ) : activeTab === "Drivers" ? (
            <Drivers />
          ) : activeTab === "Disputes" ? (
            <Disputes />
          ) : activeTab === "Settings" ? (
            <UserProfileSettings
              onBackToDashboard={() => setActiveTab("Dashboard")}
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              Feature view active
            </div>
          )}
        </main>
      </div>

      {/* Modal Dialogs */}
      {showNewOrderModal && (
        <NewDeliveryModal
          onClose={() => setShowNewOrderModal(false)}
          onSuccess={() => {
            setShowNewOrderModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {showAddDriverModal && (
        <RegisterDriverModal
          onClose={() => setShowAddDriverModal(false)}
          onSuccess={() => {
            setShowAddDriverModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {selectedDriver && (
        <DriverPerformanceModal
          driverUuid={selectedDriver.uuid}
          driverName={selectedDriver.name}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {selectedDispute && (
        <DisputeDetailsModal
          disputeUuid={selectedDispute}
          userRole={user?.user_type || "admin"}
          onClose={() => setSelectedDispute(null)}
          onUpdate={() => {
            fetchDashboardData();
          }}
        />
      )}

      {selectedProofDelivery && (
        <ProofModal
          delivery={{ uuid: selectedProofDelivery } as any}
          isOpen={!!selectedProofDelivery}
          mode="view"
          onClose={() => setSelectedProofDelivery(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
