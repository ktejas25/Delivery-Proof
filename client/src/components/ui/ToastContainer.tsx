import React from "react";
import { useToast } from "../../contexts/ToastContext";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: "text-green-500 bg-green-50 border-green-200",
  error: "text-red-500 bg-red-50 border-red-200",
  warning: "text-yellow-500 bg-yellow-50 border-yellow-200",
  info: "text-blue-500 bg-blue-50 border-blue-200",
};

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${colorMap[toast.type]} animate-slide-in`}
            role="alert"
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => hideToast(toast.id)}
              className="ml-auto text-slate-500 hover:text-slate-700"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;