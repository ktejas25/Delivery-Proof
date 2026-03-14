import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface AddressCardProps {
  address: any;
  onEdit: () => void;
  onDelete: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FaMapMarkerAlt size={20} />
          </div>
          {address.is_default && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
              <FaCheckCircle size={10} /> Default
            </span>
          )}
        </div>
        
        <h4 className="text-lg font-bold text-gray-900 mb-1">{address.label || 'Home'}</h4>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          {address.full_address || address.address}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
        <button
          onClick={onEdit}
          data-tooltip-id="edit-address"
          data-tooltip-content="Edit Address"
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        >
          <FaEdit size={16} />
        </button>
        <button
          onClick={onDelete}
          data-tooltip-id="delete-address"
          data-tooltip-content="Delete Address"
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <FaTrash size={16} />
        </button>
        
        <Tooltip id="edit-address" />
        <Tooltip id="delete-address" />
      </div>
    </motion.div>
  );
};

export default AddressCard;
