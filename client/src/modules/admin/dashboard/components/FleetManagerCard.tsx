import React from 'react';
import { Shield } from 'lucide-react';

interface FleetManagerCardProps {
  user: any;
  totalDrivers: number;
  totalCustomers: number;
}

export const FleetManagerCard: React.FC<FleetManagerCardProps> = ({
  user,
  totalDrivers,
  totalCustomers
}) => {
  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || user?.email?.split('@')[0] || 'Administrator';
  const roleTitle = user?.user_type === 'admin' ? 'Enterprise Operations Director' : 'Fleet & Logistics Manager';

  return (
    <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Duty Active
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center font-black text-emerald-400 text-lg">
              {displayName.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">{displayName}</h4>
            <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
              <Shield size={12} className="text-emerald-400" />
              {roleTitle}
            </p>
            <p className="text-[11px] text-gray-400">{user?.business_name || 'DeliveryProof Enterprise'}</p>
          </div>
        </div>

        {/* Fleet & Team Scope */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Assigned Fleet</span>
            <span className="text-xl font-black text-white">{totalDrivers} Drivers</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Client Accounts</span>
            <span className="text-xl font-black text-white">{totalCustomers} Accounts</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span className="text-emerald-400 font-medium">RBAC Security Level: Root Admin</span>
        <span className="text-gray-300 font-mono text-[11px]">ID: #{user?.id || '101'}</span>
      </div>
    </div>
  );
};
