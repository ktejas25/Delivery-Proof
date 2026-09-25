import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin, Tag, Check, Loader2 } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: any; // If provided, it's edit mode
}

const PRESET_LABELS = ['Home', 'Office', 'Apartment', 'Warehouse', 'Other'];

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSuccess, address }) => {
  const [label, setLabel] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(address && address.id);

  useEffect(() => {
    if (address) {
      setLabel(address.label || "");
      setFullAddress(address.address || address.full_address || "");
      setIsDefault(Boolean(address.is_default));
    } else {
      setLabel("Home");
      setFullAddress("");
      setIsDefault(false);
    }
  }, [address, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !fullAddress.trim()) {
      toast.error("Please provide both a label and an address.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // Edit mode
        await api.put(`/customer/address/${address.id}`, {
          label: label.trim(),
          address: fullAddress.trim(),
          is_default: isDefault
        });
        toast.success("Address updated successfully");
      } else {
        // Create mode
        await api.post("/customer/address", {
          label: label.trim(),
          address: fullAddress.trim(),
          is_default: isDefault,
          lat: 0,
          lng: 0
        });
        toast.success("Address added successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to save address. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Update Delivery Address" : "Add New Location"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-indigo-600" />
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Address Label
            </label>
          </div>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_LABELS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setLabel(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  label.toLowerCase() === preset.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="e.g. Home, Downtown Studio, Mom's House"
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-indigo-600" />
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Full Street Address
            </label>
          </div>
          <textarea
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
            placeholder="Flat 4B, Blue Horizon Tower, MG Road, Pune, Maharashtra 411001"
            rows={3}
            required
          />
          <p className="text-[11px] text-gray-400 font-medium mt-1.5">
            Include apartment/suite number, street name, and postal code for precise driver navigation.
          </p>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
              <Check size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">Set as Primary Address</p>
              <p className="text-[11px] text-gray-500 font-medium">Use this location as the default for upcoming shipments</p>
            </div>
          </div>
          <input
            type="checkbox"
            id="is_default"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-xs font-black uppercase tracking-wider text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEditMode ? (
              "Update Address"
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;
