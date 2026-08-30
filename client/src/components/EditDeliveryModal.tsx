import React, { useState, useEffect } from "react";
import { X, Edit3, AlertCircle } from "lucide-react";
import api from "../services/api";

interface EditDeliveryModalProps {
  deliveryUuid: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({
  deliveryUuid,
  onClose,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_id: "",
    order_number: "",
    scheduled_time: "",
    priority_level: "medium",
    delivery_notes: "",
    driver_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, d, delivery] = await Promise.all([
          api.get("/customers").catch(() => ({ data: [] })),
          api.get("/auth/drivers").catch(() => ({ data: [] })),
          api.get(`/deliveries/${deliveryUuid}`),
        ]);
        setCustomers(c.data);
        setDrivers(d.data);

        const dlv = delivery.data;
        let formattedDate = "";
        if (dlv.scheduled_time) {
          const date = new Date(dlv.scheduled_time);
          formattedDate = date.toISOString().slice(0, 16);
        }

        setForm({
          customer_id: dlv.customer_id,
          order_number: dlv.order_number,
          scheduled_time: formattedDate,
          priority_level: dlv.priority_level || "medium",
          delivery_notes: dlv.delivery_notes || "",
          driver_id: dlv.driver_id || "",
        });
      } catch (err: any) {
        setError("Failed to load delivery data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [deliveryUuid]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { order_number: _, ...payload } = form;
      await api.put(`/deliveries/${deliveryUuid}`, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Edit Order #{form.order_number || "Details"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update delivery assignment, schedule, and notes
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
        <div className="p-6 overflow-y-auto flex-1">
          {fetching ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading order details...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Order Identifier
                </label>
                <input
                  name="order_number"
                  type="text"
                  value={form.order_number}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  name="customer_id"
                  value={form.customer_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Driver
                  </label>
                  <select
                    name="driver_id"
                    value={form.driver_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.first_name} {d.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    name="priority_level"
                    value={form.priority_level}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  >
                    <option value="low">Standard / Low</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">Express / High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Time <span className="text-red-500">*</span>
                </label>
                <input
                  name="scheduled_time"
                  type="datetime-local"
                  value={form.scheduled_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Notes
                </label>
                <textarea
                  name="delivery_notes"
                  value={form.delivery_notes}
                  onChange={handleChange}
                  placeholder="Instructions for courier..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-y"
                />
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
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDeliveryModal;
