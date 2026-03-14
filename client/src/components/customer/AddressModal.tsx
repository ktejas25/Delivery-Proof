import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: any; // If provided, it's edit mode
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSuccess, address }) => {
  const [label, setLabel] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setLabel(address.label || "");
      setFullAddress(address.address || address.full_address || "");
      setIsDefault(!!address.is_default);
    } else {
      setLabel("");
      setFullAddress("");
      setIsDefault(false);
    }
  }, [address, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !fullAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (address) {
        // Edit mode
        await api.put(`/customer/address/${address.id}`, {
          label,
          address: fullAddress,
          is_default: isDefault
        });
        toast.success("Address updated successfully");
      } else {
        // Create mode
        await api.post("/customer/address", {
          label,
          address: fullAddress,
          is_default: isDefault,
          lat: 0, // Default for now
          lng: 0
        });
        toast.success("Address added successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={address ? "Edit Address" : "Add New Address"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Home, Office)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
            placeholder="Home"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
          <textarea
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
            placeholder="123 Main St, App 4B, City, ZIP"
            rows={3}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_default"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="is_default" className="text-sm font-medium text-gray-700">Set as default delivery address</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-100"
          >
            {loading ? "Saving..." : address ? "Update Address" : "Save Address"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;
