import React from 'react';
import { FaCheck } from 'react-icons/fa';

const steps = [
  { id: "scheduled", label: "Scheduled" },
  { id: "dispatched", label: "Dispatched" },
  { id: "en_route", label: "En Route" },
  { id: "delivered", label: "Delivered" },
];

interface DeliveryTimelineProps {
  status: string;
}

const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ status }) => {
  const currentStatusIndex = steps.findIndex(s => s.id === status.toLowerCase().replace(/[\s-]/g, "_"));
  
  // If status is not in the primary flow (like cancelled/failed), we might want to handle it differently,
  // but for now let's show the progress up to where it got.
  const effectiveIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="relative flex items-center justify-between w-full py-8 px-2">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
      
      {/* Progress Line */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full"
        style={{ width: `${(effectiveIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, i) => {
        const isCompleted = i < effectiveIndex;
        const isCurrent = i === effectiveIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                isCompleted 
                  ? "bg-green-500 border-green-500 text-white" 
                  : isCurrent 
                    ? "bg-white border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                    : "bg-white border-gray-200 text-gray-300"
              }`}
            >
              {isCompleted ? (
                <FaCheck size={12} />
              ) : (
                <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-green-500 animate-pulse" : "bg-gray-200"}`} />
              )}
            </div>
            
            <p 
              className={`absolute top-10 whitespace-nowrap text-[10px] sm:text-xs font-bold uppercase tracking-tighter ${
                isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryTimeline;