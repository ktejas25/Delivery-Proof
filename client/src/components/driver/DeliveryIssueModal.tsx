import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  PhoneOff,
  KeyRound,
  MapPinOff,
  ShieldAlert,
  HelpCircle,
  Check,
} from "lucide-react";
import { Delivery, DeliveryIssueType } from "./types";

interface DeliveryIssueModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (uuid: string, reason: string, notes?: string) => Promise<void> | void;
}

const ISSUE_OPTIONS: {
  id: DeliveryIssueType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}[] = [
  {
    id: "customer_unavailable",
    label: "Customer Unavailable",
    description: "No answer at door or phone after multiple attempts",
    icon: PhoneOff,
  },
  {
    id: "gate_access_denied",
    label: "Access Denied / Gate Locked",
    description: "Cannot enter premises; no valid gate or door code",
    icon: KeyRound,
  },
  {
    id: "invalid_address",
    label: "Incorrect or Missing Address",
    description: "Address doesn't exist or building number not found",
    icon: MapPinOff,
  },
  {
    id: "damaged_package",
    label: "Damaged Package",
    description: "Parcel arrived torn, crushed, or leaking",
    icon: AlertTriangle,
  },
  {
    id: "unsafe_location",
    label: "Unsafe Delivery Area",
    description: "Hostile animal, security barrier, or hazard",
    icon: ShieldAlert,
  },
  {
    id: "other",
    label: "Other Delivery Exception",
    description: "Specify reason in the notes field below",
    icon: HelpCircle,
  },
];

const DeliveryIssueModal: React.FC<DeliveryIssueModalProps> = ({
  delivery,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<DeliveryIssueType>("customer_unavailable");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issueConfig = ISSUE_OPTIONS.find((opt) => opt.id === selectedIssue);
    const reasonText = issueConfig?.label || "Delivery Exception";

    setSubmitting(true);
    try {
      await onSubmit(delivery.uuid, reasonText, notes.trim() || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="issue-modal-title" className="font-bold text-base text-slate-900">
                Report Delivery Issue
              </h3>
              <p className="text-xs text-slate-500">
                Stop #{delivery.order_number || delivery.uuid.slice(0, 6)} · {delivery.customer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Non-Delivery
            </label>
            <div className="space-y-2">
              {ISSUE_OPTIONS.map((opt) => {
                const isSelected = selectedIssue === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedIssue(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-red-500 bg-red-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-red-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-red-950" : "text-slate-900"
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {opt.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 ml-2">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label
              htmlFor="driver-notes"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Driver Notes (Optional)
            </label>
            <textarea
              id="driver-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ring doorbell 3x, called twice, no answer at front gate..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
            />
          </div>

          {/* Alert Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              This will mark the delivery as <strong>failed</strong> and log your report to dispatch. You will advance to the next delivery on your route.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs sm:text-sm transition shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Confirm Non-Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryIssueModal;
