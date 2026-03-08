import React, { useState } from "react";
import { X, User, Mail, Lock, Car, Key } from "lucide-react";
import api from "../services/api";

interface RegisterDriverModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterDriverModal: React.FC<RegisterDriverModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    vehicle_type: "car",
    license_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "license_number" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const indianVehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-HJ-NP-Z]{2}[0-9]{1,4}$/;

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!indianVehicleRegex.test(form.license_number.toUpperCase())) {
      setError("Invalid vehicle number. Example format: MH12AB1234");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/drivers", {
        ...form,
        license_number: form.license_number.toUpperCase(),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register driver");
    } finally {
      setLoading(false);
    }
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px 10px 38px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  };

  return (
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
          onClick={onClose}
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

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--bg-highlight)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <User size={24} color="var(--primary-mint)" />
          </div>
          <h3 style={{ marginBottom: "4px" }}>Register Driver</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Add a new driver to your fleet. They'll use these credentials to log
            in.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {/* Name row */}
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
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  display: "block",
                  color: "var(--text-muted)",
                }}
              >
                FIRST NAME
              </label>
              <div style={{ position: "relative" }}>
                <User size={14} style={iconStyle} />
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  display: "block",
                  color: "var(--text-muted)",
                }}
              >
                LAST NAME
              </label>
              <div style={{ position: "relative" }}>
                <User size={14} style={iconStyle} />
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={iconStyle} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="driver@company.com"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={iconStyle} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                style={inputStyle}
              />
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              Driver will use this to log in to the mobile app
            </p>
          </div>

          {/* Vehicle */}
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
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  display: "block",
                  color: "var(--text-muted)",
                }}
              >
                VEHICLE TYPE
              </label>
              <div style={{ position: "relative" }}>
                <Car size={14} style={iconStyle} />
                <select
                  name="vehicle_type"
                  value={form.vehicle_type}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle }}
                >
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  display: "block",
                  color: "var(--text-muted)",
                }}
              >
                LICENSE NUMBER
              </label>
              <div style={{ position: "relative" }}>
                <Key size={14} style={iconStyle} />
                <input
                  name="license_number"
                  value={form.license_number}
                  onChange={handleChange}
                  required
                  placeholder="MH12AB1234"
                  maxLength={10}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#fff1f0",
                border: "1px solid #ffa39e",
              }}
            >
              <p style={{ color: "#ff4d4f", fontSize: "13px", margin: 0 }}>
                ⚠ {error}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDriverModal;
