import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  TrendingUp,
  Package,
  Star,
  Clock,
  Navigation,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../services/api";

// Fix Leaflet icon issue by using CDN URLs to avoid module resolution problems in TS
const icon = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconShadow =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DriverPerformanceModalProps {
  driverUuid: string;
  driverName: string;
  onClose: () => void;
}

interface PerformanceData {
  summary: {
    totalDeliveries: number;
    avgRating: number;
    onTimeRate: number;
    avgProofScore: number;
    disputesCount: number;
    totalDistanceKm: number;
    currentStatus: string;
  };
  history: Array<{
    periodStart: string;
    periodEnd: string;
    deliveries: number;
    onTimeRate: number;
    proofScoreAvg: number;
    ratingAvg: number;
    disputes: number;
  }>;
  recentDeliveries: Array<{
    uuid: string;
    orderNumber: string;
    customerName: string;
    address: string;
    status: string;
    deliveredAt: string;
    proofScore: number;
    hasDispute: boolean;
  }>;
  riskAlerts: Array<{
    type: string;
    orderNumber: string;
    score: number;
  }>;
  routeHistory: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

const DriverPerformanceModal: React.FC<DriverPerformanceModalProps> = ({
  driverUuid,
  driverName,
  onClose,
}) => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/drivers/${driverUuid}/performance`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch performance data", err);
      setError("Failed to load driver performance metrics.");
    } finally {
      setLoading(false);
    }
  }, [driverUuid]);

  useEffect(() => {
    fetchData();

    // Polling strategy: 10 seconds refresh
    pollingRef.current = setInterval(fetchData, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div
        className="modal-overlay"
        style={{
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <div
            className="spinner"
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 2s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p>Analyzing driver performance...</p>
        </div>
      </div>
    );
  }

  const getProofScoreColor = (score: number) => {
    if (score >= 80) return "#2BB673";
    if (score >= 60) return "#FA8C16";
    return "#FF4D4F";
  };

  return (
    <div
      className="modal-overlay"
      style={{
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: "#F8FAFC",
          width: "95%",
          maxWidth: "1200px",
          height: "90vh",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "24px 32px",
            background: "white",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>
              Performance Dashboard: {driverName}
            </h2>
            <p style={{ fontSize: "14px", color: "#64748B" }}>
              Fleet intelligence and real-time operational metrics
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "50%",
              border: "none",
              background: "#F1F5F9",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <X size={24} color="#64748B" />
          </button>
        </div>

        {/* MODAL CONTENT - SCROLLABLE */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                color: "#B91C1C",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertTriangle size={18} />
              <p style={{ fontSize: "14px", fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Section A — Driver Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {[
              {
                label: "Total Deliveries",
                value: data?.summary?.totalDeliveries ?? 0,
                icon: <Package size={20} />,
                color: "#3B82F6",
              },
              {
                label: "Average Rating",
                value: data?.summary?.avgRating?.toFixed(1) ?? "0.0",
                icon: <Star size={20} />,
                color: "#F59E0B",
              },
              {
                label: "On-Time Rate",
                value: `${data?.summary?.onTimeRate?.toFixed(1) ?? "0.0"}%`,
                icon: <Clock size={20} />,
                color: "#10B981",
              },
              {
                label: "Proof Score",
                value: data?.summary?.avgProofScore?.toFixed(1) ?? "0.0",
                icon: <ShieldCheck size={20} />,
                color: "#8B5CF6",
              },
              {
                label: "Disputes",
                value: data?.summary?.disputesCount ?? 0,
                icon: <AlertCircle size={20} />,
                color: "#EF4444",
              },
              {
                label: "Total Distance",
                value: `${data?.summary?.totalDistanceKm?.toFixed(1) ?? "0.0"} km`,
                icon: <Navigation size={20} />,
                color: "#6366F1",
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    color: card.color,
                    background: `${card.color}15`,
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                      fontWeight: 500,
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1E293B",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Section B — Performance Charts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Weekly Deliveries */}
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <TrendingUp size={18} color="#3B82F6" />
                  Weekly Deliveries
                </h3>
              </div>
              <div style={{ height: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.history.slice().reverse()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="periodStart"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      tick={{ fontSize: 12, fill: "#94A3B8" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="deliveries"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Proof Score Trend */}
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <ShieldCheck size={18} color="#8B5CF6" />
                  Proof Score Trend
                </h3>
              </div>
              <div style={{ height: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.history.slice().reverse()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="periodStart"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      tick={{ fontSize: 12, fill: "#94A3B8" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#94A3B8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="proofScoreAvg"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8B5CF6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Section C — Recent Deliveries */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Recent Deliveries
                </h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#F8FAFC" }}>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: "12px",
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        ORDER
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: "12px",
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        CUSTOMER
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: "12px",
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: "12px",
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        SCORE
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: "12px",
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        DATE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentDeliveries.map((delivery) => (
                      <tr
                        key={delivery.uuid}
                        style={{
                          borderBottom: "1px solid #F1F5F9",
                          background: delivery.hasDispute
                            ? "#FFF1F0"
                            : "transparent",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px 24px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1E293B",
                          }}
                        >
                          {delivery.orderNumber}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#1E293B",
                              fontWeight: 500,
                            }}
                          >
                            {delivery.customerName}
                          </p>
                          <p style={{ fontSize: "12px", color: "#64748B" }}>
                            {delivery.address.slice(0, 30)}...
                          </p>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background:
                                delivery.status === "delivered"
                                  ? "#E9F7EF"
                                  : "#FFF7E6",
                              color:
                                delivery.status === "delivered"
                                  ? "#2BB673"
                                  : "#FA8C16",
                            }}
                          >
                            {delivery.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "4px",
                                borderRadius: "2px",
                                background: "#E2E8F0",
                              }}
                            >
                              <div
                                style={{
                                  width: `${delivery.proofScore || 0}%`,
                                  height: "100%",
                                  borderRadius: "2px",
                                  background: getProofScoreColor(
                                    delivery.proofScore || 0,
                                  ),
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: getProofScoreColor(
                                  delivery.proofScore || 0,
                                ),
                              }}
                            >
                              {delivery.proofScore !== null
                                ? `${delivery.proofScore}%`
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 24px",
                            fontSize: "12px",
                            color: "#64748B",
                          }}
                        >
                          {delivery.deliveredAt
                            ? new Date(delivery.deliveredAt).toLocaleString(
                                [],
                                { dateStyle: "short", timeStyle: "short" },
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {data?.recentDeliveries.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#94A3B8",
                          }}
                        >
                          No recent deliveries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section D — Risk Alerts */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={18} color="#EF4444" />
                  Risk Alerts
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {data?.riskAlerts.map((alert, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        padding: "16px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          background: "#EF4444",
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                      >
                        <ShieldCheck size={18} color="white" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#991B1B",
                          }}
                        >
                          Low Proof Score Detected
                        </p>
                        <p style={{ fontSize: "12px", color: "#B91C1C" }}>
                          Order {alert.orderNumber} scored {alert.score}% in
                          verification.
                        </p>
                      </div>
                    </div>
                  ))}
                  {(data?.summary?.disputesCount ?? 0) > 0 && (
                    <div
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FEF3C7",
                        padding: "16px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          background: "#F59E0B",
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                      >
                        <AlertTriangle size={18} color="white" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#92400E",
                          }}
                        >
                          Dispute Warnings
                        </p>
                        <p style={{ fontSize: "12px", color: "#B45309" }}>
                          {data?.summary?.disputesCount} customer disputes
                          recorded this period.
                        </p>
                      </div>
                    </div>
                  )}
                  {data?.riskAlerts.length === 0 &&
                    (data?.summary?.disputesCount ?? 0) === 0 && (
                      <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <CheckCircle2
                          size={32}
                          color="#10B981"
                          style={{ opacity: 0.3, margin: "0 auto 12px" }}
                        />
                        <p style={{ fontSize: "14px", color: "#94A3B8" }}>
                          No risk alerts detected.
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Section E — Delivery Route Map Preview */}
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <MapPin size={18} color="#6366F1" />
                  Recent Route History
                </h3>
                <div
                  style={{
                    flex: 1,
                    borderRadius: "12px",
                    overflow: "hidden",
                    minHeight: "250px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {data?.routeHistory && data.routeHistory.length > 0 ? (
                    <MapContainer
                      center={[
                        data.routeHistory[0].lat,
                        data.routeHistory[0].lng,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Polyline
                        positions={data.routeHistory.map(
                          (p) => [p.lat, p.lng] as [number, number],
                        )}
                        color="#6366F1"
                        weight={3}
                        opacity={0.6}
                      />
                      <Marker
                        position={[
                          data.routeHistory[0].lat,
                          data.routeHistory[0].lng,
                        ]}
                      >
                        <Popup>Last known position</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#F8FAFC",
                        color: "#94A3B8",
                      }}
                    >
                      No route data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "16px 32px",
            background: "#F1F5F9",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
        </div>
      </motion.div>
    </div>
  );
};

export default DriverPerformanceModal;
