import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTruck, 
  FaHistory, 
  FaHome, 
  FaSearch, 
  FaPlus, 
  FaMapMarkerAlt, 
  FaStar, 
  FaExclamationTriangle,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
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
  const [error, setError] = useState(false);
  
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
    setError(false);
    try {
      const [delRes, addrRes] = await Promise.all([
        api.get("/customer/deliveries"),
        api.get("/customer/addresses")
      ]);
      setDeliveries(delRes.data);
      setAddresses(addrRes.data);
    } catch (err) {
      setError(true);
      toast.error(
        (t) => (
          <span>
            Failed to load dashboard data.
            <button 
              onClick={() => { toast.dismiss(t.id); fetchData(); }}
              className="ml-2 text-indigo-600 font-bold underline"
            >
              Retry
            </button>
          </span>
        ),
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data
  const getStatus = useCallback((d: any) => {
    if (!d) return 'pending';
    const statusStr = (d.status || d.delivery_status || '').toString();
    return statusStr.toLowerCase().replace(/[\s-]/g, '_');
  }, []);

  const activeDeliveries = useMemo(() => {
    if (!Array.isArray(deliveries)) return [];
    return deliveries.filter(d => {
      const status = getStatus(d);
      return ['pending', 'scheduled', 'dispatched', 'en_route', 'arrived'].includes(status);
    });
  }, [deliveries, getStatus]);

  const pastDeliveries = useMemo(() => {
    if (!Array.isArray(deliveries)) return [];
    let filtered = deliveries.filter(d => {
      const status = getStatus(d);
      return ['delivered', 'cancelled', 'failed', 'disputed'].includes(status);
    });
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.order_number?.toLowerCase().includes(query) || 
        d.driver_name?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => getStatus(d) === statusFilter.toLowerCase().replace(/[\s-]/g, '_'));
    }
    
    return filtered;
  }, [deliveries, searchQuery, statusFilter]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pastDeliveries.slice(start, start + itemsPerPage);
  }, [pastDeliveries, currentPage]);

  const totalPages = Math.ceil(pastDeliveries.length / itemsPerPage);

  // Handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await api.delete(`/customer/address/${id}`);
      toast.success("Address deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const tabs = [
    { id: "active", label: "Active", icon: FaTruck },
    { id: "history", label: "History", icon: FaHistory },
    { id: "addresses", label: "Properties", icon: FaHome },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <CustomerHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-8">
        {/* Dashboard Title & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
            <p className="text-gray-500 font-medium">Logged in as <span className="text-indigo-600">{user?.email}</span></p>
          </div>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setCurrentPage(1); }} />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {loading ? (
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "active" && (
                <div className="space-y-6">
                  {activeDeliveries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {activeDeliveries.map((delivery) => (
                        <DeliveryCard 
                          key={delivery.uuid} 
                          delivery={delivery} 
                          onDetails={() => setSelectedDelivery(delivery)}
                        />
                      ))}
                    </div>
                  ) : (
                    <DashboardEmptyState 
                      icon={FaTruck} 
                      title="No Active Deliveries" 
                      message="You don't have any packages on the way right now."
                    />
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                  {/* Table Header / Filters */}
                  <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by order # or driver..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <FaFilter className="text-gray-400" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 py-3 pl-4 pr-10 focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                      >
                        <option value="all">All Statuses</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  {pastDeliveries.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="px-6 py-5 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Order</th>
                              <th className="px-6 py-5 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                              <th className="px-6 py-5 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Date</th>
                              <th className="px-6 py-5 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Driver</th>
                              <th className="px-6 py-5 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {paginatedHistory.map((d) => (
                              <tr key={d.uuid} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-6 py-5 font-bold text-gray-900">#{d.order_number?.substring(0, 8)}</td>
                                <td className="px-6 py-5"><StatusBadge status={d.status as DeliveryStatus} /></td>
                                <td className="px-6 py-5 text-sm text-gray-500 font-medium">{new Date(d.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-5 text-sm text-gray-700 font-semibold">{d.driver_name || 'N/A'}</td>
                                <td className="px-6 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    {d.status === 'delivered' && (
                                      <button
                                        onClick={() => setRatingDelivery(d)}
                                        data-tooltip-id="rate-tooltip"
                                        data-tooltip-content="Rate this delivery"
                                        className="p-2.5 text-yellow-500 hover:bg-yellow-50 rounded-xl transition-colors"
                                      >
                                        <FaStar />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setDisputeDelivery(d)}
                                      data-tooltip-id="dispute-tooltip"
                                      data-tooltip-content="Report an issue"
                                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                      <FaExclamationTriangle />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                          <p className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage*itemsPerPage, pastDeliveries.length)}</span> of <span className="text-gray-900 font-bold">{pastDeliveries.length}</span>
                          </p>
                          <div className="flex gap-2">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => p - 1)}
                              className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                              <FaChevronLeft size={14} />
                            </button>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => p + 1)}
                              className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                              <FaChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-20 border-t border-gray-50">
                      <DashboardEmptyState 
                        icon={FaHistory} 
                        title="No History Found" 
                        message="We couldn't find any completed deliveries matching your filters."
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Saved Properties</h3>
                      <p className="text-gray-500 text-sm">Manage where we deliver your packages.</p>
                    </div>
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      <FaPlus /> Add New
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {addresses.map((address) => (
                        <AddressCard 
                          key={address.id} 
                          address={address} 
                          onEdit={() => handleEditAddress(address)}
                          onDelete={() => handleDeleteAddress(address.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <DashboardEmptyState 
                      icon={FaMapMarkerAlt} 
                      title="No Addresses Saved" 
                      message="Add your first delivery address to get started."
                      action={
                        <button
                          onClick={handleAddAddress}
                          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                          <FaPlus /> Add Address Now
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

        <AddressModal 
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSuccess={fetchData}
          address={editingAddress}
        />
      </AnimatePresence>

      <Tooltip id="rate-tooltip" className="!rounded-lg !text-xs !bg-gray-900" />
      <Tooltip id="dispute-tooltip" className="!rounded-lg !text-xs !bg-gray-900" />
    </div>
  );
};

export default CustomerDashboard;