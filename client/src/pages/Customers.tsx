import React, { useState, useEffect } from "react";
import api from "../services/api";
import { User, Phone, MapPin, Plus, X, Search, Edit2, Users, AlertCircle } from "lucide-react";

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    delivery_instructions: "",
    password: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (e) {
      console.error("Failed to fetch customers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      delivery_instructions: "",
      password: "",
    });
    setEditingId(null);
    setFormError("");
  };

  const handleEdit = (customer: any) => {
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      delivery_instructions: customer.delivery_instructions || "",
      password: "", // Don't pre-fill password
    });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post("/customers", form);
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-[#F8FAFC] min-h-full p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Customer Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage delivery client profiles, addresses, and customer portal accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            {customers.length} Registered Customers
          </span>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium px-1">
          Showing <strong>{filtered.length}</strong> of <strong>{customers.length}</strong> customers
        </div>
      </div>

      {/* Customer Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading customer directory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {search ? "No customers found" : "No customers registered yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {search
              ? "No customer profiles match your search criteria. Try a different query."
              : "Start by registering your first delivery client profile."}
          </p>
          {!search && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                      {customer.name
                        ? customer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "C"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {customer.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Customer"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {customer.total_orders || 0}
                  </span>
                  <span className="text-slate-500 font-medium">Orders</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    {(customer.preferred_language_code || "en").toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {editingId ? "Edit Customer Profile" : "Add New Customer"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingId
                      ? "Update existing recipient & portal credentials"
                      : "Register customer recipient and assign initial portal access"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Jane Doe"
                      required
                      autoComplete="off"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+1 (555) 012-3456"
                      autoComplete="off"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="customer@email.com"
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {editingId ? "Update Password" : "Initial Password"}
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder={editingId ? "Leave blank to keep" : "Min 8 chars"}
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  {editingId
                    ? "Leave password blank to preserve current credentials."
                    : "If email & password are provided, a customer portal login will be created requiring password reset on first login."}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="742 Evergreen Terrace, Springfield, OR"
                    required
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Delivery Instructions
                  </label>
                  <textarea
                    name="delivery_instructions"
                    value={form.delivery_instructions}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        delivery_instructions: e.target.value,
                      }))
                    }
                    placeholder="Gate code, side porch delivery, call on approach..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-y"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {formLoading
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
