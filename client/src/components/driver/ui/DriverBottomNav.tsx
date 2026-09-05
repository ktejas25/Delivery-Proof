import React from "react";
import { Navigation, History, DollarSign, User } from "lucide-react";
import { cn } from "../utils";

export type DriverTab = "route" | "history" | "earnings" | "profile";

interface DriverBottomNavProps {
  activeTab: DriverTab;
  onTabChange: (tab: DriverTab) => void;
  activeStopsCount?: number;
}

const DriverBottomNav: React.FC<DriverBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeStopsCount = 0,
}) => {
  const tabs: { id: DriverTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: "route",
      label: "Route",
      icon: Navigation,
      badge: activeStopsCount > 0 ? activeStopsCount : undefined,
    },
    {
      id: "history",
      label: "History",
      icon: History,
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: DollarSign,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Driver Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb"
    >
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative min-h-[48px] py-1.5 px-2 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              )}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-500"} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverBottomNav;
