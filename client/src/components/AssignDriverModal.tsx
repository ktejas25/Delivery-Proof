import React, { useState, useEffect } from "react";
import { X, Truck, AlertCircle } from "lucide-react";
import api from "../services/api";

interface AssignDriverModalProps {
  deliveryUuid: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  deliveryUuid,
  onClose,
  onSuccess,
}) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, delivery] = await Promise.all([
          api.get("/auth/drivers").catch(() => ({ data: [] })),
          api.get(`/deliveries/${deliveryUuid}`),
        ]);
        setDrivers(d.data);
        setSelectedDriverId(delivery.data.driver_id || "");
      } catch (err: any) {
        setError("Failed to load driver roster");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [deliveryUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.patch(`/deliveries/${deliveryUuid}/driver`, {
        driver_id: selectedDriverId || null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Assign Fleet Driver
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch an active driver to this delivery order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {fetching ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading active drivers...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Fleet Driver
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="">Unassigned (Return to Queue)</option>
                  {drivers.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.first_name} {d.last_name} ({d.status?.toUpperCase() || "OFFLINE"})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;
