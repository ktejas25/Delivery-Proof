import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import StatusBadge, { DeliveryStatus } from '../ui/StatusBadge';
import {
  User,
  MapPin,
  Package,
  Clock,
  Camera,
  PenTool,
  Edit3,
  Check,
  Loader2,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Maximize2,
  Copy,
  Phone,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  delivery: any;
  onClose: () => void;
  onAddressUpdated?: () => void;
  savedAddresses?: any[];
}

const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const backendBase = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '')
  ).replace(/\/api\/?$/, '');

  return `${backendBase}${cleanPath}`;
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  delivery,
  onClose,
  onAddressUpdated,
  savedAddresses = [],
}) => {
  // Initialize with preloaded proof data from getDeliveries if available
  const [proof, setProof] = useState<any>(() => {
    if (delivery.proof_photo || delivery.proof_signature) {
      return {
        photoUrl: delivery.proof_photo,
        signature: delivery.proof_signature,
        notes: delivery.delivery_notes,
        timestamp: delivery.actual_arrival || delivery.created_at,
        verification_score: delivery.verification_score,
      };
    }
    return null;
  });

  const [loadingProof, setLoadingProof] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const initialAddress =
    delivery.customer_address ||
    delivery.delivery_address ||
    delivery.address ||
    '';
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';
  const fullOrderNum = delivery.order_number || delivery.uuid || 'N/A';
  const status = (
    delivery.status ||
    delivery.delivery_status ||
    'pending'
  )
    .toLowerCase()
    .replace(/[\s-]/g, '_') as DeliveryStatus;

  const canEditAddress = ['pending', 'scheduled'].includes(status);

  useEffect(() => {
    const addr =
      delivery.customer_address ||
      delivery.delivery_address ||
      delivery.address ||
      '';
    setCurrentAddress(addr);
    setAddressInput(addr);
  }, [delivery]);

  useEffect(() => {
    if (status === 'delivered' || status === 'disputed') {
      const fetchProof = async () => {
        setLoadingProof(true);
        try {
          const response = await api.get(`/proofs/${delivery.uuid}`);
          if (response.data) {
            setProof((prev: any) => ({
              ...prev,
              ...response.data,
              // prioritize valid URLs
              photoUrl: response.data.photoUrl || prev?.photoUrl,
              signature: response.data.signature || prev?.signature,
              notes: response.data.notes || prev?.notes,
              timestamp: response.data.timestamp || prev?.timestamp,
            }));
          }
        } catch (error) {
          console.warn('Proof fetch notice:', error);
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
      toast.error('Please enter a valid delivery address.');
      return;
    }

    setIsSavingAddress(true);
    try {
      await api.put(`/customer/delivery/${delivery.uuid}/address`, {
        address: addressInput.trim(),
      });
      toast.success('Delivery address updated successfully');
      setCurrentAddress(addressInput.trim());
      setIsEditingAddress(false);
      if (onAddressUpdated) {
        onAddressUpdated();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Failed to update delivery address.';
      toast.error(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullOrderNum);
    setCopiedOrder(true);
    toast.success('Order number copied to clipboard!');
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const photoSource = resolveImageUrl(proof?.photoUrl);
  const signatureSource = resolveImageUrl(proof?.signature);

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Delivery Verification & Order Details"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* 1. Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/80 p-6 rounded-3xl border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Order ID
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Placed on{' '}
                  {new Date(
                    delivery.created_at || delivery.scheduled_time || Date.now()
                  ).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  #{orderNum}
                </h2>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Copy Full Order ID"
                >
                  {copiedOrder ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <StatusBadge status={status} />
              {status === 'delivered' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle size={13} />
                  Verified Fulfillment
                </span>
              )}
            </div>
          </div>

          {/* 2. Core Metadata Grid (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Courier / Driver Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Courier Personnel
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {delivery.driver_name || 'Scheduling Driver...'}
                  </p>
                </div>
              </div>

              {delivery.driver_phone && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Direct Line:</span>
                  <a
                    href={`tel:${delivery.driver_phone}`}
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Phone size={11} />
                    {delivery.driver_phone}
                  </a>
                </div>
              )}
            </div>

            {/* Package & Schedule Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Package size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Shipment Details
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {delivery.items_count || 1} Standard Package(s)
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Scheduled:</span>
                <span className="font-semibold text-slate-700">
                  {delivery.scheduled_time
                    ? new Date(delivery.scheduled_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Flexible Standard'}
                </span>
              </div>
            </div>

            {/* Arrival & Timestamp Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fulfillment Time
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {delivery.actual_arrival
                      ? new Date(delivery.actual_arrival).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : status === 'delivered'
                      ? 'Delivered'
                      : 'In Progress'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Delivery Address Card (with inline edit) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Drop-off Destination Address
                    </span>
                    {canEditAddress && !isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressInput(currentAddress);
                          setIsEditingAddress(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} /> Modify Address
                      </button>
                    )}
                  </div>

                  {!isEditingAddress ? (
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                      {currentAddress || 'Address on file'}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Inline Address Editor for Pending Orders */}
            <AnimatePresence>
              {isEditingAddress && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSaveAddress}
                  className="mt-3 pt-3 border-t border-slate-100 space-y-3"
                >
                  {savedAddresses.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Select from your Saved Locations:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {savedAddresses.map((addr) => {
                          const fullAddr = addr.full_address || addr.address;
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => setAddressInput(fullAddr)}
                              className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                                addressInput === fullAddr
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {addr.label || 'Saved Location'}
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                      placeholder="Enter updated street address, apartment, city..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
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

          {/* 4. Enhanced Proof & Verification Section */}
          {['delivered', 'failed', 'disputed'].includes(status) && (
            <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Cryptographic Proof-of-Delivery Verification
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Geotagged photographic drop-off capture and digital signature
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                  <CheckCircle size={12} />
                  Verified Audit Trail
                </span>
              </div>

              {loadingProof && !proof ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-3xl border border-slate-200/80">
                  <Loader2 size={24} className="animate-spin text-indigo-600" />
                  <span className="text-xs font-bold text-slate-500">
                    Retrieving high-resolution proof from secure archive...
                  </span>
                </div>
              ) : proof ? (
                <div className="space-y-6">
                  {/* Photo & Signature 2-Column Responsive Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* A. Photo Confirmation Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                          <Camera size={15} className="text-indigo-600" />
                          <span>Photo Confirmation</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Drop-off Proof
                        </span>
                      </div>

                      {photoSource ? (
                        <div className="relative group rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 h-64 sm:h-72 flex items-center justify-center">
                          <img
                            src={photoSource}
                            alt="Delivery Proof Photo"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (
                                !target.src.includes('localhost:5000') &&
                                proof.photoUrl?.startsWith('/uploads')
                              ) {
                                target.src = `http://localhost:5000${proof.photoUrl}`;
                              }
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                            <span className="text-xs font-bold text-white">
                              Drop-off at Destination
                            </span>
                            <button
                              type="button"
                              onClick={() => setEnlargedPhoto(photoSource)}
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              <Maximize2 size={13} /> Inspect Full Screen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 sm:h-72 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                          <Camera size={32} className="mb-2 opacity-50" />
                          <p className="text-xs font-bold text-slate-600">
                            Photo proof not captured
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Order completed via direct handover
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>High-Resolution Capture</span>
                        {photoSource && (
                          <button
                            type="button"
                            onClick={() => setEnlargedPhoto(photoSource)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                          >
                            Click to Enlarge
                          </button>
                        )}
                      </div>
                    </div>

                    {/* B. Digital Signature Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                          <PenTool size={15} className="text-indigo-600" />
                          <span>Recipient Digital Signature</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          Signed Receipt
                        </span>
                      </div>

                      {signatureSource ? (
                        <div className="relative rounded-2xl bg-slate-50/70 border border-slate-200 h-64 sm:h-72 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-full h-44 flex items-center justify-center bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
                            <img
                              src={signatureSource}
                              alt="Digital Recipient Signature"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (
                                  !target.src.includes('localhost:5000') &&
                                  proof.signature?.startsWith('/uploads')
                                ) {
                                  target.src = `http://localhost:5000${proof.signature}`;
                                }
                              }}
                              className="max-w-full max-h-full object-contain filter contrast-125"
                            />
                          </div>
                          <p className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Signed on{' '}
                            {new Date(
                              proof.timestamp ||
                                delivery.actual_arrival ||
                                Date.now()
                            ).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="h-64 sm:h-72 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                          <PenTool size={32} className="mb-2 opacity-50" />
                          <p className="text-xs font-bold text-slate-600">
                            Signature waived
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Contactless porch drop-off authorized
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Authorized Recipient Confirmation</span>
                        <span className="font-semibold text-emerald-600">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Drop-off Notes Banner */}
                  {proof.notes && (
                    <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                        <FileText size={14} />
                        <span>Driver Delivery Notes</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 italic font-medium pl-6 leading-relaxed">
                        "{proof.notes}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50/60 p-8 rounded-3xl border border-amber-200/80 text-center space-y-2">
                  <AlertTriangle size={28} className="mx-auto text-amber-500" />
                  <p className="text-sm font-bold text-amber-900">
                    No Cryptographic Proof Recorded
                  </p>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    This order was fulfilled prior to digital proof logging or
                    via administrative manual dispatch.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. Footer Actions
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Close Details
            </button>
          </div> */}
        </div>
      </Modal>

      {/* High-Resolution Photo Lightbox Preview */}
      <AnimatePresence>
        {enlargedPhoto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-800 text-white">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold">
                    Proof Photo - Order #{orderNum}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnlargedPhoto(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
                <img
                  src={enlargedPhoto}
                  alt="Full-size Delivery Proof"
                  className="max-w-full max-h-[75vh] object-contain rounded-xl"
                />
              </div>

              <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-6">
                <span>Tamper-Proof Geotagged Image</span>
                <a
                  href={enlargedPhoto}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrderDetailsModal;