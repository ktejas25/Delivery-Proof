import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: any;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, delivery }) => {
  const [issueType, setIssueType] = useState('not_received');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error('Details are mandatory for resolution.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/customer/dispute`, {
        delivery_uuid: delivery.uuid,
        issue_type: issueType,
        details: details
      });
      toast.success('Dispute filed. Our team will review this immediately.');
      onClose();
    } catch (error) {
      toast.error('Critical failure: Could not record dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`File a Formal Dispute`}>
      <div className="space-y-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Attention Required</p>
            <p className="text-[11px] text-red-500 font-bold leading-relaxed italic">
              Formal disputes initiate a security audit of this delivery. Please ensure all details are accurate. Reference ID: #{delivery.order_number?.substring(0, 8)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Reason for Dispute</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer"
            >
              <option value="not_received">Package Not Received</option>
              <option value="damaged">Damaged or Compromised Items</option>
              <option value="wrong_item">Incorrect Product Delivered</option>
              <option value="late">Severe Timeline Breach (Late)</option>
              <option value="other">Other Irregularities</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Incident Details</label>
            <textarea
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-3xl py-4 px-6 text-sm font-medium text-gray-700 focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-300 transition-all resize-none"
              placeholder="Describe what happened with as much detail as possible..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel Investigation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-200"
            >
              {loading ? 'Processing...' : 'Submit Official Report'}
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DisputeModal;
