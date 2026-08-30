import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
  Clock,
  RotateCcw,
} from "lucide-react";
import DisputeDetailsModal from "../components/DisputeDetailsModal";

const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.user_type || "support";

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/disputes", {
        params: { search, status, sort, page, limit: 10 },
      });
      setDisputes(response.data.data || []);
      setPagination(response.data.pagination || { totalPages: 1, totalRecords: 0 });
    } catch (error) {
      console.error("Fetch disputes failed", error);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/disputes/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Fetch analytics failed", error);
    }
  };

  useEffect(() => {
    fetchDisputes();
    fetchAnalytics();
  }, [fetchDisputes]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "fraud":
        return "bg-red-50 text-red-700 border-red-200";
      case "investigating":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "open":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const hasActiveFilters = search || status !== "all" || sort !== "newest";

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-full p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Fraud & Dispute Investigation
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-assisted claim verification, forensic proof inspection, and risk resolution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Security Clearance:</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Disputes</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{analytics?.active || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
            <AlertOctagon size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">High-Risk Claims</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{analytics?.high_risk || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Resolved Today</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{analytics?.resolved_today || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Avg Fraud Score</p>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {analytics?.avg_score ? parseFloat(analytics.avg_score).toFixed(1) : 0}%
            </h4>
          </div>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search dispute by Order # or Customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="fraud">Fraud Flagged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="fraud_high">Highest Risk</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Disputes Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading fraud cases...
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Active Disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || status !== "all"
              ? "No dispute cases match the active filter criteria."
              : "All delivery claims have been resolved or no new disputes have been submitted."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {disputes.map((dispute) => {
            const isHighRisk = dispute.fraud_score > 70;
            const statusBadgeClass = getStatusBadge(dispute.status);

            return (
              <div
                key={dispute.uuid}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isHighRisk
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          Order #{dispute.order_number}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{dispute.customer_name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${statusBadgeClass}`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  {/* AI Risk Score Bar */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 my-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <ShieldAlert
                          size={14}
                          className={isHighRisk ? "text-red-500" : "text-emerald-500"}
                        />
                        <span>AI Fraud Assessment</span>
                      </div>
                      <span
                        className={`font-extrabold text-sm ${
                          isHighRisk ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {dispute.fraud_score}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHighRisk ? "bg-red-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${dispute.fraud_score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Info size={11} className="shrink-0" />
                      <span>
                        {isHighRisk
                          ? "High probability of fraudulent claim pattern."
                          : "Standard claim profile; low anomaly score."}
                      </span>
                    </p>
                  </div>

                  {/* Customer Claim Text */}
                  <div className="my-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Customer Claim
                    </span>
                    <p className="text-xs text-slate-700 italic line-clamp-2">
                      "{dispute.customer_claim}"
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => setSelectedDispute(dispute.uuid)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ShieldAlert size={14} className="text-red-400" />
                    Inspect & Investigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span className="text-xs font-bold text-slate-700 px-3">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Investigation Details Modal */}
      {selectedDispute && (
        <DisputeDetailsModal
          disputeUuid={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onUpdate={() => {
            fetchDisputes();
            fetchAnalytics();
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default Disputes;
