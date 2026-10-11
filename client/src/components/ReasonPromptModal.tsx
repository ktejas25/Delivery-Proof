import React, { useState, useEffect, useRef } from "react";
import { X, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

export interface ReasonPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  title?: string;
  description?: string;
  targetStatus?: string;
  orderNumber?: string;
  actionType?: "status_change" | "cancel";
}

const ReasonPromptModal: React.FC<ReasonPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  targetStatus,
  orderNumber,
  actionType,
}) => {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setValidationError("");
      setSubmitError("");
      setSubmitting(false);
      // Auto focus textarea after render
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  // Derive visual styles and text based on targetStatus or actionType
  const isCancel = actionType === "cancel" || targetStatus === "cancelled";
  const isDelivered = targetStatus === "delivered";
  const isDisputed = targetStatus === "disputed";

  let defaultTitle = `Update Status for Order #${orderNumber || ""}`;
  let defaultDescription = `A documented reason is required to change this delivery to "${targetStatus}".`;
  let confirmButtonText = "Confirm Status Change";
  let icon = <AlertCircle size={20} className="text-blue-600" />;
  let iconBg = "bg-blue-50 border-blue-100";
  let confirmBtnClass = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20";
  let placeholderText = "Please provide specific details explaining this update...";

  if (isCancel) {
    defaultTitle = `Cancel Order #${orderNumber || ""}`;
    defaultDescription = `Please provide a mandatory reason for cancelling this order. This action halts dispatching.`;
    confirmButtonText = "Confirm Cancellation";
    icon = <XCircle size={20} className="text-red-600" />;
    iconBg = "bg-red-50 border-red-100";
    confirmBtnClass = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20";
    placeholderText = "e.g., Customer requested cancellation, incorrect order details, item out of stock...";
  } else if (isDelivered) {
    defaultTitle = `Confirm Delivery for Order #${orderNumber || ""}`;
    defaultDescription = `Please provide delivery confirmation notes or drop-off details before marking as delivered.`;
    confirmButtonText = "Mark as Delivered";
    icon = <CheckCircle2 size={20} className="text-emerald-600" />;
    iconBg = "bg-emerald-50 border-emerald-100";
    confirmBtnClass = "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20";
    placeholderText = "e.g., Handed directly to recipient, left with reception, verified with parcel code...";
  } else if (isDisputed) {
    defaultTitle = `Report Dispute for Order #${orderNumber || ""}`;
    defaultDescription = `Please provide details explaining why this delivery is being marked as disputed.`;
    confirmButtonText = "File Dispute Claim";
    icon = <AlertTriangle size={20} className="text-pink-600" />;
    iconBg = "bg-pink-50 border-pink-100";
    confirmBtnClass = "bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500/20";
    placeholderText = "e.g., Customer reported missing package, damaged item claim, wrong delivery location...";
  }

  const modalTitle = title || defaultTitle;
  const modalDescription = description || defaultDescription;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      setValidationError("A valid, non-empty reason is required to proceed.");
      textareaRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setValidationError("");
    setSubmitError("");

    try {
      await onSubmit(trimmed);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while processing the request.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (validationError && e.target.value.trim().length > 0) {
      setValidationError("");
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const isReasonEmpty = reason.trim().length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reason-modal-title"
      aria-describedby="reason-modal-desc"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconBg}`}
            >
              {icon}
            </div>
            <div>
              <h3
                id="reason-modal-title"
                className="text-base font-extrabold text-slate-900 leading-tight"
              >
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Mandatory Audit Verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p id="reason-modal-desc" className="text-xs text-slate-600 leading-relaxed">
            {modalDescription}
          </p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reason-input-field"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Reason / Justification <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {reason.trim().length} chars
              </span>
            </div>

            <textarea
              id="reason-input-field"
              ref={textareaRef}
              rows={3}
              value={reason}
              onChange={handleReasonChange}
              disabled={submitting}
              placeholder={placeholderText}
              aria-required="true"
              aria-invalid={!!validationError}
              aria-describedby={
                validationError
                  ? "reason-validation-error"
                  : submitError
                  ? "reason-submit-error"
                  : undefined
              }
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none ${
                validationError
                  ? "border-red-300 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10"
                  : "border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />

            {validationError && (
              <p
                id="reason-validation-error"
                className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5"
              >
                <AlertCircle size={13} className="shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {submitError && (
            <div
              id="reason-submit-error"
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 font-medium leading-tight">{submitError}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReasonEmpty || submitting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${confirmBtnClass}`}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmButtonText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReasonPromptModal;
