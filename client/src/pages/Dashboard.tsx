import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Truck,
  Users,
  UserCircle,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";
import Deliveries from "./Deliveries";
import Drivers from "./Drivers";
import Disputes from "./Disputes";
import Customers from "./Customers";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState<any>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/analytics/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: "32px", padding: "0 16px" }}>
          <h2 style={{ color: "var(--primary-mint)", letterSpacing: "-1px" }}>
            ProofManager
          </h2>
        </div>
        <nav style={{ flex: 1 }}>
          <a
            href="#"
            className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("Dashboard")}
          >
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === "Deliveries" ? "active" : ""}`}
            onClick={() => setActiveTab("Deliveries")}
          >
            <Truck size={20} /> Deliveries
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === "Customers" ? "active" : ""}`}
            onClick={() => setActiveTab("Customers")}
          >
            <UserCircle size={20} /> Customers
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === "Drivers" ? "active" : ""}`}
            onClick={() => setActiveTab("Drivers")}
          >
            <Users size={20} /> Drivers
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === "Disputes" ? "active" : ""}`}
            onClick={() => setActiveTab("Disputes")}
          >
            <AlertTriangle size={20} /> Disputes
          </a>
        </nav>
        <button
          onClick={logout}
          className="btn nav-item"
          style={{
            width: "100%",
            marginTop: "auto",
            border: "none",
            background: "none",
            color: "#ff4d4f",
          }}
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {/* Header */}
        <header
          style={{
            height: "70px",
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 var(--space-md)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flex: 1,
            }}
          >
            <div
              style={{ position: "relative", maxWidth: "400px", width: "100%" }}
            >
              <Search
                size={18}
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
                placeholder="Search deliveries, drivers..."
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={22} color="var(--text-muted)" />
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  background: "#FF4D4F",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              ></div>
            </div>
            <select
              style={{
                border: "none",
                background: "var(--bg-secondary)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              onChange={(e) => {
                window.location.search = `?lng=${e.target.value}`;
              }}
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="hi">हिन्दी</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", fontWeight: 600 }}>
                  {user?.first_name || "Admin"} {user?.last_name || ""}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {user?.business_name || "Organization"}
                </p>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--bg-highlight)",
                  border: "2px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              ></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        {activeTab === "Dashboard" ? (
          <div className="dashboard-grid">
            {/* KPI Row */}
            <div className="card" style={{ gridColumn: "span 3" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Total Deliveries
                </p>
                <div
                  style={{
                    padding: "6px",
                    background: "var(--bg-highlight)",
                    borderRadius: "8px",
                  }}
                >
                  <Truck size={18} color="var(--primary-mint)" />
                </div>
              </div>
              <h1 style={{ fontSize: "32px", margin: "4px 0" }}>
                {stats?.kpis?.total_deliveries || "0"}
              </h1>
              <p
                style={{
                  color: "var(--primary-mint)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <TrendingUp
                  size={12}
                  style={{ verticalAlign: "middle", marginRight: "4px" }}
                />
                ↑ 12% from last month
              </p>
            </div>
            <div className="card" style={{ gridColumn: "span 3" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Success Rate
                </p>
                <div
                  style={{
                    padding: "6px",
                    background: "var(--bg-highlight)",
                    borderRadius: "8px",
                  }}
                >
                  <ShieldCheck size={18} color="var(--primary-mint)" />
                </div>
              </div>
              <h1 style={{ fontSize: "32px", margin: "4px 0" }}>
                {stats?.kpis?.success_rate
                  ? `${parseFloat(stats.kpis.success_rate).toFixed(1)}%`
                  : "0%"}
              </h1>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "var(--bg-secondary)",
                  borderRadius: "2px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    width: `${stats?.kpis?.success_rate || 0}%`,
                    height: "100%",
                    background: "var(--primary-mint)",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </div>
            <div className="card" style={{ gridColumn: "span 3" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Fraud Blocked
              </p>
              <h1 style={{ fontSize: "32px", margin: "4px 0" }}>$0</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                0 claims prevented
              </p>
            </div>
            <div className="card" style={{ gridColumn: "span 3" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Active Drivers
              </p>
              <h1 style={{ fontSize: "32px", margin: "4px 0" }}>
                {stats?.kpis?.active_drivers || "0"}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Currently on road
              </p>
            </div>

            {/* Main Chart Section placeholder */}
            <div
              className="card"
              style={{ gridColumn: "span 8", minHeight: "300px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3>Delivery Performance</h3>
                <select
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--text-muted)",
                    fontSize: "14px",
                  }}
                >
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  background: "var(--bg-main)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  padding: "0 20px",
                }}
              >
                {stats?.chart?.length > 0
                  ? stats.chart.map((item: any, i: number) => {
                      const h =
                        item.total_deliveries > 0
                          ? (item.successful_deliveries /
                              item.total_deliveries) *
                            100
                          : 0;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "30px",
                              height: `${Math.max(10, h)}%`,
                              background: "var(--primary-mint)",
                              borderRadius: "4px 4px 0 0",
                              opacity: 0.8,
                            }}
                          ></div>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {new Date(item.date).toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </span>
                        </div>
                      );
                    })
                  : [40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "30px",
                            height: `${h}%`,
                            background: "var(--bg-secondary)",
                            borderRadius: "4px 4px 0 0",
                            opacity: 0.5,
                          }}
                        ></div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Day {i + 1}
                        </span>
                      </div>
                    ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ gridColumn: "span 4" }}>
              <h3>Recent Activity</h3>
              <div style={{ marginTop: "20px" }}>
                {stats?.recent?.length > 0 ? (
                  stats.recent.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "16px",
                        paddingBottom: "16px",
                        borderBottom:
                          idx < stats.recent.length - 1
                            ? "1px solid var(--border-color)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          background: "var(--bg-highlight)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Truck size={20} color="var(--primary-mint)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <p style={{ fontSize: "14px", fontWeight: 600 }}>
                            #{d.order_number}
                          </p>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "var(--primary-mint)",
                            }}
                          >
                            {(d.delivery_status || "UNKNOWN").toUpperCase()}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {d.customer_name} •{" "}
                          {new Date(d.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--text-muted)",
                    }}
                  >
                    <AlertTriangle
                      size={32}
                      style={{ margin: "0 auto 12px", opacity: 0.2 }}
                    />
                    <p style={{ fontSize: "13px" }}>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "Deliveries" ? (
          <Deliveries />
        ) : activeTab === "Customers" ? (
          <Customers />
        ) : activeTab === "Drivers" ? (
          <Drivers />
        ) : activeTab === "Disputes" ? (
          <Disputes />
        ) : (
          <div style={{ padding: "24px" }}>Feature coming soon...</div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
