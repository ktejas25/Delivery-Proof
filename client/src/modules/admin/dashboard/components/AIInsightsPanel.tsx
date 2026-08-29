import React, { useState } from 'react';
import { 
  BrainCircuit, 
  AlertTriangle, 
  CloudRain, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { AIInsightItem } from '../types';

interface AIInsightsPanelProps {
  insights: AIInsightItem[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights }) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'forecast' | 'security'>('all');

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          border: 'border-red-200/60 bg-red-50/20',
          dot: 'bg-red-500',
          label: 'HIGH RISK'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-amber-200/60 bg-amber-50/20',
          dot: 'bg-amber-500',
          label: 'MEDIUM'
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          border: 'border-blue-100 bg-blue-50/10',
          dot: 'bg-blue-500',
          label: 'ADVISORY'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <ShieldAlert size={15} className="text-red-500" />;
      case 'traffic':
        return <AlertTriangle size={15} className="text-amber-500" />;
      case 'weather':
        return <CloudRain size={15} className="text-blue-500" />;
      case 'forecast':
        return <TrendingUp size={15} className="text-emerald-500" />;
      default:
        return <BrainCircuit size={15} className="text-purple-500" />;
    }
  };

  const filteredInsights = insights.filter((item) => {
    if (filter === 'high') return item.severity === 'HIGH';
    if (filter === 'forecast') return item.category === 'forecast';
    if (filter === 'security') return item.category === 'security';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Strategic AI & Risk Insights</h3>
              <p className="text-xs text-slate-400">Predictive anomaly detection & business intelligence</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            {insights.length} Insights
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto pb-1">
          {[
            { label: 'All Insights', value: 'all' },
            { label: 'High Priority', value: 'high' },
            { label: 'Business & Volume', value: 'forecast' },
            { label: 'Security & Fraud', value: 'security' }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === btn.value
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Insights Stream */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {filteredInsights.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching AI insights for this filter.
            </div>
          ) : (
            filteredInsights.map((item) => {
              const style = getSeverityStyle(item.severity);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border ${style.border} transition-all hover:shadow-2xs`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(item.category)}
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {item.recommendation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/60 p-2 rounded-lg">
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-600" />
                      <span>{item.recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Info size={13} /> Continuous model inference
        </span>
        <span className="font-semibold text-slate-600">Gemini Vision AI</span>
      </div>
    </div>
  );
};
