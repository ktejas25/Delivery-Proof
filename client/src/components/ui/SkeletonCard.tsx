import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 w-2/3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
        <div className="h-8 bg-gray-100 rounded w-24"></div>
        <div className="h-8 bg-gray-100 rounded w-24"></div>
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;
