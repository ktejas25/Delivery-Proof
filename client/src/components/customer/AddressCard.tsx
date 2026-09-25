import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface AddressCardProps {
  address: any;
  onEdit: () => void;
  onDelete: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
  const tooltipEditId = `edit-address-${address.id}`;
  const tooltipDeleteId = `delete-address-${address.id}`;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)' }}
      className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex flex-col justify-between transition-all group hover:border-indigo-100"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin size={22} />
          </div>
          {address.is_default ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              <CheckCircle2 size={13} className="text-emerald-600" /> Default
            </span>
          ) : null}
        </div>
        
        <h4 className="text-xl font-black text-gray-900 mb-2">{address.label || 'Saved Location'}</h4>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
          {address.full_address || address.address}
        </p>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        <button
          onClick={onEdit}
          data-tooltip-id={tooltipEditId}
          data-tooltip-content="Update details for this address"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
        >
          <Edit size={14} /> Edit Address
        </button>

        <button
          onClick={onDelete}
          data-tooltip-id={tooltipDeleteId}
          data-tooltip-content="Delete address"
          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
        
        <Tooltip id={tooltipEditId} />
        <Tooltip id={tooltipDeleteId} />
      </div>
    </motion.div>
  );
};

export default AddressCard;
