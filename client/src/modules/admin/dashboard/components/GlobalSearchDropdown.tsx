import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Truck, Users, User, ArrowRight, Loader2, AlertTriangle, Star } from 'lucide-react';
import api from '../../../../services/api';
import { SearchResults } from '../types';

interface GlobalSearchDropdownProps {
  onSelectOrder?: (uuid: string) => void;
  onSelectDriver?: (driver: { uuid: string; name: string }) => void;
  onNavigateTab?: (tab: string) => void;
}

export const GlobalSearchDropdown: React.FC<GlobalSearchDropdownProps> = ({
  onSelectOrder,
  onSelectDriver,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/dashboard/search', {
          params: { q: query.trim() }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside and Escape key to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const totalResults = results
    ? results.deliveries.length + results.drivers.length + results.customers.length + results.disputes.length
    : 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-[460px]">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search deliveries, orders, drivers, customers..."
          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-2xs"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X size={14} />
          </button>
        ) : loading ? (
          <Loader2 size={14} className="absolute right-2.5 text-blue-500 animate-spin" />
        ) : null}
      </div>

      {/* Results Flyout */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              Searching across enterprise logistics records...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {/* Deliveries / Orders */}
              {results && results.deliveries.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Truck size={12} />
                    Deliveries & Orders ({results.deliveries.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.deliveries.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => {
                          if (onSelectOrder) onSelectOrder(del.uuid);
                          else if (onNavigateTab) onNavigateTab('Deliveries');
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 hover:border-blue-500/20 border border-transparent cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">#{del.orderNumber}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {del.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[280px]">
                            {del.customerName} • {del.customerAddress}
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers */}
              {results && results.drivers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User size={12} />
                    Drivers ({results.drivers.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.drivers.map((dr) => (
                      <div
                        key={dr.id}
                        onClick={() => {
                          if (onSelectDriver) onSelectDriver({ uuid: dr.uuid, name: dr.name });
                          else if (onNavigateTab) onNavigateTab('Drivers');
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 hover:border-blue-500/20 border border-transparent cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{dr.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>{dr.vehicleType}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <span>Rating: {dr.rating}</span>
                              <Star size={11} className="fill-amber-400 text-amber-400 inline" />
                            </span>
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results && results.customers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users size={12} />
                    Customers ({results.customers.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.customers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('Customers');
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 hover:border-blue-500/20 border border-transparent cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{cust.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[280px]">
                            {cust.email || cust.phone} • {cust.totalOrders} orders
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disputes */}
              {results && results.disputes.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    Disputes ({results.disputes.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.disputes.map((disp) => (
                      <div
                        key={disp.id}
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('Disputes');
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50/40 hover:border-red-500/20 border border-transparent cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{disp.reason}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Status: {disp.status} • Fraud Score: {disp.fraudScore}%
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
