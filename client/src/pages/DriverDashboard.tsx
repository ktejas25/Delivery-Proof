import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProofModal from '../components/ProofModal';
import NextDeliveryCard from '../components/driver/NextDeliveryCard';
import RouteCard from '../components/driver/RouteCard';
import { useGPS } from '../components/driver/hooks/useGPS';
import { useDeliveries } from '../components/driver/hooks/useDeliveries';
import { GPSPosition, Delivery } from '../components/driver/types';
import { DriverHeader } from '../components/driver/DriverHeader';
import api from '../services/api';

const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { deliveries, setDeliveries, loading, error, offline, refetch } = useDeliveries();
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const refreshing = false;
  const [updatingUuid, setUpdatingUuid] = useState<string | null>(null);

  const syncPosition = useCallback(async (pos: GPSPosition) => {
    try {
      await api.post('/api/driver/location', pos);
    } catch (err) {
      // Background sync, suppress errors
    }
  }, []);

  const { status: gpsStatus, position } = useGPS(syncPosition);

  // Derived state
  const earnings = useMemo(() => {
    const delivered = deliveries.filter((d: Delivery) => d.delivery_status === 'delivered');
    return delivered.reduce((sum: number, d: Delivery) => sum + (d.earnings || 50), 0);
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    if (!searchQuery.trim()) return deliveries;
    const q = searchQuery.toLowerCase();
    return deliveries.filter(
      (d: Delivery) => d.customer_name?.toLowerCase().includes(q) || d.address?.toLowerCase().includes(q)
    );
  }, [deliveries, searchQuery]);

  const sortedDeliveries = useMemo(
    () => [...filteredDeliveries].sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()),
    [filteredDeliveries]
  );

  const nextDelivery = sortedDeliveries[0];
  const routeDeliveries = sortedDeliveries.slice(1);

  const completedCount = deliveries.filter((d: Delivery) => d.delivery_status === 'delivered').length;
  const completionPercent = deliveries.length ? Math.round((completedCount / deliveries.length) * 100) : 0;

  // Actions
  const handleStatusUpdate = async (uuid: string, status: string) => {
    try {
      setUpdatingUuid(uuid);
      setDeliveries((prev: Delivery[]) => prev.map((d: Delivery) => (d.uuid === uuid ? { ...d, delivery_status: status as any } : d)));
      try {
        await api.patch(`/api/deliveries/${uuid}/status`, { delivery_status: status });
      } catch (err) {
        console.error('Status sync failed, local update applied', err);
      }
    } finally {
      setUpdatingUuid(null);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) window.location.href = `tel:${phone}`;
    else alert('No phone number available');
  };

  const handleNavigate = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-indigo-100">
      <DriverHeader
        user={user}
        offline={offline}
        gpsStatus={gpsStatus}
        position={position}
        earnings={earnings}
        completionPercent={completionPercent}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        refreshing={refreshing}
        logout={logout}
      />

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Boundary Alternative */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-red-900 font-medium text-sm">{error}</p>
              <button
                onClick={() => refetch()}
                className="text-red-600 hover:text-red-700 text-xs font-semibold mt-2 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedDeliveries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
              <MapPin size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-800 font-semibold text-lg">Route Complete</p>
            <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
              {searchQuery ? "No matches found for your search." : "You have processed all deliveries assigned to you."}
            </p>
          </div>
        )}

        {/* Next Priority Action */}
        {!loading && nextDelivery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest list-none">
                Priority Assignment
              </h2>
              {nextDelivery.delivery_status !== 'delivered' && (
                <div className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
              )}
            </div>
            
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <NextDeliveryCard
                delivery={nextDelivery}
                routeIndex={1}
                onStatusChange={handleStatusUpdate}
                onProofRequired={setSelectedDelivery}
                onCall={() => handleCall(nextDelivery.customer_phone)}
                onNavigate={() => handleNavigate(nextDelivery.address)}
                loading={updatingUuid === nextDelivery.uuid}
              />
            </motion.div>
          </div>
        )}

        {/* Route Queue */}
        {!loading && routeDeliveries.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Upcoming Queue ({routeDeliveries.length})
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {routeDeliveries.map((delivery, idx) => (
                  <motion.div
                    key={delivery.uuid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                  >
                    <RouteCard
                      delivery={delivery}
                      routeIndex={idx + 2}
                      onStatusChange={handleStatusUpdate}
                      onCall={() => handleCall(delivery.customer_phone)}
                      onNavigate={() => handleNavigate(delivery.address)}
                      onProofRequired={setSelectedDelivery}
                      loading={updatingUuid === delivery.uuid}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Required Signature Handover */}
      <AnimatePresence>
        {selectedDelivery && (
          <ProofModal
            deliveryUuid={selectedDelivery}
            onClose={() => setSelectedDelivery(null)}
            onSuccess={() => {
              setSelectedDelivery(null);
              refetch(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverDashboard;
