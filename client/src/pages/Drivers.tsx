import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import {
  Star,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Truck,
  Plus,
  Search,
} from "lucide-react";
import RegisterDriverModal from "../components/RegisterDriverModal";
import DriverPerformanceModal from "../components/DriverPerformanceModal";

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<{
    uuid: string;
    name: string;
  } | null>(null);
  const pollingRef = useRef<any>(null);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/auth/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    pollingRef.current = setInterval(fetchDrivers, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: "Available",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "on_delivery":
        return {
          label: "On Delivery",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "break":
        return {
          label: "On Break",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "offline":
      default:
        return {
          label: "Offline",
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const filtered = drivers.filter((driver) => {
    const name = `${driver.first_name || ""} ${driver.last_name || ""}`.toLowerCase();
    const email = (driver.email || "").toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (driver.status || "offline") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineDriversCount = drivers.filter(
    (d) => d.status === "available" || d.status === "on_delivery",
  ).length;

  return (
    <div className="bg-[#F8FAFC] min-h-full p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Fleet & Driver Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time active driver roster, vehicle tracking, and performance monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {onlineDriversCount} / {drivers.length} Drivers Online
          </span>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} /> Register Driver
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search driver by name, email, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({drivers.length})</option>
            <option value="available">Available</option>
            <option value="on_delivery">On Delivery</option>
            <option value="break">On Break</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Driver Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading fleet roster...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Truck size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {search ? "No drivers match your search" : "No drivers registered"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {search
              ? "Try adjusting your search query or filter."
              : "Register your first fleet driver to start dispatching orders."}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Register First Driver
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((driver) => {
            const status = driver.status || "offline";
            const statusBadge = getStatusBadge(status);
            const proofScore = Number(driver.avg_proof_score) || 92;
            const hasDisputes = driver.disputes_count > 0;

            return (
              <div
                key={driver.uuid}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between relative"
              >
                {/* Dispute Warning Ribbon */}
                {hasDisputes && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <AlertTriangle size={11} /> {driver.disputes_count} Dispute
                  </div>
                )}

                <div>
                  {/* Driver Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                        {driver.first_name?.[0]}
                        {driver.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {driver.first_name} {driver.last_name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{driver.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Rating
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{parseFloat(driver.avg_rating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Proof Score
                      </span>
                      <div className="flex items-center gap-1 font-bold text-emerald-600">
                        <ShieldCheck size={13} />
                        <span>{proofScore.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Last GPS Coordinate
                      </span>
                      <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span>
                          {driver.last_location_lat && driver.last_location_lng
                            ? `${parseFloat(driver.last_location_lat).toFixed(4)}, ${parseFloat(driver.last_location_lng).toFixed(4)}`
                            : "No GPS fix"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() =>
                    setSelectedDriver({
                      uuid: driver.uuid,
                      name: `${driver.first_name} ${driver.last_name}`,
                    })
                  }
                  className="w-full mt-2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp size={14} className="text-blue-600" />
                  View Performance History
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <RegisterDriverModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDrivers();
          }}
        />
      )}

      {selectedDriver && (
        <DriverPerformanceModal
          key={selectedDriver.uuid}
          driverUuid={selectedDriver.uuid}
          driverName={selectedDriver.name}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
};

export default Drivers;
