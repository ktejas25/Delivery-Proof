import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronDown,
  Calendar,
  CheckCircle2
} from "lucide-react";
import io from "socket.io-client";
import api from "../services/api";

// Modals & Sub-pages
import Deliveries from "./Deliveries";
import Drivers from "./Drivers";
import Disputes from "./Disputes";
import Customers from "./Customers";
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

// Types
import {
  DashboardOverview,
  DeliveryTrendPoint,
  DriverLeaderboardItem,
  AIInsightItem,
  RecentActivityItem,
  FleetOverview
} from "../modules/admin/dashboard/types";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Dashboard Data States
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<DeliveryTrendPoint[]>([]);
  const [selectedTrendRange, setSelectedTrendRange] = useState("7d");
  const [topDrivers, setTopDrivers] = useState<DriverLeaderboardItem[]>([]);
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsightItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ uuid: string; name: string } | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [selectedProofDelivery, setSelectedProofDelivery] = useState<string | null>(null);

  const { user, logout } = useAuth();

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
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

  // 1. Fetch Overview & Enterprise Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [overviewRes, driversRes, fleetRes, insightsRes, activityRes] = await Promise.all([
        api.get("/admin/dashboard/overview"),
        api.get("/admin/dashboard/drivers?limit=5"),
        api.get("/admin/dashboard/fleet"),
        api.get("/admin/dashboard/ai-insights"),
        api.get("/admin/dashboard/activity?limit=10")
      ]);

      setOverview(overviewRes.data);
      setTopDrivers(driversRes.data);
      setFleetOverview(fleetRes.data);
      setAiInsights(insightsRes.data);
      setRecentActivities(activityRes.data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load enterprise administration metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Trend Data on Range Change
  const fetchTrendData = useCallback(async (range: string) => {
    setTrendsLoading(true);
    try {
      const res = await api.get(`/admin/dashboard/delivery-trends?range=${range}`);
      setTrends(res.data.data);
    } catch (err) {
      console.error("Trends fetch error:", err);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchTrendData(selectedTrendRange);
  }, [fetchDashboardData, fetchTrendData, selectedTrendRange]);

  // 3. Socket.IO Real-time Synchronization
  useEffect(() => {
    const socket = io();

    if (user?.business_id) {
      socket.emit("join_dashboard", user.business_id);
    }

    socket.on("dashboard_activity_update", () => {
      fetchDashboardData();
    });

    socket.on("driver_location_updated", () => {
      api.get("/admin/dashboard/fleet").then((res) => {
        setFleetOverview(res.data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.business_id, fetchDashboardData]);

  const handleRangeChange = (newRange: string) => {
    setSelectedTrendRange(newRange);
    fetchTrendData(newRange);
  };

  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || user?.email?.split('@')[0] || "Administrator";
  const roleLabel = user?.user_type === 'admin' ? 'Enterprise Administrator' : 'Operations Manager';

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* 1. AppShell Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo & Enterprise Branding */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                DP
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  DeliveryProof
                </h2>
                <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                  Enterprise Suite
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Structured Navigation Categories */}
          <nav className="space-y-4">
            {/* OVERVIEW */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Overview
              </span>
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab("Dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "Dashboard"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard size={17} className={activeTab === "Dashboard" ? "text-blue-600" : "text-slate-400"} />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            </div>

            {/* MANAGEMENT */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Management
              </span>
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab("Customers"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "Customers"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <UserCircle size={17} className={activeTab === "Customers" ? "text-blue-600" : "text-slate-400"} />
                  <span>Customers</span>
                </button>

                <button
                  onClick={() => { setActiveTab("Drivers"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "Drivers"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Users size={17} className={activeTab === "Drivers" ? "text-blue-600" : "text-slate-400"} />
                  <span>Fleet & Drivers</span>
                </button>
              </div>
            </div>

            {/* OPERATIONS & COMPLIANCE */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Operations
              </span>
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab("Deliveries"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "Deliveries"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Truck size={17} className={activeTab === "Deliveries" ? "text-blue-600" : "text-slate-400"} />
                  <span>Deliveries & Orders</span>
                </button>

                <button
                  onClick={() => { setActiveTab("Disputes"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "Disputes"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <AlertTriangle size={17} className={activeTab === "Disputes" ? "text-blue-600" : "text-slate-400"} />
                  <span>Disputes & Claims</span>
                </button>

                <button
                  onClick={() => { setActiveTab("FleetOps"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "FleetOps"
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Navigation size={17} className={activeTab === "FleetOps" ? "text-blue-600" : "text-slate-400"} />
                  <span>Fleet Operations</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* User Account / Logout Footer */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center gap-3 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {displayName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
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
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>

            {/* Notification Bell */}
            <div ref={notificationDropdownRef} className="relative">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-slate-900">Notifications & Alerts</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Live Stream
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recentActivities.slice(0, 4).map((act) => (
                      <div key={act.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-900 text-[11px]">{act.title}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown (Fixed & Anchored) */}
            <div ref={profileDropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {displayName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
                  <p className="text-[10px] font-medium text-slate-400">{roleLabel}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-xl">
                    <p className="font-bold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {roleLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => { setActiveTab("Dashboard"); setProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <LayoutDashboard size={15} className="text-slate-400" /> Admin Overview
                  </button>

                  <button
                    onClick={() => { setActiveTab("FleetOps"); setProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <Navigation size={15} className="text-slate-400" /> Fleet Operations
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          {activeTab === "Dashboard" ? (
            loading ? (
              <DashboardSkeleton />
            ) : error ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-red-100 shadow-xs max-w-lg mx-auto mt-10">
                <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">Unable to Load Enterprise Metrics</h3>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <button
                  onClick={fetchDashboardData}
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
                      Monitor enterprise performance, customers, deliveries, revenue, and system health.
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
                  onRefresh={fetchDashboardData}
                  loading={loading}
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
                      onRefresh={() => fetchTrendData(selectedTrendRange)}
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
                      trendData={trends}
                      totalRevenue={overview.summary.revenue}
                      totalCustomers={overview.summary.customers}
                      currencySymbol={overview.summary.currencySymbol}
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
                      exceptions={overview.attentionRequired || {
                        activeDisputes: overview.disputes.total,
                        highPriorityDisputes: overview.disputes.highPriority,
                        failedProofs: overview.proofs.failed,
                        failedDeliveries: overview.summary.failedDeliveries,
                        systemWarnings: 1
                      }}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  </div>
                  <div className="lg:col-span-6 min-w-0">
                    <SystemHealthCard
                      services={overview.systemHealth}
                      onRefresh={fetchDashboardData}
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
                      fleet={overview.fleetSnapshot || {
                        totalDrivers: overview.summary.totalDrivers,
                        driversOnline: overview.summary.driversOnline,
                        totalVehicles: overview.summary.totalDrivers,
                        activeTrackers: overview.summary.driversOnline,
                        avgSpeed: 34,
                        speedUnit: 'km/h'
                      }}
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
            ) : null
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
          ) : (
            <div className="p-8 text-center text-slate-400">Feature view active</div>
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
          userRole={user?.user_type || 'admin'}
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
