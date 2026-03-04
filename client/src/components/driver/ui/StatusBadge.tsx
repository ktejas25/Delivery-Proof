import React from "react";
import { cn } from "../utils";
import { DeliveryStatus } from "../types";
import { STATUS_CONFIG } from "../config";

interface StatusBadgeProps {
  status: DeliveryStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  showIcon = false,
}) => {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border",
        sizeStyles[size],
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: `${config.color}30`, // 30 is hex opacity
      }}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
      {status === "pending" || status === "in_transit" ? (
        <span className="flex h-1.5 w-1.5 relative">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.color }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ backgroundColor: config.color }}
          />
        </span>
      ) : null}
    </div>
  );
};

export default StatusBadge;
