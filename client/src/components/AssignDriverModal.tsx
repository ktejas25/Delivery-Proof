import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

interface AssignDriverModalProps {
    deliveryUuid: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ deliveryUuid, onClose, onSuccess }) => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [d, delivery] = await Promise.all([
                    api.get('/auth/drivers').catch(() => ({ data: [] })),
                    api.get(`/deliveries/${deliveryUuid}`)
                ]);
                setDrivers(d.data);
                setSelectedDriverId(delivery.data.driver_id || '');
            } catch (err: any) {
                setError('Failed to load data');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [deliveryUuid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // We can use the same update delivery endpoint or specific one if available
            // Since we already have updateDelivery on backend, we use it.
            // But we need the full delivery data if we use updateDelivery which requires all fields.
            // Better to have a specific partial update or fetch full data first.
            
            // To be safe and simple, let's just fetch full data if they haven't been fetched.
            // Actually, let's add a PATCH endpoint for driver assignment specifically to the backend.
            
            await api.patch(`/deliveries/${deliveryUuid}/driver`, { driver_id: selectedDriverId || null });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign driver');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    };

    if (fetching) return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={20} color="var(--text-muted)" />
                </button>

                <h3 style={{ marginBottom: '6px' }}>Assign Driver</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Select a driver for this delivery</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Driver</label>
                        <select 
                            value={selectedDriverId} 
                            onChange={(e) => setSelectedDriverId(e.target.value)} 
                            style={inputStyle}
                        >
                            <option value="">Unassigned</option>
                            {drivers.map(d => (
                                <option key={d.driver_id} value={d.driver_id}>{d.first_name} {d.last_name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'white', border: '1px solid var(--border-color)' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignDriverModal;
