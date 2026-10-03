import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Truck,
  ArrowRight,
} from 'lucide-react';

interface CustomerAIInsightsProps {
  activeDeliveries: any[];
  deliveredCount: number;
  savedAddressesCount: number;
  onNavigateTab: (tabId: string) => void;
  onTrackDelivery?: (delivery: any) => void;
}

export const CustomerAIInsights: React.FC<CustomerAIInsightsProps> = ({
  activeDeliveries,
  deliveredCount: _deliveredCount,
  savedAddressesCount,
  onNavigateTab,
  onTrackDelivery,
}) => {
  const latestActive = activeDeliveries[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Smart Delivery Intelligence</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                AI Assistant
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time route analytics & shipment verification
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Grid */}
      <div className="relative z-10 space-y-3">
        {/* Insight 1: Active Delivery ETA */}
        {latestActive ? (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Truck size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white truncate">
                  Package #{latestActive.order_number?.substring(0, 8)} in progress
                </p>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {latestActive.delivery_status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Driver <strong className="text-white font-semibold">{latestActive.driver_name || 'Assigned personnel'}</strong>{' '}
                is handling your package.
                {latestActive.estimated_arrival && (
                  <> Estimated arrival: <strong className="text-emerald-300 font-semibold">{new Date(latestActive.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.</>
                )}
              </p>
              {onTrackDelivery && (
                <button
                  onClick={() => onTrackDelivery(latestActive)}
                  className="mt-2 text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Open Live Map Radar <ArrowRight size={11} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">All Shipments Up to Date</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                You have no active pending dispatches right now. Past deliveries are archived below.
              </p>
            </div>
          </div>
        )}

        {/* Insight 2: Tamper-proof Verification */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Cryptographic Proof-of-Delivery</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Every package is verified with high-resolution photographic proof, digital recipient signature, and GPS coordinates.
            </p>
          </div>
        </div>

        {/* Insight 3: Address Flexibility */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Flexible Address Updating</p>
              <span className="text-[10px] text-slate-400">{savedAddressesCount} Saved</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Need to alter a drop-off location? You can update your delivery address directly in the portal prior to driver dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span>DeliveryProof AI Assistant v2.4</span>
        <button
          onClick={() => onNavigateTab('history')}
          className="text-indigo-400 hover:text-white font-bold transition-colors cursor-pointer"
        >
          View Full History &rarr;
        </button>
      </div>
    </div>
  );
};

export default CustomerAIInsights;
