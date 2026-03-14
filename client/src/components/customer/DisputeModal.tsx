import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
      toast.error('Please provide details about the issue');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/customer/dispute`, {
        delivery_uuid: delivery.uuid,
        issue_type: issueType,
        details: details
      });
      toast.success('Dispute submitted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to submit dispute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dispute Order #${delivery.order_number?.substring(0, 8)}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 bg-white border"
          >
            <option value="not_received">Not Received</option>
            <option value="damaged">Damaged Items</option>
            <option value="wrong_item">Wrong Items</option>
            <option value="late">Late Delivery</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <textarea
            required
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
            placeholder="Please describe the issue in detail..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DisputeModal;
