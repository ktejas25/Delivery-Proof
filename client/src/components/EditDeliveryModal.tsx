import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

interface EditDeliveryModalProps {
    deliveryUuid: string;
    onClose: () => void;
    onSuccess: () => void;
}

const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({ deliveryUuid, onClose, onSuccess }) => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        customer_id: '',
        order_number: '',
        scheduled_time: '',
        priority_level: 'medium',
        delivery_notes: '',
        driver_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, d, delivery] = await Promise.all([
                    api.get('/customers').catch(() => ({ data: [] })),
                    api.get('/auth/drivers').catch(() => ({ data: [] })),
                    api.get(`/deliveries/${deliveryUuid}`)
                ]);
                setCustomers(c.data);
                setDrivers(d.data);
                
                const dlv = delivery.data;
                // Format date for datetime-local input
                const date = new Date(dlv.scheduled_time);
                const formattedDate = date.toISOString().slice(0, 16);

                setForm({
                    customer_id: dlv.customer_id,
                    order_number: dlv.order_number,
                    scheduled_time: formattedDate,
                    priority_level: dlv.priority_level,
                    delivery_notes: dlv.delivery_notes || '',
                    driver_id: dlv.driver_id || ''
                });
            } catch (err: any) {
                setError('Failed to load delivery data');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [deliveryUuid]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Destructure to remove order_number from the payload
            const { order_number: _, ...payload } = form;
            await api.put(`/deliveries/${deliveryUuid}`, payload);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update delivery');
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
            <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '40px', textAlign: 'center' }}>
                <p>Loading delivery details...</p>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '520px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={20} color="var(--text-muted)" />
                </button>

                <h3 style={{ marginBottom: '6px' }}>Edit Delivery</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Update delivery details</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Order Number</label>
                        <input 
                            name="order_number" 
                            value={form.order_number} 
                            readOnly 
                            style={{ ...inputStyle, background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-muted)' }} 
                        />
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Order number cannot be changed once created.</p>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Customer *</label>
                        <select name="customer_id" value={form.customer_id} onChange={handleChange} required style={inputStyle}>
                            <option value="">Select a customer...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} — {c.address}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Assign Driver</label>
                        <select name="driver_id" value={form.driver_id} onChange={handleChange} style={inputStyle}>
                            <option value="">Unassigned</option>
                            {drivers.map(d => (
                                <option key={d.driver_id} value={d.driver_id}>{d.first_name} {d.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Scheduled Time *</label>
                        <input name="scheduled_time" type="datetime-local" value={form.scheduled_time} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Priority</label>
                        <select name="priority_level" value={form.priority_level} onChange={handleChange} style={inputStyle}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Notes</label>
                        <textarea name="delivery_notes" value={form.delivery_notes} onChange={handleChange} placeholder="Delivery instructions..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>

                    {error && <p style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'white', border: '1px solid var(--border-color)' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDeliveryModal;
