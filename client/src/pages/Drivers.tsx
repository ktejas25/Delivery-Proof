import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import {
  User,
  Star,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import RegisterDriverModal from "../components/RegisterDriverModal";
import DriverPerformanceModal from "../components/DriverPerformanceModal";

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
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
    }
  };

  useEffect(() => {
    fetchDrivers();

    // Polling every 10 seconds (Section 7)
    pollingRef.current = setInterval(fetchDrivers, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
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

  const getProofScoreColor = (score: number) => {
    if (score >= 80) return { bg: "#E9F7EF", color: "#2BB673" };
    if (score >= 60) return { bg: "#FFF7E6", color: "#FA8C16" };
    return { bg: "#FFF1F0", color: "#FF4D4F" };
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
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>
          Driver Fleet
        </h2>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Register Driver
        </button>
      </div>

      {/* DRIVER GRID */}
      <div className="dashboard-grid">
        {drivers.map((driver) => {
          const status = driver.status || "offline";
          const statusColor = getStatusColor(status);
          const proofScore = Number(driver.avg_proof_score) || 0;
          const proofColor = getProofScoreColor(proofScore);
          const hasDisputes = driver.disputes_count > 0;

          return (
            <div
              key={driver.uuid}
              className="card"
              style={{ gridColumn: "span 4", position: "relative" }}
            >
              {/* DISPUTE WARNING */}
              {hasDisputes && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "12px",
                    background: "#FF4D4F",
                    color: "white",
                    padding: "4px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(255, 77, 79, 0.3)",
                  }}
                >
                  <AlertTriangle size={14} />
                </div>
              )}

              {/* DRIVER HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                  marginTop: hasDisputes ? "10px" : "0",
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

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      marginBottom: "2px",
                      color: "#1E293B",
                    }}
                  >
                    {driver.first_name} {driver.last_name}
                  </h3>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    ID: {driver.uuid?.slice(0, 8)}
                  </p>
                </div>

                {/* STATUS BADGE */}
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: statusColor.bg,
                      color: statusColor.color,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    {status.replace("_", " ").toUpperCase()}
                  </span>

                  {/* PROOF SCORE BADGE */}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: proofColor.bg,
                      color: proofColor.color,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <ShieldCheck size={10} />
                    {proofScore.toFixed(0)}%
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
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
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

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#1E293B",
                      }}
                    >
                      {parseFloat(driver.avg_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
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

                    <span
                      style={{
                        fontSize: "13px",
                        color: "#1E293B",
                        fontWeight: 500,
                      }}
                    >
                      {driver.last_location_lat && driver.last_location_lng
                        ? `${parseFloat(driver.last_location_lat).toFixed(3)}, ${parseFloat(driver.last_location_lng).toFixed(3)}`
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div style={{ marginTop: "20px" }}>
                <button
                  className="btn"
                  onClick={() =>
                    setSelectedDriver({
                      uuid: driver.uuid,
                      name: `${driver.first_name} ${driver.last_name}`,
                    })
                  }
                  style={{
                    width: "100%",
                    background: "white",
                    border: "1px solid var(--border-color)",
                    fontWeight: 600,
                    fontSize: "14px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <TrendingUp size={16} />
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

      {/* PERFORMANCE MODAL */}
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
