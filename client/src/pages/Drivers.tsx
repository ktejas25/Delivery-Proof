import React, { useEffect, useState } from "react";
import api from "../services/api";
import { User, Star, MapPin } from "lucide-react";
import RegisterDriverModal from "../components/RegisterDriverModal";

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/auth/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return { bg: "#E9F7EF", color: "#2BB673" };
      case "on_delivery":
        return { bg: "#FFF7E6", color: "#FA8C16" };
      case "break":
        return { bg: "#E6F7FF", color: "#1890FF" };
      case "offline":
      default:
        return { bg: "#FFF1F0", color: "#FF4D4F" };
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Driver Fleet</h2>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Register Driver
        </button>
      </div>

      {/* DRIVER GRID */}
      <div className="dashboard-grid">
        {drivers.map((driver) => {
          const status = driver.status || "offline";
          const statusColor = getStatusColor(status);

          return (
            <div
              key={driver.uuid}
              className="card"
              style={{ gridColumn: "span 4" }}
            >
              {/* DRIVER HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
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
                  }}
                >
                  <User size={24} color="var(--primary-mint)" />
                </div>

                <div>
                  <h3 style={{ fontSize: "18px", marginBottom: "2px" }}>
                    {driver.first_name} {driver.last_name}
                  </h3>

                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                    }}
                  >
                    ID: {driver.uuid?.slice(0, 8)}
                  </p>
                </div>

                {/* STATUS BADGE */}
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: statusColor.bg,
                      color: statusColor.color,
                    }}
                  >
                    {status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* DRIVER DETAILS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "16px",
                  padding: "16px",
                  background: "var(--bg-secondary)",
                  borderRadius: "12px",
                }}
              >
                {/* RATING */}
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Rating
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Star size={14} fill="#FFC107" stroke="#FFC107" />

                    <span style={{ fontWeight: 600 }}>
                      {driver.avg_rating ?? "0.0"}
                    </span>
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Location
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MapPin size={14} color="var(--primary-mint)" />

                    <span style={{ fontSize: "13px" }}>
                      {driver.last_location_lat && driver.last_location_lng
                        ? `${driver.last_location_lat}, ${driver.last_location_lng}`
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div style={{ marginTop: "20px" }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: "white",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  View Performance History
                </button>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {drivers.length === 0 && (
          <div
            style={{
              gridColumn: "span 12",
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
            }}
          >
            <User size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />

            <p style={{ marginBottom: "16px" }}>
              No drivers yet. Register your first driver!
            </p>
          </div>
        )}
      </div>

      {/* REGISTER MODAL */}
      {showModal && (
        <RegisterDriverModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDrivers();
          }}
        />
      )}
    </div>
  );
};

export default Drivers;