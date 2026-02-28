import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
    Truck, MapPin, Scan, Clock, ShieldCheck, LogOut, 
    RefreshCw, Phone, Navigation, Search, Bell
} from 'lucide-react';
import api from '../services/api';
import ProofModal from '../components/ProofModal';
import { useAuth } from '../contexts/AuthContext';

// --- Sub-components for better organization ---

const ETACountdown: React.FC<{ targetTime: string }> = ({ targetTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date(targetTime);
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Overdue');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes} min`);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000);
        return () => clearInterval(timer);
    }, [targetTime]);

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${timeLeft === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            ETA: {timeLeft}
        </span>
    );
};

const DeliverySkeleton = () => (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="h-5 w-24 bg-gray-100 rounded-lg"></div>
            <div className="h-4 w-16 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-100 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-gray-50 rounded-lg"></div>
            </div>
        </div>
        <div className="h-12 w-full bg-gray-100 rounded-2xl"></div>
    </div>
);

const DriverDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTodayDeliveries = async () => {
        setRefreshing(true);
        try {
            const lang = new URLSearchParams(window.location.search).get('lng') || 'en';
            const response = await api.get(`/deliveries/today?lang=${lang}`);
            setDeliveries(response.data);
        } catch (error) {
            console.error('Failed to fetch today deliveries', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTodayDeliveries();
    }, []);

    const pendingCount = useMemo(() => Array.isArray(deliveries) ? deliveries.filter(d => d.delivery_status !== 'delivered').length : 0, [deliveries]);
    const completedCount = useMemo(() => Array.isArray(deliveries) ? deliveries.filter(d => d.delivery_status === 'delivered').length : 0, [deliveries]);

    const handleComplete = (uuid: string) => {
        setSelectedDelivery(uuid);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return 'border-emerald-500 bg-emerald-50 text-emerald-700';
            case 'en_route': return 'border-amber-500 bg-amber-50 text-amber-700';
            case 'pending': return 'border-gray-400 bg-gray-50 text-gray-700';
            default: return 'border-emerald-400 bg-emerald-50 text-emerald-600';
        }
    };

    return (
        <div className="bg-[#F8FBFA] min-h-screen pb-24 font-inter text-slate-800 overflow-x-hidden">
            {/* Custom Modern Header */}
            <div className="relative">
                <motion.header 
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="bg-emerald-600 text-white pt-14 pb-12 px-6 rounded-b-[40px] shadow-xl shadow-emerald-500/10"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs font-bold tracking-wider uppercase mb-1"
                            >
                                Dispatcher Ready
                            </motion.p>
                            <h2 className="text-3xl font-black">{user?.first_name || 'Driver'}</h2>
                        </div>
                        <div className="flex gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="bg-white/10 p-3 rounded-2xl backdrop-blur-md relative"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border-2 border-emerald-600"></span>
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={logout}
                                className="bg-white/10 p-3 rounded-2xl backdrop-blur-md text-white/90"
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="flex gap-4 p-5 bg-white rounded-3xl shadow-lg shadow-emerald-900/10">
                        <div className="flex-1 flex flex-col items-center border-r border-gray-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To Deliver</p>
                            <span className="text-2xl font-black text-slate-800">
                                <CountUp end={pendingCount} duration={1} />
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                            <span className="text-2xl font-black text-emerald-500">
                                <CountUp end={completedCount} duration={1} />
                            </span>
                        </div>
                    </div>
                </motion.header>

                <div className="px-6 -mt-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            placeholder="Find addresses or customers..." 
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                        Today's Schedule
                        <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-bold">
                            {deliveries.length} TASKS
                        </span>
                    </h3>
                    <motion.button 
                        whileTap={{ rotate: 180 }}
                        onClick={fetchTodayDeliveries}
                        className={`text-emerald-500 p-2 rounded-xl bg-emerald-50 ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </motion.button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <DeliverySkeleton />
                        <DeliverySkeleton />
                        <DeliverySkeleton />
                    </div>
                ) : deliveries.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="bg-slate-100 p-8 rounded-full mb-6">
                            <Truck size={48} className="text-slate-400" />
                        </div>
                        <h4 className="text-xl font-black mb-2">Rest Easy</h4>
                        <p className="text-sm text-slate-400 max-w-[200px]">You've completed all tasks or none were assigned today.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="space-y-4"
                    >
                        {deliveries.map(delivery => (
                            <motion.div 
                                key={delivery.uuid}
                                layout
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: { y: 0, opacity: 1 }
                                }}
                                whileHover={{ scale: 1.01 }}
                                className={`group relative bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 border-l-[6px] ${getStatusStyles(delivery.delivery_status)} transition-all`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                                            {delivery.status_display || delivery.delivery_status.replace('_', ' ')}
                                        </span>
                                        {delivery.delivery_status !== 'delivered' && (
                                            <ETACountdown targetTime={delivery.scheduled_time} />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-gray-50">
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600">
                                            {new Date(delivery.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                        <MapPin size={24} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-black truncate">{delivery.customer_name}</h3>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{delivery.address}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {delivery.delivery_status !== 'delivered' ? (
                                        <>
                                            <div className="flex gap-2">
                                                <motion.a 
                                                    whileTap={{ scale: 0.9 }}
                                                    href={`tel:${delivery.customer_phone || '555-0123'}`}
                                                    className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <Phone size={20} />
                                                </motion.a>
                                                <motion.a 
                                                    whileTap={{ scale: 0.9 }}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`}
                                                    className="flex items-center justify-center w-11 h-11 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <Navigation size={20} />
                                                </motion.a>
                                            </div>
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleComplete(delivery.uuid)}
                                                className="col-span-1 bg-emerald-500 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 flex-1"
                                            >
                                                <Scan size={18} /> COMPLETE
                                            </motion.button>
                                        </>
                                    ) : (
                                        <div className="col-span-2 flex items-center justify-center gap-3 py-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100/50">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">Signed & Verified</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>

            {/* Bottom Navigation & floating actions */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9, rotate: -360 }}
                    onClick={fetchTodayDeliveries}
                    className="bg-emerald-600 text-white p-5 rounded-3xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center"
                >
                    <RefreshCw size={24} className={refreshing ? 'animate-spin' : ''} />
                </motion.button>
            </div>

            {selectedDelivery && (
                <ProofModal 
                    deliveryUuid={selectedDelivery} 
                    onClose={() => setSelectedDelivery(null)} 
                    onSuccess={() => {
                        setSelectedDelivery(null);
                        fetchTodayDeliveries();
                    }}
                />
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;  
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default DriverDashboard;
