import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader, MapPin, ShieldCheck, Cloud } from 'lucide-react';
import api from '../services/api';

interface ProofModalProps {
  deliveryUuid: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ProofModal: React.FC<ProofModalProps> = ({ deliveryUuid, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

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

      const response = await api.post('/api/upload/photo', formData);
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
    if (!canvasRef.current) return;

    setUploading(true);
    try {
      const base64Signature = canvasRef.current.toDataURL('image/png');
      const response = await api.post('/api/upload/signature', { signature: base64Signature });
      setSignatureData(response.data.url);
      setStep(3);
    } catch (error) {
      console.error('Signature upload failed', error);
      alert('Signature upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support both mouse and touch events
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const coords = getCoordinates(e);
    if (!coords || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    
    // Prevent default scrolling when drawing on touch devices
    if ('touches' in e) {
       e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleSubmit = async () => {
    if (!gps) {
      alert('GPS lock required before submission.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/deliveries/${deliveryUuid}/proof`, {
        photo_url: photoUrl,
        signature_url: signatureData,
        gps_lat: gps.lat,
        gps_lng: gps.lng,
        gps_accuracy: gps.accuracy,
        recorded_at: new Date().toISOString()
      });
      onSuccess();
    } catch (error: any) {
      console.error('Proof submission failed', error);
      alert('Final submission failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = photoUrl && signatureData && gps;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Complete Delivery</h3>
            <p className="text-sm text-slate-600 mt-2">Secure proof of delivery required.</p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              gps ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              <MapPin size={12} /> {gps ? 'GPS LOCKED' : 'ACQUIRING GPS...'}
            </div>
            {photoUrl && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Cloud size={12} /> PHOTO STORED
              </div>
            )}
          </div>

          {gpsError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-6">
              {gpsError}
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-4">Step 1: Capture Photo Evidence</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-slate-400 transition bg-slate-50"
              >
                {!photoUrl && !uploading && (
                  <>
                    <div className="p-4 bg-white rounded-full mb-3 shadow-sm">
                      <Camera size={32} className="text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600">Tap to take photo</p>
                  </>
                )}
                {uploading && (
                  <div className="text-center">
                    <Loader size={32} className="animate-spin text-blue-600 mb-2 mx-auto" />
                    <p className="text-sm text-slate-600">Uploading...</p>
                  </div>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-4">Step 2: Customer Signature</p>
              <canvas
                ref={canvasRef}
                width={320}
                height={160}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                style={{ touchAction: 'none' }}
                className="w-full border-2 border-slate-300 rounded-xl bg-white cursor-crosshair"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearSignature}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleSignatureSave}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader size={16} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Tamper-Proof Ready</h4>
              <p className="text-sm text-slate-600 mb-6">
                Evidence uploaded and secure. Ready to finalize.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">GPS Accuracy</p>
                  <p className="text-sm font-bold text-slate-900">{gps?.accuracy.toFixed(1)}m</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">Status</p>
                  <p className="text-sm font-bold text-slate-900">Verified</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : 'Finalize & Record'}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-2 mt-6 justify-center">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofModal;
