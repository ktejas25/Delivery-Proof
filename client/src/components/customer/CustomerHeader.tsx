import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogOut,
  ChevronDown,
  Calendar,
  Shield,
  Truck,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import api from "../../services/api";

interface CustomerHeaderProps {
  user: any;
  deliveries?: any[];
  onSelectDelivery?: (delivery: any) => void;
  onViewRadar?: (delivery: any) => void;
  onNavigateTab?: (tabId: string) => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  user,
  deliveries: propDeliveries,
  onSelectDelivery,
  onViewRadar,
  onNavigateTab,
}) => {
  const { logout } = useAuth();
  const [upcomingOrdersCount, setUpcomingOrdersCount] = useState(0);
  const [internalDeliveries, setInternalDeliveries] = useState<any[]>([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUpcomingOrdersCount = async () => {
      try {
        const response = await api.get("/customer/upcoming-orders-count");
        setUpcomingOrdersCount(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching upcoming orders count:", error);
      }
    };
    fetchUpcomingOrdersCount();

    if (!propDeliveries) {
      api.get("/customer/deliveries")
        .then((res) => {
          if (Array.isArray(res.data)) setInternalDeliveries(res.data);
        })
        .catch(() => {});
    }
  }, [propDeliveries]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    user?.name ||
    (user?.first_name
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : null) ||
    user?.email?.split("@")[0] ||
    "Valued Customer";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand & Suite Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center border border-slate-100 shrink-0">
              <img
                src="/deliveryproof_app_icon_large_original.png"
                alt="DeliveryProof Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Delivery<span className="text-blue-600">Proof</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Customer Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Secure Track & Proof Verification Suite
              </p>
            </div>
          </div>

          {/* Center: Live Incoming Indicator */}
          <div className="hidden lg:flex items-center gap-2.5">
            {upcomingOrdersCount > 0 ? (
              <button
                onClick={() => onNavigateTab && onNavigateTab("active")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Truck size={14} className="text-emerald-600" />
                <span>
                  {upcomingOrdersCount} Active{' '}
                  {upcomingOrdersCount === 1 ? 'Shipment' : 'Shipments'}
                </span>
              </button>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Orders Delivered</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Calendar size={13} className="text-slate-400" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            <NotificationBell
              deliveries={propDeliveries || internalDeliveries}
              count={upcomingOrdersCount}
              onSelectDelivery={onSelectDelivery}
              onViewRadar={onViewRadar}
              onNavigateTab={onNavigateTab}
            />

            {/* User Dropdown */}
            <div ref={profileDropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {initials || "C"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    Customer Account
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-xl">
                    <p className="font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <Shield size={10} /> Verified Customer
                      </span>
                    </div>
                  </div>

                  {onNavigateTab && (
                    <div className="py-1 space-y-0.5 border-b border-slate-100 mb-1">
                      <button
                        onClick={() => {
                          onNavigateTab("addresses");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        Saved Drop-off Locations
                      </button>
                      <button
                        onClick={() => {
                          onNavigateTab("preferences");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        Delivery Preferences & Support
                      </button>
                    </div>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
