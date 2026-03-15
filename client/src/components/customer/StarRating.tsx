import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 32 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-colors duration-200 outline-none focus:outline-none`}
        >
          <FaStar 
            size={size} 
            className={`${
              star <= (hover || rating)
                ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                : "text-gray-200"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating;