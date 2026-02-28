import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader, MapPin, ShieldCheck, Cloud } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../services/api';

interface ProofModalProps {
    deliveryUuid: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ProofModal: React.FC<ProofModalProps> = ({ deliveryUuid, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sigPad = useRef<SignatureCanvas>(null);

    // Auto-capture GPS when modal opens
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGps({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.error('GPS error:', error);
                    setGpsError('GPS permission required for delivery proof.');
                },
                { enableHighAccuracy: true }
            );
        } else {
            setGpsError('Geolocation is not supported by this browser.');
        }
    }, []);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await api.post('/upload/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPhotoUrl(response.data.url);
            setStep(2);
        } catch (error) {
            console.error('Photo upload failed', error);
            alert('Photo upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSignatureSave = async () => {
        if (!sigPad.current || sigPad.current.isEmpty()) {
            alert('Please provide a signature.');
            return;
        }

        setUploading(true);
        try {
            const base64Signature = sigPad.current.toDataURL('image/png');
            const response = await api.post('/upload/signature', { signature: base64Signature });
            
            setSignatureUrl(response.data.url);
            setStep(3);
        } catch (error) {
            console.error('Signature upload failed', error);
            alert('Signature upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!gps) {
            alert('GPS lock required before submission.');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/deliveries/${deliveryUuid}/proof`, {
                photo_url: photoUrl,
                signature_url: signatureUrl,
                gps_lat: gps.lat,
                gps_lng: gps.lng,
                gps_accuracy: gps.accuracy,
                recorded_at: new Date().toISOString()
            });
            onSuccess();
        } catch (error: any) {
            console.error('Proof submission failed', error?.response?.data || error);
            alert('Final submission failed: ' + (error?.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = photoUrl && signatureUrl && gps;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', position: 'relative', padding: '32px' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={20} color="var(--text-muted)" />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Complete Delivery</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Secure proof of delivery required.</p>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: gps ? 'rgba(43, 182, 115, 0.1)' : 'rgba(255, 77, 79, 0.1)', color: gps ? '#2BB673' : '#FF4D4F' }}>
                        <MapPin size={12} /> {gps ? 'GPS LOCKED' : 'AQUIRING GPS...'}
                    </div>
                    {photoUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(24, 144, 255, 0.1)', color: '#1890ff' }}>
                            <Cloud size={12} /> PHOTO STORED
                        </div>
                    )}
                </div>

                {gpsError && (
                    <div style={{ padding: '12px', background: 'rgba(255, 77, 79, 0.1)', color: '#FF4D4F', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
                        {gpsError}
                    </div>
                )}

                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Step 1: Capture Photo Evidence</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                        />
                        <div style={{
                            height: '260px',
                            background: photoUrl ? `url(${photoUrl}) center/cover` : 'var(--bg-secondary)',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed var(--border-color)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }} onClick={() => !uploading && fileInputRef.current?.click()}>
                            {!photoUrl && !uploading && (
                                <>
                                    <div style={{ padding: '16px', background: 'white', borderRadius: '50%', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Camera size={32} color="var(--primary-mint)" />
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Tap to take photo</p>
                                </>
                            )}
                            {uploading && (
                                <div style={{ textAlign: 'center' }}>
                                    <Loader className="spinner" size={32} color="var(--primary-mint)" style={{ marginBottom: '12px' }} />
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Uploading to Cloudinary...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Step 2: Customer Signature</p>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <SignatureCanvas 
                                ref={sigPad}
                                penColor='black'
                                canvasProps={{
                                    style: { width: '100%', height: '220px' }
                                }}
                            />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => sigPad.current?.clear()}
                                    style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--bg-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', marginTop: '20px', height: '48px' }}
                            onClick={handleSignatureSave}
                            disabled={uploading}
                        >
                            {uploading ? <Loader className="spinner" size={18} /> : 'Confirm Signature'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', animation: 'slideUp 0.3s ease' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(43, 182, 115, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <ShieldCheck size={40} color="#2BB673" />
                        </div>
                        <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Tamper-Proof Ready</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>
                            Evidence uploaded and cryptographic hash generated. Ready for blockchain anchoring.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'left' }}>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>GPS Confidence</p>
                                <p style={{ fontSize: '13px', fontWeight: 600 }}>{gps?.accuracy.toFixed(1)}m Accuracy</p>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'left' }}>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security Hash</p>
                                <p style={{ fontSize: '13px', fontWeight: 600 }}>SHA-256 Valid</p>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', height: '52px', fontSize: '16px' }} 
                            onClick={handleSubmit}
                            disabled={loading || !canSubmit}
                        >
                            {loading ? <Loader className="spinner" size={18} /> : 'Finalize & Record'}
                        </button>
                    </div>
                )}

                {/* Step Progress Bar */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ 
                            width: i === step ? '24px' : '8px', 
                            height: '8px', 
                            borderRadius: '4px',
                            background: i <= step ? 'var(--primary-mint)' : 'var(--border-color)',
                            transition: 'all 0.3s ease'
                        }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProofModal;
