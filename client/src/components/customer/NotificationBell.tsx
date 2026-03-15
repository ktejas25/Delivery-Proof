import React, { useState } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBellProps {
  count: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Placeholder notifications
  const notifications = [
    { id: 1, title: 'Delivery Updated', message: 'Your order #8A2C1 is now en route.', type: 'info', time: '2m ago' },
    { id: 2, title: 'Arriving Soon', message: 'Driver is 5 minutes away from your location.', type: 'warning', time: '15m ago' },
    { id: 3, title: 'Delivered', message: 'Order #92B1G has been delivered.', type: 'success', time: '1h ago' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-all active:scale-95 group"
      >
        <Bell className={`w-6 h-6 ${count > 0 ? "text-indigo-600" : "text-gray-400"} group-hover:text-indigo-600 transition-colors`} />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white text-[10px] items-center justify-center text-white font-black">
              {count}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl shadow-indigo-200 border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Notifications</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {count} New
                </span>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex gap-4">
                        <div className={`mt-1 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          n.type === 'success' ? 'bg-green-50 text-green-500' : 
                          n.type === 'warning' ? 'bg-yellow-50 text-yellow-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {n.type === 'success' ? <CheckCircle size={14} /> : 
                           n.type === 'warning' ? <AlertTriangle size={14} /> : <Info size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-gray-900 mb-0.5">{n.title}</p>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-tighter">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-sm font-bold text-gray-400">All caught up!</p>
                  </div>
                )}
              </div>
              
              <button className="w-full p-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-colors border-t border-gray-50">
                View All Notifications
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;