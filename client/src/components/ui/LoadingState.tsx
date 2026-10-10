import React from "react";
import AppRefreshOverlay from "./AppRefreshOverlay";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  submessage = "Loading application resources"
}) => (
  <AppRefreshOverlay fullScreen message={message} submessage={submessage} />
);

export default LoadingState;