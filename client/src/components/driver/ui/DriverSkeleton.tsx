import React from "react";

const DriverSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-pulse">
      {/* Sidebar Skeleton (desktop) */}
      <div className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-200 p-5 flex-col justify-between flex-shrink-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="w-24 h-4 bg-slate-200 rounded-md" />
              <div className="w-16 h-3 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-10 bg-slate-100 rounded-xl" />
            <div className="w-full h-10 bg-slate-100 rounded-xl" />
            <div className="w-full h-10 bg-slate-100 rounded-xl" />
            <div className="w-full h-10 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="p-3 bg-slate-100 rounded-xl h-14" />
      </div>

      {/* Main Container Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="w-32 h-5 bg-slate-200 rounded-md" />
          <div className="w-20 h-7 bg-slate-200 rounded-full" />
        </div>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          {/* Search Bar Skeleton */}
          <div className="w-full h-11 bg-slate-200 rounded-xl" />

          {/* Route Progress Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between">
              <div className="w-28 h-4 bg-slate-200 rounded-md" />
              <div className="w-24 h-4 bg-slate-200 rounded-md" />
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full" />
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div className="h-4 bg-slate-100 rounded-md" />
              <div className="h-4 bg-slate-100 rounded-md" />
              <div className="h-4 bg-slate-100 rounded-md" />
            </div>
          </div>

          {/* Next Delivery Hero Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="p-4 border-b border-slate-100 flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="w-32 h-4 bg-slate-200 rounded-md" />
                  <div className="w-20 h-3 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="w-16 h-6 bg-slate-200 rounded-full" />
            </div>
            <div className="h-44 bg-slate-200" />
            <div className="p-4 space-y-3">
              <div className="w-full h-10 bg-slate-100 rounded-xl" />
              <div className="w-full h-12 bg-blue-200 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverSkeleton;
