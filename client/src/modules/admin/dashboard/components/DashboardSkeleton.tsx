import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-9 w-9 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-36"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart Skeleton */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[380px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-44"></div>
            <div className="h-8 bg-gray-100 rounded-lg w-32"></div>
          </div>
          <div className="h-64 bg-gray-50 rounded-xl flex items-end justify-between p-4 gap-2">
            {[40, 65, 30, 85, 90, 50, 75].map((h, idx) => (
              <div key={idx} className="w-full bg-gray-200 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        {/* AI Insights Skeleton */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="h-6 bg-gray-200 rounded w-36 mb-2"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet & Drivers Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[320px]">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
