import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

import { cn, formatDuration } from "../utils";
import { SLAStatus } from "../types";

interface SLAIndicatorProps {
  slaStatus: SLAStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const slaConfigs = {
  "on-time": {
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
  },
  "at-risk": {
    className: "text-amber-800 bg-amber-50 border-amber-200",
    icon: AlertTriangle,
    dotColor: "bg-amber-500",
  },
  late: {
    className: "text-red-700 bg-red-50 border-red-200",
    icon: AlertCircle,
    dotColor: "bg-red-500",
  },
};

const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  slaStatus,
  size = "md",
  showLabel = false,
}) => {
  const iconSize = size === "sm" ? 13 : 15;
  const { status, minutesRemaining } = slaStatus;
  const config = slaConfigs[status] || slaConfigs["on-time"];
  const Icon = config.icon;

  const getLabel = () => {
    if (status === "late") {
      return `${formatDuration(minutesRemaining)} overdue`;
    }
    if (status === "at-risk") {
      return `${formatDuration(minutesRemaining)} left`;
    }
    return "On schedule";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-lg border flex-shrink-0 transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.className,
      )}
      title={getLabel()}
    >
      <Icon size={iconSize} className="flex-shrink-0" />
      {showLabel && <span className="font-semibold">{getLabel()}</span>}
    </div>
  );
};

export default SLAIndicator;

