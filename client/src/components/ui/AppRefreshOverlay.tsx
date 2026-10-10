import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface AppRefreshOverlayProps {
  /** If true, fills viewport. If false, acts as an absolute overlay within a relative parent. */
  fullScreen?: boolean;
  message?: string;
  submessage?: string;
  className?: string;
}

export const AppRefreshOverlay: React.FC<AppRefreshOverlayProps> = ({
  fullScreen = true,
  message = "Refreshing...",
  submessage = "Updating real-time data & system telemetry",
  className = ""
}) => {
  const [imgError, setImgError] = useState(false);

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
    : `absolute inset-0 z-40 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200 ${className}`;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex flex-col items-center max-w-sm px-8 py-7 bg-white/95 rounded-3xl shadow-2xl border border-slate-100 text-center relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Ambient Background Gradient Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo from public/ */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-emerald-950/15 border border-slate-100/80 bg-white flex items-center justify-center">
            {!imgError ? (
              <img
                src="/deliveryproof_app_icon_large_original.png"
                alt="DeliveryProof Logo"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <img
                src="/deliveryproof_logo_original.png"
                alt="DeliveryProof Logo"
                className="w-full h-full object-contain p-2"
              />
            )}
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="mb-3">
          <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">
            DeliveryProof
          </h2>
          <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
            Enterprise Suite
          </span>
        </div>

        {/* Refreshing Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mb-2">
          <RefreshCw size={13} className="animate-spin text-emerald-600" />
          <span className="text-xs font-bold tracking-wide">{message}</span>
        </div>

        {/* Optional Subtitle */}
        {submessage && (
          <p className="text-[11px] text-slate-500 font-medium max-w-[240px] leading-relaxed">
            {submessage}
          </p>
        )}

        {/* Sleek Progress Indeterminate Bar */}
        <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
          <div className="w-full h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AppRefreshOverlay;
