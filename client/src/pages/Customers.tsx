import React, { useState, useEffect } from "react";
import api from "../services/api";
import { User, Phone, MapPin, Plus, X, Search, Edit2 } from "lucide-react";

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
      console.error("Failed to fetch customers");
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Customers</h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            {customers.length} total customers
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div
        style={{
          position: "relative",
          marginBottom: "24px",
          maxWidth: "400px",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: "36px" }}
        />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          Loading customers...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "60px 20px" }}
        >
          <User size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ color: "var(--text-muted)" }}>
            {search
              ? "No customers match your search."
              : "No customers yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="card"
              style={{ gridColumn: "span 4" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--bg-highlight)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={24} color="var(--primary-mint)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {customer.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {customer.email}
                  </p>
                </div>
                <button 
                  onClick={() => handleEdit(customer)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', opacity: 0.6 }}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {customer.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <MapPin
                      size={14}
                      color="var(--text-muted)"
                      style={{ marginTop: "2px", flexShrink: 0 }}
                    />
                    <span style={{ color: "var(--text-muted)" }}>
                      {customer.address}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "var(--bg-secondary)",
                  borderRadius: "10px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: 700 }}>
                    {customer.total_orders || 0}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Orders
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: customer.preferred_language_code
                        ? "var(--primary-mint)"
                        : "var(--text-muted)",
                    }}
                  >
                    {(customer.preferred_language_code || "en").toUpperCase()}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Language
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#2BB673",
                      margin: "4px auto 6px",
                    }}
                  ></div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Active
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: "480px", position: "relative" }}
          >
            <button
              onClick={() => {
                resetForm();
                setShowModal(false);
              }}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>
            <h3 style={{ marginBottom: "6px" }}>
              {editingId ? "Edit Customer" : "Add Customer"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "24px",
              }}
            >
              {editingId
                ? "Update existing customer details"
                : "Add a new delivery recipient to your system"}
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="John Doe"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+1 555 0100"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    {editingId ? "Update Password" : "Initial Password"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Min 6 chars"
                    style={inputStyle}
                  />
                </div>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "-8px",
                }}
              >
                {editingId
                  ? "Leave blank to keep existing password."
                  : "If provided, a login account will be created for the customer."}
              </p>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Delivery Address *
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="123 Main St, City, State"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Delivery Instructions
                </label>
                <textarea
                  value={form.delivery_instructions}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      delivery_instructions: e.target.value,
                    }))
                  }
                  placeholder="Leave at door, call when arriving..."
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              {formError && (
                <p style={{ color: "#ff4d4f", fontSize: "14px" }}>
                  {formError}
                </p>
              )}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "white",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={formLoading}
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
      )}
    </div>
  );
};

export default Customers;
