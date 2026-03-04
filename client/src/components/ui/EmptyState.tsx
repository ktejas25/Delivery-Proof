import React from "react";
import { Package } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
      <Package size={48} className="mx-auto text-slate-400 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600">{description}</p>
    </div>
  </div>
);

export default EmptyState;