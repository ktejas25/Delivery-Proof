import React, { useEffect, useState } from 'react';
import { 
    X, ShieldAlert, CheckCircle, Clock, User, 
    MapPin, Hash, MessageSquare, Send, AlertCircle 
} from 'lucide-react';
import api from '../services/api';

interface DisputeDetailsModalProps {
    disputeUuid: string;
    onClose: () => void;
    onUpdate: () => void;
    userRole: string;
}

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({ disputeUuid, onClose, onUpdate, userRole }) => {
    const [dispute, setDispute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [resolutionType, setResolutionType] = useState('refund');
    const [notes, setNotes] = useState('');

    const fetchDetails = async () => {
        try {
            const response = await api.get(`/disputes/${disputeUuid}`);
            setDispute(response.data);
        } catch (error) {
            console.error('Failed to fetch dispute details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [disputeUuid]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmittingComment(true);
        try {
            await api.post(`/disputes/${disputeUuid}/comments`, { comment });
            setComment('');
            fetchDetails();
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleResolve = async () => {
        setResolving(true);
        try {
            await api.patch(`/disputes/${disputeUuid}`, {
                status: 'resolved',
                resolution: resolutionType,
                internal_notes: notes
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to resolve dispute', error);
        } finally {
            setResolving(false);
        }
    };

    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', textAlign: 'center', padding: '100px' }}>
                <div className="spinner"></div>
            </div>
        </div>
    );

    if (!dispute) return null;

    const canAction = userRole === 'admin' || userRole === 'analyst';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '1000px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                            <ShieldAlert size={20} color="#FF4D4F" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Investigation: Order #{dispute.order_number}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>UUID: {dispute.uuid}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', flex: 1, overflow: 'hidden' }}>
                    {/* Left Panel: Proof & Details */}
                    <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Customer Claim</h4>
                            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-highlight)', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '15px', fontWeight: 500 }}>"{dispute.customer_claim}"</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> Filed: {new Date(dispute.created_at).toLocaleString()} • Type: {dispute.dispute_type.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Order Assignment</h4>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} />
                                <span style={{ fontSize: '14px' }}>Driver: <strong>{dispute.driver_first_name} {dispute.driver_last_name}</strong></span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Delivery Evidence</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {(dispute.proof_photo_url || (dispute.photos && dispute.photos.length > 0)) ? (
                                    <>
                                        {dispute.proof_photo_url ? (
                                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                <img src={dispute.proof_photo_url} alt="Proof" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                                <div style={{ padding: '8px', background: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                                    <MapPin size={12} /> {dispute.proof_gps_lat?.toFixed(4)}, {dispute.proof_gps_lng.toFixed(4)}
                                                </div>
                                            </div>
                                        ) : (
                                            dispute.photos.map((photo: any) => (
                                                <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                    <img src={photo.s3_url} alt="Proof" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                                    <div style={{ padding: '8px', background: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                                        <MapPin size={12} /> {photo.gps_lat.toFixed(4)}, {photo.gps_lng.toFixed(4)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {dispute.proof_signature_url && (
                                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#F8F9FA' }}>
                                                <p style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>CUSTOMER SIGNATURE</p>
                                                <img src={dispute.proof_signature_url} alt="Signature" style={{ width: '100%', height: '120px', objectFit: 'contain', padding: '10px' }} />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ gridColumn: 'span 2', padding: '40px', textAlign: 'center', background: 'var(--bg-highlight)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No photo evidence available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Verification Status</h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '8px', background: (dispute.blockchain_confirmed || dispute.delivery_proof_hash) ? 'rgba(43, 182, 115, 0.1)' : 'rgba(255, 77, 79, 0.1)', border: '1px solid' + ((dispute.blockchain_confirmed || dispute.delivery_proof_hash) ? '#2BB673' : '#FF4D4F') }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Hash size={16} />
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>Cryptographic Integrity</span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: (dispute.blockchain_confirmed || dispute.delivery_proof_hash) ? '#2BB673' : '#FF4D4F' }}>
                                            {(dispute.blockchain_confirmed || dispute.delivery_proof_hash) ? 'VERIFIED' : 'NOT CONFIRMED'}
                                        </span>
                                    </div>
                                    {dispute.delivery_proof_hash && (
                                        <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}>
                                            HASH: {dispute.delivery_proof_hash}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>AI Fraud Score</span>
                                        <span style={{ fontWeight: 800, color: dispute.fraud_score > 70 ? '#FF4D4F' : '#2BB673' }}>{dispute.fraud_score}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${dispute.fraud_score}%`, height: '100%', background: dispute.fraud_score > 70 ? '#FF4D4F' : '#2BB673' }}></div>
                                    </div>
                                    {dispute.ai_explanation && (
                                        <p style={{ fontSize: '12px', color: 'var(--text-body)', marginTop: '12px', lineHeight: 1.4, padding: '8px', background: 'white', borderRadius: '6px' }}>
                                            <strong>AI Summary:</strong> {dispute.ai_explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Audit Timeline</h4>
                            <div style={{ borderLeft: '2px solid var(--border-color)', marginLeft: '8px', paddingLeft: '20px' }}>
                                {dispute.timeline && dispute.timeline.map((item: any, idx: number) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '16px' }}>
                                        <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-mint)', border: '2px solid white' }}></div>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{item.action.replace(/_/g, ' ')}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleString()} • {item.user_type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Comments & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-highlight)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={16} /> Team Comments
                            </h4>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {dispute.comments && dispute.comments.map((c: any) => (
                                    <div key={c.uuid} style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{c.first_name} {c.last_name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({c.user_type})</span></span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{c.comment}</p>
                                    </div>
                                ))}
                                {(!dispute.comments || dispute.comments.length === 0) && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>No internal comments yet.</p>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'white' }}>
                            {canAction ? (
                                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="Add internal investigation note..." 
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        style={{ marginBottom: 0 }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        style={{ padding: '10px' }}
                                        disabled={submittingComment || !comment.trim()}
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    <AlertCircle size={16} /> Support agents have read-only access to comments.
                                </div>
                            )}

                            {canAction && dispute.status !== 'resolved' && dispute.status !== 'fraud' && (
                                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border-color)' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Final Resolution</h4>
                                    <select 
                                        className="input" 
                                        value={resolutionType}
                                        onChange={e => setResolutionType(e.target.value)}
                                    >
                                        <option value="refund">Refund Approved</option>
                                        <option value="denied">Claim Denied (Valid Delivery)</option>
                                        <option value="fraud">Confirm Fraudulent Behavior</option>
                                        <option value="redelivery">Redelivery Scheduled</option>
                                    </select>
                                    <textarea 
                                        className="input" 
                                        placeholder="Resolution notes (required)..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ width: '100%', background: '#2BB673' }}
                                        disabled={resolving || !notes.trim()}
                                        onClick={handleResolve}
                                    >
                                        <CheckCircle size={18} style={{ marginRight: '8px' }} />
                                        {resolving ? 'Resolving...' : 'Complete Investigation'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeDetailsModal;
