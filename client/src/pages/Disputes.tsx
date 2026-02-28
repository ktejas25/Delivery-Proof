import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { 
    AlertTriangle, ShieldAlert, CheckCircle, 
    Search, Filter, ArrowUpDown, ChevronLeft, 
    ChevronRight, Info, AlertOctagon, TrendingUp,
    ShieldCheck, Clock
} from 'lucide-react';
import DisputeDetailsModal from '../components/DisputeDetailsModal';

const Disputes: React.FC = () => {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
    
    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.user_type || 'support';

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/disputes', {
                params: { search, status, sort, page, limit: 10 }
            });
            setDisputes(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Fetch disputes failed', error);
        } finally {
            setLoading(false);
        }
    }, [search, status, sort, page]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/disputes/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.error('Fetch analytics failed', error);
        }
    };

    useEffect(() => {
        fetchDisputes();
        fetchAnalytics();
    }, [fetchDisputes]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fraud': return '#FF4D4F';
            case 'investigating': return '#FAAD14';
            case 'resolved': return '#2BB673';
            case 'open': return '#52C41A';
            default: return 'var(--text-muted)';
        }
    };

    const renderSkeleton = () => (
        <div className="dashboard-grid" style={{ width: '100%', margin: 0 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="card skeleton" style={{ gridColumn: 'span 6', height: '280px', opacity: 0.6 }} />
            ))}
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Fraud & Dispute Investigation</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor and resolve delivery disputes with AI-powered fraud detection.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Role:</span>
                        <span style={{ fontSize: '12px', background: 'var(--bg-highlight)', color: 'var(--primary-mint)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>

            {/* Analytics Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white' }}>
                    <div style={{ padding: '12px', background: 'rgba(43, 182, 115, 0.1)', borderRadius: '12px' }}>
                        <AlertTriangle color="#2BB673" size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Disputes</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics?.active || 0}</h4>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white' }}>
                    <div style={{ padding: '12px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '12px' }}>
                        <AlertOctagon color="#FF4D4F" size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>High-Risk Cases</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics?.high_risk || 0}</h4>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white' }}>
                    <div style={{ padding: '12px', background: 'rgba(82, 196, 26, 0.1)', borderRadius: '12px' }}>
                        <CheckCircle color="#52C41A" size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Resolved Today</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics?.resolved_today || 0}</h4>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white' }}>
                    <div style={{ padding: '12px', background: 'rgba(250, 173, 20, 0.1)', borderRadius: '12px' }}>
                        <TrendingUp color="#FAAD14" size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg Fraud Score</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics?.avg_score ? parseFloat(analytics.avg_score).toFixed(1) : 0}%</h4>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Order # or Customer..." 
                        style={{ paddingLeft: '48px', marginBottom: 0 }}
                        className="input"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <select 
                            style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '14px', outline: 'none', fontWeight: 500 }}
                            value={status}
                            onChange={e => { setStatus(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="fraud">Fraud Flagged</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <ArrowUpDown size={16} color="var(--text-muted)" />
                        <select 
                            style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '14px', outline: 'none', fontWeight: 500 }}
                            value={sort}
                            onChange={e => { setSort(e.target.value); setPage(1); }}
                        >
                            <option value="newest">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                            <option value="fraud_high">Highest Risk</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? renderSkeleton() : (
                <>
                    {disputes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 24px', background: 'white', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <ShieldCheck size={40} color="var(--primary-mint)" />
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Active Disputes</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Great job! All delivery disputes have been cleared or no new claims have been filed.</p>
                        </div>
                    ) : (
                        <div className="dashboard-grid" style={{ width: '100%', margin: 0, padding: 0 }}>
                            {disputes.map(dispute => (
                                <div key={dispute.uuid} className="card" style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: getStatusColor(dispute.status) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AlertTriangle size={20} color={getStatusColor(dispute.status)} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Order #{dispute.order_number}</h3>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dispute.customer_name}</p>
                                            </div>
                                        </div>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '11px', 
                                            fontWeight: 700,
                                            background: getStatusColor(dispute.status) + '20',
                                            color: getStatusColor(dispute.status),
                                            height: 'fit-content',
                                            textTransform: 'uppercase'
                                        }}>
                                            {dispute.status}
                                        </span>
                                    </div>

                                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldAlert size={14} color={dispute.fraud_score > 70 ? '#FF4D4F' : '#2BB673'} />
                                                <p style={{ fontSize: '13px', fontWeight: 600 }}>AI Fraud Confidence</p>
                                            </div>
                                            <span style={{ fontSize: '16px', fontWeight: 800, color: dispute.fraud_score > 70 ? '#FF4D4F' : '#2BB673' }}>
                                                {dispute.fraud_score}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'white', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${dispute.fraud_score}%`, 
                                                height: '100%', 
                                                background: dispute.fraud_score > 70 ? '#FF4D4F' : '#2BB673' 
                                            }}></div>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={12} /> {dispute.fraud_score > 70 ? 'High probability of fraudulent claim pattern.' : 'Standard claim, low fraud risk detected.'}
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '20px', flex: 1 }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Customer Claim</p>
                                        <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-body)', lineHeight: 1.5 }}>
                                            "{dispute.customer_claim.length > 120 ? dispute.customer_claim.substring(0, 120) + '...' : dispute.customer_claim}"
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px' }}>
                                        <button 
                                            onClick={() => setSelectedDispute(dispute.uuid)}
                                            className="btn btn-secondary" 
                                            style={{ flex: 1, gap: '8px' }}
                                        >
                                            <ShieldAlert size={16} /> Inspect & Investigate
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                            <Clock size={14} /> {new Date(dispute.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                            <button 
                                className="btn" 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                style={{ background: 'white', border: '1px solid var(--border-color)', padding: '8px' }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button 
                                className="btn" 
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                style={{ background: 'white', border: '1px solid var(--border-color)', padding: '8px' }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedDispute && (
                <DisputeDetailsModal 
                    disputeUuid={selectedDispute}
                    onClose={() => setSelectedDispute(null)}
                    onUpdate={() => { fetchDisputes(); fetchAnalytics(); }}
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default Disputes;
