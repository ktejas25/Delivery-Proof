import React from "react";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  History,
  Home,
  HelpCircle,
  PackageCheck,
  X,
  LogOut,
  Shield,
} from "lucide-react";

export type CustomerTabId =
  | "overview"
  | "active"
  | "radar"
  | "history"
  | "addresses"
  | "preferences";

interface CustomerSidebarProps {
  activeTab: string;
  onTabChange: (tabId: CustomerTabId) => void;
  activeOrdersCount: number;
  totalOrdersCount: number;
  addressesCount: number;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeTab,
  onTabChange,
  activeOrdersCount,
  totalOrdersCount,
  addressesCount,
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const displayName =
    user?.name ||
    (user?.first_name
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : null) ||
    user?.email?.split("@")[0] ||
    "Customer";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSelectTab = (tabId: CustomerTabId) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-68 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          {/* Logo & Portal Branding */}
          <div className="flex items-center justify-between mb-7 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
                <PackageCheck size={22} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  Delivery<span className="text-blue-600">Proof</span>
                </h2>
                <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                  Customer Portal
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Categories */}
          <nav className="space-y-5">
            {/* Category: Command Center */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Command Center
              </span>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => handleSelectTab("overview")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      size={18}
                      className={
                        activeTab === "overview"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Overview</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Category: Shipments & Tracking */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Deliveries & Radar
              </span>
              <div className="mt-1.5 space-y-1">
                {/* Active Deliveries */}
                <button
                  onClick={() => handleSelectTab("active")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "active"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck
                      size={18}
                      className={
                        activeTab === "active"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Active Deliveries</span>
                  </div>
                  {activeOrdersCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                      {activeOrdersCount} Live
                    </span>
                  ) : null}
                </button>

                {/* Live Map Radar */}
                <button
                  onClick={() => handleSelectTab("radar")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "radar"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={18}
                      className={
                        activeTab === "radar"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Live Map Radar</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </button>

                {/* Order History */}
                <button
                  onClick={() => handleSelectTab("history")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History
                      size={18}
                      className={
                        activeTab === "history"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Order History</span>
                  </div>
                  {totalOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {totalOrdersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Category: Account & Preferences */}
            <div>
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Preferences
              </span>
              <div className="mt-1.5 space-y-1">
                {/* Saved Locations */}
                <button
                  onClick={() => handleSelectTab("addresses")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "addresses"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home
                      size={18}
                      className={
                        activeTab === "addresses"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Saved Locations</span>
                  </div>
                  {addressesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {addressesCount}
                    </span>
                  )}
                </button>

                {/* Preferences & Support */}
                <button
                  onClick={() => handleSelectTab("preferences")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === "preferences"
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle
                      size={18}
                      className={
                        activeTab === "preferences"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }
                    />
                    <span>Support & Notes</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: User Account & Sign Out */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {initials || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <Shield size={10} /> Verified Customer
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
