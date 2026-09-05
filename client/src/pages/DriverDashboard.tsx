import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDeliveries } from "../components/driver/hooks/useDeliveries";
import { useGPS } from "../components/driver/hooks/useGPS";
import { useShiftTimer } from "../components/driver/hooks/useShiftTimer";
import { Delivery } from "../components/driver/types";
import DriverSidebar from "../components/driver/DriverSidebar";
import DriverHeader from "../components/driver/DriverHeader";
import RouteProgress from "../components/driver/RouteProgress";
import NextDeliveryCard from "../components/driver/NextDeliveryCard";
import ShiftSummary from "../components/driver/ShiftSummary";
import RouteCard from "../components/driver/RouteCard";
import CompletedDeliveries from "../components/driver/CompletedDeliveries";
import DriverSkeleton from "../components/driver/ui/DriverSkeleton";
import DriverBottomNav, { DriverTab } from "../components/driver/ui/DriverBottomNav";
import DriverHistoryView from "../components/driver/pages/DriverHistoryView";
import DriverEarningsView from "../components/driver/pages/DriverEarningsView";
import DriverProfileView from "../components/driver/pages/DriverProfileView";
import ProofModal, { ProofData } from "../components/ProofModal";
import {
  searchDeliveries,
  sortDeliveriesByTime,
  getRouteStats,
} from "../components/driver/utils";

// ----- Shift Complete Banner Component -----
interface ShiftCompleteProps {
  completedCount: number;
  earnings: number;
  onEndShift: () => void;
}

const ShiftCompleteCard: React.FC<ShiftCompleteProps> = ({
  completedCount,
  earnings,
  onEndShift,
}) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
      <CheckCircle2 size={28} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-emerald-900 flex items-center justify-center gap-2">
        <span>Shift Complete! Great work!</span>
        <Sparkles size={18} className="text-emerald-600" />
      </h2>
      <p className="text-sm text-emerald-700 mt-1">
        All <strong className="font-bold text-emerald-900">{completedCount} deliveries</strong> completed.
      </p>
      <p className="text-xs text-emerald-600 mt-0.5">
        Total earnings: <strong className="text-base font-bold text-emerald-900">${earnings.toFixed(2)}</strong>
      </p>
    </div>
    <button
      onClick={onEndShift}
      className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
    >
      End Shift
    </button>
  </div>
);

// ----- Main DriverDashboard -----
const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Driver";

  const {
    deliveries,
    loading,
    error,
    offline,
    updateDeliveryStatus,
    submitDeliveryProof,
    syncQueue,
    syncQueuedUpdates,
    refetch,
  } = useDeliveries();

  const { status: gpsStatus, getPosition } = useGPS();
  const { formattedTime, stop, reset } = useShiftTimer();

  // Navigation state: route | history | earnings | profile
  const [activeTab, setActiveTab] = useState<DriverTab>("route");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofModalDelivery, setProofModalDelivery] = useState<Delivery | null>(null);
  const [proofModalMode, setProofModalMode] = useState<"upload" | "view">("upload");

  // Filter & sort deliveries
  const filteredDeliveries = useMemo(() => {
    const searched = searchDeliveries(deliveries, searchQuery);
    return sortDeliveriesByTime(searched);
  }, [deliveries, searchQuery]);

  const stats = useMemo(
    () => getRouteStats(filteredDeliveries),
    [filteredDeliveries]
  );

  // Identify next immediate action delivery
  const nextDelivery = useMemo(
    () =>
      filteredDeliveries.find(
        (d) =>
          d.delivery_status === "pending" ||
          d.delivery_status === "in_transit" ||
          d.delivery_status === "arrived"
      ),
    [filteredDeliveries]
  );

  // Upcoming deliveries after nextDelivery
  const remainingDeliveries = useMemo(
    () =>
      filteredDeliveries.filter(
        (d) => d !== nextDelivery && d.delivery_status !== "delivered"
      ),
    [filteredDeliveries, nextDelivery]
  );

  // Completed deliveries
  const completedDeliveries = useMemo(
    () => filteredDeliveries.filter((d) => d.delivery_status === "delivered"),
    [filteredDeliveries]
  );

  const allDeliveriesCompleted =
    deliveries.length > 0 &&
    deliveries.every((d) => d.delivery_status === "delivered");

  const activeStopsCount = remainingDeliveries.length + (nextDelivery ? 1 : 0);

  // Handlers
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleStatusChange = useCallback(
    async (uuid: string, status: Delivery["delivery_status"]) => {
      setActionLoading(uuid);
      try {
        await updateDeliveryStatus(uuid, status);
        toast.success(`Delivery status updated to ${status.replace("_", " ")}`);
      } catch (err) {
        toast.error("Failed to update delivery status");
      } finally {
        setActionLoading(null);
      }
    },
    [updateDeliveryStatus]
  );

  const handleCall = useCallback((delivery: Delivery) => {
    if (delivery.customer_phone) {
      window.location.href = `tel:${delivery.customer_phone}`;
    } else {
      toast.error("No phone number available for customer");
    }
  }, []);

  const handleNavigate = useCallback((delivery: Delivery) => {
    if (delivery.address) {
      window.open(
        `https://maps.google.com/maps?q=${encodeURIComponent(delivery.address)}`,
        "_blank"
      );
    }
  }, []);

  const handleProofRequired = useCallback(
    (uuid: string) => {
      const delivery = deliveries.find((d) => d.uuid === uuid);
      if (delivery) {
        setProofModalMode("upload");
        setProofModalDelivery(delivery);
      }
    },
    [deliveries]
  );

  const handleViewProof = useCallback((delivery: Delivery) => {
    setProofModalMode("view");
    setProofModalDelivery(delivery);
  }, []);

  const handleProofSubmit = useCallback(
    async (proof: ProofData) => {
      try {
        const gps = await getPosition();
        await submitDeliveryProof(proof.uuid, {
          photoUrl: proof.photoUrl,
          signature: proof.signature,
          notes: proof.notes,
          gps,
        });
        setProofModalDelivery(null);
        toast.success("Delivery completed & proof submitted!");
      } catch (err) {
        console.error("Proof submission error:", err);
        toast.error("Failed to complete delivery");
      }
    },
    [submitDeliveryProof, getPosition]
  );

  const handleEndShift = useCallback(() => {
    const earnings = deliveries.reduce((sum, d) => sum + (d.earnings || 0), 0);
    stop();
    reset();
    toast.success(`Shift completed! Total earnings: $${earnings.toFixed(2)}`);
  }, [deliveries, stop, reset]);

  // Page titles
  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case "route":
        return "Today's Route";
      case "history":
        return "Delivery History";
      case "earnings":
        return "Earnings & Shifts";
      case "profile":
        return "Driver Profile";
      default:
        return "Driver Dashboard";
    }
  }, [activeTab]);

  // Loading state with driver skeleton
  if (loading) {
    return <DriverSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Unable to load your route
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="min-h-[44px] w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (deliveries.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
        {/* Left Sidebar */}
        <DriverSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeStopsCount={0}
          completedCount={0}
          totalEarnings={0}
          shiftTime={formattedTime}
          driverName={displayName}
          isOnline={!offline}
          gpsStatus={gpsStatus}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <DriverHeader
            driverName={displayName}
            isOnline={!offline}
            gpsStatus={gpsStatus}
            syncQueueCount={syncQueue.length}
            isOffline={offline}
            pageTitle="Driver Console"
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onSyncNow={syncQueuedUpdates}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Package size={32} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  No deliveries assigned
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Your route is currently empty. We'll show new deliveries here when they are assigned.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw size={15} />
                <span>Refresh Route</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <DriverBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeStopsCount={0}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 1. Left AppShell Driver Sidebar */}
      <DriverSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeStopsCount={activeStopsCount}
        completedCount={stats.completed}
        totalEarnings={stats.totalEarnings}
        shiftTime={formattedTime}
        driverName={displayName}
        isOnline={!offline}
        gpsStatus={gpsStatus}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Viewport (flex-1 full-width container) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <DriverHeader
          driverName={displayName}
          isOnline={!offline}
          gpsStatus={gpsStatus}
          syncQueueCount={syncQueue.length}
          isOffline={offline}
          pageTitle={pageTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onSyncNow={syncQueuedUpdates}
          onLogout={handleLogout}
        />

        {/* Main Content Area - Full width with enhanced margins (No red blank gaps!) */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4 pb-24 md:pb-10">
          {/* TAB 1: TODAY'S ROUTE */}
          {activeTab === "route" && (
            <>
              {/* Full-width Search Bar */}
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
                  placeholder="Search deliveries, customer, address..."
                  aria-label="Search deliveries"
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

              {/* Compact Route Progress & Shift Overview */}
              <RouteProgress
                total={stats.total}
                completed={stats.completed}
                completionPercentage={stats.completionPercentage}
                totalEarnings={stats.totalEarnings}
                shiftTime={formattedTime}
              />

              {/* Empty state when 0 deliveries are assigned */}
              {deliveries.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Package size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Deliveries Scheduled</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You currently have no active deliveries assigned to your route. Newly dispatched orders will appear here in real-time.
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Check for Updates</span>
                  </button>
                </div>
              ) : allDeliveriesCompleted ? (
                <ShiftCompleteCard
                  completedCount={stats.completed}
                  earnings={stats.totalEarnings}
                  onEndShift={handleEndShift}
                />
              ) : (
                <>
                  {/* HERO SECTION: Next Delivery (+ Shift Summary on Desktop) */}
                  {nextDelivery ? (
                    <section aria-labelledby="next-delivery-heading">
                      <div className="lg:grid lg:grid-cols-12 lg:gap-5 items-start">
                        {/* Left Column (Hero Next Delivery Card) */}
                        <div className="lg:col-span-7 xl:col-span-8">
                          <NextDeliveryCard
                            delivery={nextDelivery}
                            routeIndex={1}
                            onStatusChange={handleStatusChange}
                            onCall={handleCall}
                            onNavigate={handleNavigate}
                            onProofRequired={handleProofRequired}
                            loading={actionLoading === nextDelivery.uuid}
                          />
                        </div>

                        {/* Right Column (Desktop Shift Summary) */}
                        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 h-full">
                          <ShiftSummary
                            shiftTime={formattedTime}
                            totalEarnings={stats.totalEarnings}
                            completedCount={stats.completed}
                            totalCount={stats.total}
                            gpsStatus={gpsStatus}
                            isOffline={offline}
                            syncQueueCount={syncQueue.length}
                          />
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {/* UPCOMING ROUTE AHEAD SECTION */}
                  {remainingDeliveries.length > 0 && (
                    <section
                      aria-labelledby="route-ahead-heading"
                      className="space-y-2.5 pt-1"
                    >
                      <div className="flex items-center justify-between px-0.5">
                        <h2
                          id="route-ahead-heading"
                          className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >
                          Route Ahead · {remainingDeliveries.length} Stop{remainingDeliveries.length > 1 ? "s" : ""}
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Next in sequence
                        </span>
                      </div>

                      {/* Enhanced Multi-Column Grid: 1 col on mobile, 2 on tablet, 3 on large desktop */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
                        {remainingDeliveries.map((delivery, idx) => (
                          <RouteCard
                            key={delivery.uuid}
                            delivery={delivery}
                            routeIndex={idx + 2}
                            onStatusChange={handleStatusChange}
                            onCall={handleCall}
                            onNavigate={handleNavigate}
                            onProofRequired={handleProofRequired}
                            loading={actionLoading === delivery.uuid}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* COMPLETED DELIVERIES (Collapsible) */}
                  {completedDeliveries.length > 0 && (
                    <section aria-labelledby="completed-deliveries-heading" className="pt-1">
                      <CompletedDeliveries
                        deliveries={completedDeliveries}
                        onViewProof={handleViewProof}
                      />
                    </section>
                  )}
                </>
              )}
            </>
          )}

          {/* TAB 2: DELIVERY HISTORY */}
          {activeTab === "history" && (
            <DriverHistoryView
              deliveries={deliveries}
              onViewProof={handleViewProof}
            />
          )}

          {/* TAB 3: EARNINGS & SHIFTS */}
          {activeTab === "earnings" && (
            <DriverEarningsView
              deliveries={deliveries}
              shiftTime={formattedTime}
              totalEarnings={stats.totalEarnings}
              onEndShift={handleEndShift}
            />
          )}

          {/* TAB 4: DRIVER PROFILE & SETTINGS */}
          {activeTab === "profile" && (
            <DriverProfileView
              driverName={displayName}
              email={user?.email}
              phone={user?.phone}
              gpsStatus={gpsStatus}
              isOnline={!offline}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Proof of Delivery Modal */}
      {proofModalDelivery && (
        <ProofModal
          delivery={proofModalDelivery}
          isOpen={true}
          mode={proofModalMode}
          onClose={() => setProofModalDelivery(null)}
          onSubmit={handleProofSubmit}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <DriverBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeStopsCount={activeStopsCount}
      />
    </div>
  );
};

export default DriverDashboard;
