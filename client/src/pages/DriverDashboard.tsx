import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useDeliveries } from "../components/driver/hooks/useDeliveries";
import { useGPS } from "../components/driver/hooks/useGPS";
import { useShiftTimer } from "../components/driver/hooks/useShiftTimer";
import { Delivery } from "../components/driver/types";
import DriverHeader from "../components/driver/DriverHeader";
import NextDeliveryCard from "../components/driver/NextDeliveryCard";
import RouteCard from "../components/driver/RouteCard";
import ProofModal from "../components/ProofModal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import {
  searchDeliveries,
  sortDeliveriesByTime,
  getRouteStats,
} from "../components/driver/utils";
import { cn } from "../components/driver/utils"; // adjust if you have a central utils

// ----- Subcomponents (can be extracted later) -----

interface DeliveryListSectionProps {
  title: string;
  deliveries: Delivery[];
  startIndex: number;
  onStatusChange: (uuid: string, status: Delivery["delivery_status"]) => void;
  onCall: (delivery: Delivery) => void;
  onNavigate: (delivery: Delivery) => void;
  onProofRequired: (uuid: string) => void;
  loadingMap: string | null;
  isCompleted?: boolean;
}

const DeliveryListSection: React.FC<DeliveryListSectionProps> = ({
  title,
  deliveries,
  startIndex,
  onStatusChange,
  onCall,
  onNavigate,
  onProofRequired,
  loadingMap,
  isCompleted = false,
}) => (
  <section aria-labelledby={`section-${title}`}>
    <h2 id={`section-${title}`} className="text-xs font-bold text-slate-500 uppercase mb-2">
      {title}
    </h2>
    <div className={cn("space-y-2", isCompleted && "opacity-70")}>
      {deliveries.map((delivery, idx) => (
        <RouteCard
          key={delivery.uuid}
          delivery={delivery}
          routeIndex={startIndex + idx}
          onStatusChange={onStatusChange}
          onCall={onCall}
          onNavigate={onNavigate}
          onProofRequired={onProofRequired}
          loading={loadingMap === delivery.uuid}
        />
      ))}
    </div>
  </section>
);

interface ShiftCompleteCardProps {
  earnings: number;
  onEndShift: () => void;
}

const ShiftCompleteCard: React.FC<ShiftCompleteCardProps> = ({
  earnings,
  onEndShift,
}) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
    <h2 className="text-xl font-bold text-emerald-900">Shift Complete 🎉</h2>
    <p className="text-emerald-700">Total earnings: ${earnings.toFixed(2)}</p>
    <button
      onClick={onEndShift}
      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      End Shift
    </button>
  </div>
);

// ----- Main Dashboard -----

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
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
    syncQueue,
  } = useDeliveries();

  const { status: gpsStatus } = useGPS();
  const { formattedTime, stop, reset } = useShiftTimer();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofModalDelivery, setProofModalDelivery] = useState<Delivery | null>(null);

  // Memoized derived data
  const filteredDeliveries = useMemo(() => {
    const searched = searchDeliveries(deliveries, searchQuery);
    return sortDeliveriesByTime(searched);
  }, [deliveries, searchQuery]);

  const stats = useMemo(
    () => getRouteStats(filteredDeliveries),
    [filteredDeliveries]
  );

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

  const remainingDeliveries = useMemo(
    () =>
      filteredDeliveries.filter(
        (d) => d !== nextDelivery && d.delivery_status !== "delivered"
      ),
    [filteredDeliveries, nextDelivery]
  );

  const completedDeliveries = useMemo(
    () => filteredDeliveries.filter((d) => d.delivery_status === "delivered"),
    [filteredDeliveries]
  );

  const allDeliveriesCompleted =
    completedDeliveries.length === filteredDeliveries.length &&
    filteredDeliveries.length > 0;

  // Handlers
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const handleStatusChange = useCallback(
    async (uuid: string, status: Delivery["delivery_status"]) => {
      setActionLoading(uuid);
      try {
        await updateDeliveryStatus(uuid, status);
      } catch (err) {
        toast.error("Failed to update status");
      } finally {
        setActionLoading(null);
      }
    },
    [updateDeliveryStatus]
  );

  const handleCall = useCallback((delivery: Delivery) => {
    if (delivery.customer_phone) {
      window.location.href = `tel:${delivery.customer_phone}`;
    }
  }, []);

  const handleNavigate = useCallback((delivery: Delivery) => {
    if (delivery.address) {
      window.open(
        `https://maps.google.com/maps?q=${encodeURIComponent(
          delivery.address
        )}`,
        "_blank"
      );
    }
  }, []);

  const handleProofRequired = useCallback(
    (uuid: string) => {
      const delivery = deliveries.find((d) => d.uuid === uuid);
      if (delivery) setProofModalDelivery(delivery);
    },
    [deliveries]
  );

  const handleProofSubmit = useCallback(
    async (proof: { uuid: string; [key: string]: any }) => {
      try {
        await updateDeliveryStatus(proof.uuid, "delivered");
        setProofModalDelivery(null);
        toast.success("Delivery completed!");
      } catch {
        toast.error("Failed to complete delivery");
      }
    },
    [updateDeliveryStatus]
  );

  const handleEndShift = useCallback(() => {
    const earnings = deliveries.reduce((sum, d) => sum + (d.earnings || 0), 0);
    stop();
    reset();
    toast.success(`Shift completed! Earnings: $${earnings.toFixed(2)}`);
  }, [deliveries, stop, reset]);

  // Loading state
  if (loading) {
    return <LoadingState message="Loading deliveries..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error}/>;
  }

  // Empty state
  if (deliveries.length === 0) {
    return (
      <EmptyState
        title="No deliveries assigned"
        description="Your route is empty. Check back later."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DriverHeader
        driverName={displayName}
        isOnline={!offline}
        gpsStatus={gpsStatus}
        shiftTime={formattedTime}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        syncQueueCount={syncQueue.length}
        isOffline={offline}
        onLogout={handleLogout}
      />

      <main className="px-4 py-6 space-y-6">
        {/* Next delivery */}
        {nextDelivery && (
          <section aria-labelledby="next-delivery-heading">
            <h2 id="next-delivery-heading" className="text-xs font-bold text-slate-500 uppercase mb-2">
              Next Delivery
            </h2>
            <NextDeliveryCard
              delivery={nextDelivery}
              routeIndex={1}
              onStatusChange={handleStatusChange}
              onCall={handleCall}
              onNavigate={handleNavigate}
              onProofRequired={handleProofRequired}
              loading={actionLoading === nextDelivery.uuid}
            />
          </section>
        )}

        {/* Remaining deliveries */}
        {remainingDeliveries.length > 0 && (
          <DeliveryListSection
            title={`Route Ahead (${remainingDeliveries.length})`}
            deliveries={remainingDeliveries}
            startIndex={2}
            onStatusChange={handleStatusChange}
            onCall={handleCall}
            onNavigate={handleNavigate}
            onProofRequired={handleProofRequired}
            loadingMap={actionLoading}
          />
        )}

        {/* Completed deliveries */}
        {completedDeliveries.length > 0 && (
          <DeliveryListSection
            title={`Completed (${completedDeliveries.length})`}
            deliveries={completedDeliveries}
            startIndex={remainingDeliveries.length + 2}
            onStatusChange={handleStatusChange}
            onCall={handleCall}
            onNavigate={handleNavigate}
            onProofRequired={handleProofRequired}
            loadingMap={actionLoading}
            isCompleted
          />
        )}

        {/* Shift complete banner */}
        {allDeliveriesCompleted && (
          <ShiftCompleteCard earnings={stats.totalEarnings} onEndShift={handleEndShift} />
        )}
      </main>

      {proofModalDelivery && (
        <ProofModal
          delivery={proofModalDelivery}
          isOpen={true}
          onClose={() => setProofModalDelivery(null)}
          onSubmit={handleProofSubmit}
        />
      )}
    </div>
  );
};

export default DriverDashboard;