import React, { useEffect, useState } from "react";
import {
  X,
  ShieldAlert,
  Clock,
  MapPin,
  Hash,
  Send,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface DisputeDetailsModalProps {
  disputeUuid: string;
  onClose: () => void;
  onUpdate: () => void;
  userRole: string;
}

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({
  disputeUuid,
  onClose,
  onUpdate,
  userRole,
}) => {
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolutionType, setResolutionType] = useState("refund");
  const [notes, setNotes] = useState("");

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/disputes/${disputeUuid}`);
      setDispute(response.data);
    } catch (error) {
      console.error("Failed to fetch dispute details", error);
      toast.error("Failed to load dispute workstation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [disputeUuid]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/disputes/${disputeUuid}/comments`, { comment });
      setComment("");
      fetchDetails();
      toast.success("Investigation note logged");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleResolve = async () => {
    if (!notes.trim()) {
      toast.error("Resolution notes are required.");
      return;
    }

    setResolving(true);
    try {
      await api.patch(`/disputes/${disputeUuid}`, {
        status: "resolved",
        resolution: resolutionType,
        internal_notes: notes,
      });
      toast.success("Dispute investigation completed");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resolve dispute");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xl">
          <p className="text-xs font-bold text-slate-500">Loading investigation workspace...</p>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const canAction = userRole === "admin" || userRole === "analyst" || userRole === "manager";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Forensic Investigation: Order #{dispute.order_number}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {dispute.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Dispute UUID: {dispute.uuid}</p>
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

        {/* 2-Panel Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Proof Evidence & Details (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5">
            {/* Customer Claim */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Customer Claimed Issue
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-semibold text-slate-800 text-sm">
                  "{dispute.customer_claim}"
                </p>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Filed: {new Date(dispute.created_at).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-700 uppercase">
                    Type: {dispute.dispute_type?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Assignment & Order Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Recipient
                </span>
                <p className="font-bold text-slate-800">{dispute.customer_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{dispute.customer_email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Driver
                </span>
                <p className="font-bold text-slate-800">
                  {dispute.driver_first_name} {dispute.driver_last_name}
                </p>
                <p className="text-[11px] text-slate-500">Fleet Courier</p>
              </div>
            </div>

            {/* Delivery Proof Evidence */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Photographic & Cryptographic Delivery Evidence
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dispute.proof_photo_url || (dispute.photos && dispute.photos.length > 0) ? (
                  <>
                    {dispute.proof_photo_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={dispute.proof_photo_url}
                          alt="Delivery Proof"
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-2 bg-white flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <span>
                            {dispute.proof_gps_lat && dispute.proof_gps_lng
                              ? `${Number(dispute.proof_gps_lat).toFixed(4)}, ${Number(dispute.proof_gps_lng).toFixed(4)}`
                              : "GPS Logged"}
                          </span>
                        </div>
                      </div>
                    )}

                    {!dispute.proof_photo_url &&
                      dispute.photos &&
                      dispute.photos.map((photo: any) => (
                        <div
                          key={photo.id || photo.s3_url}
                          className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={photo.s3_url || photo.url}
                            alt="Delivery Proof"
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-2 bg-white flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                            <MapPin size={12} className="text-blue-500 shrink-0" />
                            <span>
                              {photo.gps_lat && photo.gps_lng
                                ? `${Number(photo.gps_lat).toFixed(4)}, ${Number(photo.gps_lng).toFixed(4)}`
                                : "GPS Logged"}
                            </span>
                          </div>
                        </div>
                      ))}

                    {dispute.proof_signature_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between">
                        <div className="p-2 bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Customer Signature
                        </div>
                        <img
                          src={dispute.proof_signature_url}
                          alt="Customer Signature"
                          className="w-full h-24 object-contain p-2"
                        />
                        <div className="p-2 bg-white text-[10px] text-slate-400 text-center border-t border-slate-100">
                          Captured at dropoff
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No photo proof available for this delivery.
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic Hash & AI Explanation */}
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-xl border flex flex-col gap-1.5 text-xs ${
                  dispute.blockchain_confirmed || dispute.delivery_proof_hash
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-red-50/50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Hash size={14} className="text-blue-600" />
                    <span>Cryptographic Proof Integrity</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      dispute.blockchain_confirmed || dispute.delivery_proof_hash
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {dispute.blockchain_confirmed || dispute.delivery_proof_hash
                      ? "VERIFIED HASH"
                      : "UNVERIFIED"}
                  </span>
                </div>
                {dispute.delivery_proof_hash && (
                  <div className="text-[10px] font-mono text-slate-600 break-all bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    HASH: {dispute.delivery_proof_hash}
                  </div>
                )}
              </div>

              {dispute.ai_explanation && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span>AI Reasoning Summary</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{dispute.ai_explanation}</p>
                </div>
              )}
            </div>

            {/* Audit Timeline */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Audit Timeline
              </span>
              <div className="border-l-2 border-slate-200 ml-2 pl-4 space-y-3">
                {dispute.timeline && dispute.timeline.length > 0 ? (
                  dispute.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                      <p className="font-bold text-slate-800">
                        {item.action?.replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleString()} • {item.user_type}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Initial claim recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Team Collaboration & Resolution (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/50 flex flex-col justify-between overflow-hidden">
            {/* Comments Feed */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Internal Investigation Notes
              </span>

              <div className="space-y-3">
                {dispute.comments && dispute.comments.length > 0 ? (
                  dispute.comments.map((c: any) => (
                    <div
                      key={c.uuid || c.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">
                          {c.first_name} {c.last_name}{" "}
                          <span className="text-slate-400 font-normal">({c.user_type})</span>
                        </span>
                        <span className="text-slate-400">
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700">{c.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No team comments added yet.
                  </p>
                )}
              </div>
            </div>

            {/* Comment Box & Resolution Actions */}
            <div className="p-6 bg-white border-t border-slate-200 space-y-4">
              {canAction ? (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add forensic note..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !comment.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Support agents have read-only inspection access.
                </p>
              )}

              {canAction && dispute.status !== "resolved" && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Execute Resolution Decision
                  </span>

                  <select
                    value={resolutionType}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="refund">Approve Refund (Customer Favor)</option>
                    <option value="denied">Deny Claim (Uphold Valid Proof)</option>
                    <option value="fraud">Confirm Fraudulent Activity</option>
                    <option value="redelivery">Dispatch Redelivery</option>
                  </select>

                  <textarea
                    placeholder="Provide mandatory resolution rationale..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none resize-none"
                  />

                  <button
                    onClick={handleResolve}
                    disabled={resolving || !notes.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    {resolving ? "Executing Decision..." : "Resolve Dispute"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailsModal;
