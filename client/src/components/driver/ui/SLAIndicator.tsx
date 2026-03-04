import React from "react";
import { Clock } from "lucide-react";
import { cn } from "../utils";
import { SLAStatus } from "../types";

interface SLAIndicatorProps {
  slaStatus: SLAStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const slaColors = {
  "on-time": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "at-risk": "text-amber-600 bg-amber-50 border-amber-200",
  late: "text-red-600 bg-red-50 border-red-200 animate-pulse",
};

const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  slaStatus,
  size = "md",
  showLabel = false,
}) => {
  const iconSize = size === "sm" ? 14 : 16;
  const { status, minutesRemaining } = slaStatus;

  const getLabel = () => {
    if (status === "late") return `${Math.abs(minutesRemaining)}m Late`;
    if (minutesRemaining < 60) return `${minutesRemaining}m left`;
    return `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}m`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-lg border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        slaColors[status],
      )}
    >
      <Clock size={iconSize} />
      {showLabel && <span>{getLabel()}</span>}
    </div>
  );
};

export default SLAIndicator;
