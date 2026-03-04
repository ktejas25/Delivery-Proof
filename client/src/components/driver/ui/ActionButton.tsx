import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "primary" | "secondary" | "success" | "disabled";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  disabled: "bg-slate-100 text-slate-400 cursor-not-allowed",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg min-h-[36px]",
  md: "px-4 py-2 text-sm font-semibold rounded-xl min-h-[44px]",
  lg: "px-6 py-3 text-base font-semibold rounded-xl min-h-[52px]",
};

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      label,
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center gap-2 transition-all w-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          variantStyles[disabled ? "disabled" : variant],
          sizeStyles[size],
          loading && "opacity-80 pointer-events-none",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === "sm" ? 14 : 18} />
        ) : null}
        {children || label}
      </button>
    );
  },
);
ActionButton.displayName = "ActionButton";

export default ActionButton;
