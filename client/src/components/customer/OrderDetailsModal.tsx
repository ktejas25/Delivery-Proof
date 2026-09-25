import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';
import { User, MapPin, Package, Clock, Camera, PenTool, Edit3, Check, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  delivery: any;
  onClose: () => void;
  onAddressUpdated?: () => void;
  savedAddresses?: any[];
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  delivery,
  onClose,
  onAddressUpdated,
  savedAddresses = []
}) => {
  const [proof, setProof] = useState<any>(null);
  const [loadingProof, setLoadingProof] = useState(false);

  const initialAddress = delivery.customer_address || delivery.delivery_address || delivery.address || '';
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';
  const status = (delivery.status || delivery.delivery_status || 'pending').toLowerCase().replace(/[\s-]/g, '_') as DeliveryStatus;
  const canEditAddress = ['pending', 'scheduled'].includes(status);

  useEffect(() => {
    const addr = delivery.customer_address || delivery.delivery_address || delivery.address || '';
    setCurrentAddress(addr);
    setAddressInput(addr);
  }, [delivery]);

  useEffect(() => {
    if (status === 'delivered' || status === 'disputed') {
      const fetchProof = async () => {
        setLoadingProof(true);
        try {
          const response = await api.get(`/proofs/${delivery.uuid}`);
          setProof(response.data);
        } catch (error) {
          console.error("Failed to fetch proof", error);
        } finally {
          setLoadingProof(false);
        }
      };
      fetchProof();
    }
  }, [delivery.uuid, status]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      toast.error("Please enter a valid delivery address.");
      return;
    }

    setIsSavingAddress(true);
    try {
      await api.put(`/customer/delivery/${delivery.uuid}/address`, {
        address: addressInput.trim(),
      });
      toast.success("Delivery address updated successfully");
      setCurrentAddress(addressInput.trim());
      setIsEditingAddress(false);
      if (onAddressUpdated) {
        onAddressUpdated();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update delivery address.";
      toast.error(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details`}>
      <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/80 p-6 rounded-3xl border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Order Number</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">#{orderNum}</h2>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <StatusBadge status={status} />
            <p className="text-xs font-bold text-gray-400">
              Placed on {new Date(delivery.created_at || delivery.scheduled_time || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex gap-4 group">
              <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Assigned Driver</p>
                <p className="text-base font-bold text-gray-800">{delivery.driver_name || 'Scheduling in progress...'}</p>
                {delivery.driver_phone && <p className="text-xs font-medium text-gray-500">{delivery.driver_phone}</p>}
              </div>
            </div>

            {/* Delivery Address Card with Update Option */}
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-indigo-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivery Address</p>
                      {canEditAddress && !isEditingAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddressInput(currentAddress);
                            setIsEditingAddress(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} /> Update
                        </button>
                      )}
                    </div>

                    {!isEditingAddress ? (
                      <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                        {currentAddress || 'Address on file'}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Inline Address Editor for Pending/Scheduled Delivery */}
              <AnimatePresence>
                {isEditingAddress && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSaveAddress}
                    className="mt-4 pt-4 border-t border-gray-100 space-y-3"
                  >
                    {savedAddresses.length > 0 && (
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                          Pick from Saved Locations:
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {savedAddresses.map((addr) => {
                            const fullAddr = addr.full_address || addr.address;
                            return (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => setAddressInput(fullAddr)}
                                className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                                  addressInput === fullAddr
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {addr.label || 'Saved Address'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <textarea
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                        placeholder="Enter updated delivery address"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingAddress ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Save Address</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 group">
              <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Package size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Package Info</p>
                <p className="text-base font-bold text-gray-800">{delivery.items_count || 1} Standard Package(s)</p>
                {delivery.package_type && <p className="text-xs font-medium text-gray-500 capitalize">{delivery.package_type}</p>}
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Scheduled Time</p>
                <p className="text-base font-bold text-gray-800 italic">
                  {delivery.scheduled_time 
                    ? new Date(delivery.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) 
                    : 'Awaiting Schedule'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Section */}
        {['delivered', 'failed', 'disputed'].includes(status) && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Delivery Proof & Authentication</h4>
            
            {loadingProof ? (
              <div className="flex items-center justify-center py-12 gap-3">
                 <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                 <span className="text-sm font-bold text-gray-400 animate-pulse">Retriving proof from archives...</span>
              </div>
            ) : proof ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proof.photoUrl && (
                  <div className="group">
                    <div className="flex items-center gap-2 mb-3 ml-1 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      <Camera size={12} className="text-indigo-400" /> Photo Confirmation
                    </div>
                    <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/20 border border-gray-100 ring-4 ring-white">
                      <img src={proof.photoUrl} alt="Delivery Proof" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                )}
                
                {proof.signature && (
                  <div className="group">
                    <div className="flex items-center gap-2 mb-3 ml-1 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      <PenTool size={12} className="text-indigo-400" /> Digital Signature
                    </div>
                    <div className="h-48 bg-gray-50 rounded-3xl p-6 flex flex-col items-center justify-center border border-gray-100 ring-4 ring-white">
                      <img src={proof.signature} alt="Signature" className="max-w-full max-h-full object-contain grayscale" />
                      <p className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Signed on {new Date(proof.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {proof.notes && (
                  <div className="md:col-span-2 bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/50 italic text-sm text-indigo-700 font-medium">
                    <p className="not-italic text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Driver Notes</p>
                    "{proof.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100 text-center">
                <p className="text-sm font-bold text-orange-600">No proof data was recorded for this delivery.</p>
                <p className="text-[10px] text-orange-400 font-bold mt-1 uppercase tracking-widest">Archive Reference: {orderNum}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 uppercase tracking-widest cursor-pointer"
          >
            Close Details
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;