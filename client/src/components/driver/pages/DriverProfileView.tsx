import React, { useState, memo } from "react";
import {
  User,
  Mail,
  Phone,
  Truck,
  ShieldCheck,
  LogOut,
  Compass,
} from "lucide-react";

import { GPSStatus } from "../types";
import { cn } from "../utils";
import toast from "react-hot-toast";

interface DriverProfileViewProps {
  driverName: string;
  email?: string;
  phone?: string;
  gpsStatus: GPSStatus;
  isOnline: boolean;
  onLogout: () => void;
}

type DutyStatus = "available" | "break" | "off_duty";

const DriverProfileView: React.FC<DriverProfileViewProps> = memo(
  ({
    driverName,
    email = "driver@deliveryproof.io",
    phone = "+91 98201 12345",
    gpsStatus,
    isOnline,
    onLogout,
  }) => {
    const [dutyStatus, setDutyStatus] = useState<DutyStatus>("available");

    const handleDutyChange = (status: DutyStatus) => {
      setDutyStatus(status);
      const labels: Record<DutyStatus, string> = {
        available: "Status set to Available",
        break: "Driver paused for Break",
        off_duty: "Status set to Off-Duty",
      };
      toast.success(labels[status]);
    };

    return (
      <div className="space-y-4">
        {/* Driver Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs flex-shrink-0">
              {driverName ? driverName.charAt(0).toUpperCase() : <User size={24} />}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {driverName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Active Driver
                </span>
                <span className="text-slate-300">•</span>
                <span className={cn("text-xs font-semibold flex items-center gap-1", isOnline ? "text-emerald-600" : "text-slate-500")}>
                  <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-400")} />
                  {isOnline ? "Online" : "Offline"}
                </span>

              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600 p-2 bg-slate-50 rounded-xl">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{email}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 p-2 bg-slate-50 rounded-xl">
              <Phone size={15} className="text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{phone}</span>
            </div>
          </div>
        </div>

        {/* Working Status Toggle */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Duty Status
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "available",
                label: "Available",
                sub: "Ready for drops",
                color: "bg-emerald-600 text-white border-emerald-600",
                inactiveColor: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200",
              },
              {
                id: "break",
                label: "On Break",
                sub: "Short pause",
                color: "bg-amber-500 text-white border-amber-500",
                inactiveColor: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200",
              },
              {
                id: "off_duty",
                label: "Off-Duty",
                sub: "Shift paused",
                color: "bg-slate-800 text-white border-slate-800",
                inactiveColor: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200",
              },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleDutyChange(option.id as DutyStatus)}
                className={cn(
                  "min-h-[44px] p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5",
                  dutyStatus === option.id ? option.color : option.inactiveColor
                )}
              >
                <span className="text-xs font-bold">{option.label}</span>
                <span className="text-[10px] opacity-80">{option.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Vehicle Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={14} className="text-blue-600" />
              Vehicle Information
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Assigned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Vehicle Model</span>
              <span className="font-bold text-slate-800 text-sm">Delivery Van</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">License Plate</span>
              <span className="font-mono font-bold text-slate-800 text-sm">MH12-DP-2026</span>
            </div>
          </div>
        </div>

        {/* Live GPS Diagnostics Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-indigo-600" />
              GPS Diagnostics
            </h3>
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full capitalize flex items-center gap-1",
                gpsStatus === "live"
                  ? "bg-emerald-50 text-emerald-700"
                  : gpsStatus === "connecting"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  gpsStatus === "live" ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {gpsStatus}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Coordinates Service</span>
              <span className="font-mono font-bold text-slate-800">
                18.5204° N, 73.8567° E
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Location Accuracy</span>
              <span className="font-bold text-emerald-700">High Precision (± 8m)</span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full min-h-[48px] bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogOut size={16} />
            <span>Sign Out of Driver Account</span>
          </button>
        </div>
      </div>
    );
  }
);

DriverProfileView.displayName = "DriverProfileView";

export default DriverProfileView;
