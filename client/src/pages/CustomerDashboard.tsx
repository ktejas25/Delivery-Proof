import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck,
  FaHistory,
  FaHome,
  FaSearch,
  FaPlus,
  FaMapMarkerAlt,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaBoxOpen,
} from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

import CustomerHeader from "../components/customer/CustomerHeader";
import DeliveryCard from "../components/customer/DeliveryCard";
import RatingModal from "../components/customer/RatingModal";
import DisputeModal from "../components/customer/DisputeModal";
import OrderDetailsModal from "../components/customer/OrderDetailsModal";
import AddressCard from "../components/customer/AddressCard";
import AddressModal from "../components/customer/AddressModal";
import Tabs from "../components/ui/Tabs";
import StatusBadge, { DeliveryStatus } from "../components/ui/StatusBadge";
import { SkeletonList } from "../components/ui/SkeletonCard";
import DashboardEmptyState from "../components/ui/DashboardEmptyState";

const CustomerDashboard = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState("active");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals status
  const [ratingDelivery, setRatingDelivery] = useState<any | null>(null);
  const [disputeDelivery, setDisputeDelivery] = useState<any | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // History Tab Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [delRes, addrRes] = await Promise.all([
        api.get("/customer/deliveries"),
        api.get("/customer/addresses"),
      ]);
      setDeliveries(delRes.data);
      setAddresses(addrRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard data. Retrying...");
      // Auto-retry once after 3 seconds
      setTimeout(fetchData, 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for live tracking
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Derived Data
  const getStatusKey = useCallback((d: any) => {
    if (!d) return "pending";
    const statusStr = (d.status || d.delivery_status || "").toString();
    return statusStr.toLowerCase().replace(/[\s-]/g, "_");
  }, []);

  const activeDeliveries = useMemo(() => {
    if (!Array.isArray(deliveries)) return [];
    return deliveries.filter((d) => {
      const status = getStatusKey(d);
      return ["pending", "scheduled", "dispatched", "en_route", "arrived"].includes(status);
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
          d.driver_name?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (d) => getStatusKey(d) === statusFilter,
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deliveries, searchQuery, statusFilter, getStatusKey]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pastDeliveriesList.slice(start, start + itemsPerPage);
  }, [pastDeliveriesList, currentPage]);

  const totalPages = Math.ceil(pastDeliveriesList.length / itemsPerPage);

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

  const handleDeleteAddress = useCallback(async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/customer/address/${id}`);
      toast.success("Address removed successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  }, [fetchData]);

  const tabs = useMemo(() => [
    { id: "active", label: "My Deliveries", icon: FaTruck },
    { id: "history", label: "Order History", icon: FaHistory },
    { id: "addresses", label: "My Addresses", icon: FaHome },
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <CustomerHeader user={user} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-100 pb-10">
          <div className="space-y-2">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100"
             >
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
               </span>
               System Online
             </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              Hello, <span className="text-indigo-600">{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || user?.email?.split('@')[0] || "Valued Customer"}!</span>
            </h2>
            <p className="text-lg text-gray-400 font-bold max-w-xl">
              Track your packages in real-time and manage your delivery preferences.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => {
                setActiveTab(id);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Tab Content */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {activeTab === "active" && (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                       <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Active Deliveries</h3>
                       <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                    </div>
                    
                    {activeDeliveries.length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10"
                      >
                        {activeDeliveries.map((delivery) => (
                          <DeliveryCard
                            key={delivery.uuid}
                            delivery={delivery}
                            onDetails={() => handleDetails(delivery)}
                            onDispute={() => handleDispute(delivery)}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <DashboardEmptyState
                        icon={FaBoxOpen}
                        title="Everything's Arrived"
                        message="You don't have any incoming packages at the moment."
                      />
                    )}
                  </section>

                  {/* Quick History Glance */}
                  {pastDeliveriesList.length > 0 && (
                    <section className="pt-12 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4 mb-8 text-center sm:text-left">
                        <div className="flex items-center gap-4 flex-1">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Recent History</h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                        </div>
                        <button 
                          onClick={() => setActiveTab('history')}
                          className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline whitespace-nowrap"
                        >
                          View Full History
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {pastDeliveriesList.slice(0, 3).map((delivery) => (
                          <DeliveryCard
                            key={delivery.uuid}
                            delivery={delivery}
                            onDetails={() => handleDetails(delivery)}
                            onRate={() => handleRate(delivery)}
                            onDispute={() => handleDispute(delivery)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                  {/* Filters */}
                  <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-[28rem]">
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by order ID, driver or items..."
                        className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest px-3">
                        <FaFilter /> Filter
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border-none rounded-2xl shadow-sm shadow-indigo-100/10 text-sm font-bold text-gray-700 py-4 px-6 focus:ring-4 focus:ring-indigo-500/10 w-full md:min-w-[12rem] cursor-pointer appearance-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                        <option value="disputed">Disputed</option>
                      </select>
                    </div>
                  </div>

                  {pastDeliveriesList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Package ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Progress</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timeline</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paginatedHistory.map((d) => (
                            <tr
                              key={d.uuid}
                              onClick={() => handleDetails(d)}
                              className="hover:bg-indigo-50/20 transition-all duration-300 group cursor-pointer"
                            >
                              <td className="px-8 py-6">
                                <span className="font-extrabold text-gray-900 tracking-tight">#{d.order_number?.substring(0, 8)}</span>
                              </td>
                              <td className="px-8 py-6">
                                <StatusBadge status={getStatusKey(d) as DeliveryStatus} />
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-500 font-bold italic">
                                {new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                     {d.driver_name?.charAt(0) || '?'}
                                   </div>
                                   <span className="text-sm text-gray-700 font-bold">{d.driver_name || "Unassigned"}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {getStatusKey(d) === "delivered" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRate(d); }}
                                      className="p-3 text-yellow-500 hover:bg-yellow-50 rounded-2xl transition-all active:scale-90"
                                    >
                                      <FaPlus title="Rate" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDispute(d); }}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                                  >
                                    <FaHistory title="Report" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-24">
                      <DashboardEmptyState
                        icon={FaHistory}
                        title="Archived Orders"
                        message="Your completed deliveries will appear here once they are processed."
                      />
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
                      <p className="text-xs text-gray-400 font-black uppercase tracking-widest">
                        Page <span className="text-indigo-600">{currentPage}</span> of <span className="text-indigo-600">{totalPages}</span>
                      </p>
                      <div className="flex gap-4">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all shadow-sm active:scale-95"
                        >
                          <FaChevronLeft size={10} /> Prev
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all shadow-sm active:scale-95"
                        >
                          Next <FaChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-12">
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-100 gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Saved Properties</h3>
                      <p className="text-gray-400 font-bold italic">
                        Configure where your packages should be delivered.
                      </p>
                    </div>
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                      <FaPlus /> Add New Location
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
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
                      icon={FaMapMarkerAlt}
                      title="Coordinates Missing"
                      message="You haven't added any delivery addresses to your profile yet."
                      action={
                        <button
                          onClick={handleAddAddress}
                          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 mt-4"
                        >
                          <FaPlus /> Start by Adding One
                        </button>
                      }
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
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
          />
        )}

        {isAddressModalOpen && (
          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onSuccess={fetchData}
            address={editingAddress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;
