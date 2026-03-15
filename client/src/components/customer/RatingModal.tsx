import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import { motion } from 'framer-motion';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: any;
  onSuccess?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, delivery, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      await api.post("/customer/rate-driver", {
        delivery_id: delivery.uuid,
        rating,
        comment
      });
      toast.success('Thank you! Your feedback helps us improve.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const orderNum = delivery.order_number?.substring(0, 8) || 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delivery Review">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-yellow-100">
           <StarRating rating={rating} setRating={setRating} size={24} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">How was your delivery?</h3>
        <p className="text-gray-500 text-sm font-medium px-4">
          Share your experience for order <span className="text-indigo-600 font-bold">#{orderNum}</span>. 
          It only takes a minute!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 text-center">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Select Rating</label>
          <div className="flex justify-center">
            <StarRating rating={rating} setRating={setRating} size={48} />
          </div>
          <div className="mt-4 h-6">
            <p className="text-sm font-bold text-gray-700">
              {rating === 1 && "Disappointing"}
              {rating === 2 && "Could be better"}
              {rating === 3 && "Good experience"}
              {rating === 4 && "Great job!"}
              {rating === 5 && "Exceptional service!"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Additional Comments</label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 p-4 transition-all duration-300 resize-none font-medium placeholder:text-gray-300"
            placeholder="Tell us what went well or how we can improve..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 text-sm font-black text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
          >
            Not Now
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-[2] px-8 py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-200 active:shadow-inner"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default RatingModal;