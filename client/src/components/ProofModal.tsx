import React, { useState, useRef, useEffect } from "react";
import { X, Camera, CheckCircle } from "lucide-react";
import { Delivery } from "./driver/types";
import ActionButton from "./driver/ui/ActionButton";
import api from "../services/api";

interface ProofModalProps {
  delivery: Delivery;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (proof: ProofData) => Promise<void>;
  mode?: "upload" | "view";
}

export interface ProofData {
  uuid: string;
  photoUrl?: string;
  signature?: string;
  notes?: string;
  timestamp: number;
}

const ProofModal: React.FC<ProofModalProps> = ({
  delivery,
  isOpen,
  onClose,
  onSubmit,
  mode = "upload",
}) => {
  const [step, setStep] = useState<"capture" | "signature" | "confirm">(
    "capture",
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const [viewProofData, setViewProofData] = useState<ProofData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mode === "view" && delivery?.uuid) {
      const fetchProof = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/proofs/${delivery.uuid}`);
          if (response.data) {
            setViewProofData(response.data);
          } else {
            setViewProofData(null);
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            setViewProofData(null);
          } else {
            setError("Failed to load proof data.");
          }
        } finally {
          setIsLoading(false);
        }
      };
      // Reset view state when opening
      setViewProofData(null);
      fetchProof();
    }
  }, [isOpen, mode, delivery?.uuid]);

  if (!isOpen) return null;

  const handlePhotoCapture = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setStep("signature");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoCapture(file);
    }
  };

  const startSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endSignature = () => {
    isDrawing.current = false;
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
      setStep("confirm");
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        uuid: delivery.uuid,
        photoUrl: photoUrl || undefined,
        signature: signature || undefined,
        notes: notes || undefined,
        timestamp: Date.now(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in-up">
          {/* Header */}
          <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Delivery Proof
              </h2>
              <p className="text-sm text-slate-600">{delivery.customer_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {mode === "view" ? (
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium">
                    Loading proof details...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                  <p className="font-semibold">{error}</p>
                </div>
              ) : !viewProofData ||
                (!viewProofData.photoUrl &&
                  !viewProofData.signature &&
                  !viewProofData.notes) ? (
                <div className="bg-slate-50 text-slate-500 p-8 rounded-xl text-center border-2 border-dashed border-slate-200">
                  <p className="font-semibold text-lg">No proof found</p>
                  <p className="text-sm mt-1">
                    This delivery record exists but has no proof data attached.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {viewProofData.photoUrl && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Proof Photo
                      </h3>
                      <img
                        src={viewProofData.photoUrl}
                        alt="Proof"
                        className="w-full h-48 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}

                  {viewProofData.signature && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Signature
                      </h3>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-2">
                        <img
                          src={viewProofData.signature}
                          alt="Signature"
                          className="w-full h-24 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {viewProofData.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Delivery Notes
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {viewProofData.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {viewProofData.timestamp && (
                    <div className="text-left text-xs text-slate-500 pt-2 border-t border-slate-100">
                      Submitted on:{" "}
                      {new Date(viewProofData.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                {/* Step 1: Photo Capture */}
                {step === "capture" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        1. Proof of Delivery
                      </h3>
                      <p className="text-sm text-slate-600">
                        Take or upload a photo as proof of delivery
                      </p>
                    </div>

                    {photoUrl ? (
                      <div className="space-y-3">
                        <img
                          src={photoUrl}
                          alt="Proof"
                          className="w-full h-48 object-cover rounded-xl border border-slate-200"
                        />
                        <button
                          onClick={() => {
                            setPhotoUrl(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition text-sm"
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition"
                        >
                          <Camera
                            size={32}
                            className="mx-auto text-slate-400 mb-2"
                          />
                          <p className="font-semibold text-slate-900">
                            Take or upload photo
                          </p>
                          <p className="text-sm text-slate-600">
                            Click to select an image
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    )}

                    <ActionButton
                      onClick={() => setStep("signature")}
                      label="Continue"
                      variant={photoUrl ? "primary" : "secondary"}
                      disabled={!photoUrl}
                      size="md"
                    />
                  </div>
                )}

                {/* Step 2: Signature */}
                {step === "signature" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        2. Signature (Optional)
                      </h3>
                      <p className="text-sm text-slate-600">
                        Customer signature confirms delivery
                      </p>
                    </div>

                    <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white">
                      <canvas
                        ref={signatureCanvasRef}
                        width={400}
                        height={150}
                        onMouseDown={startSignature}
                        onMouseMove={drawSignature}
                        onMouseUp={endSignature}
                        onMouseLeave={endSignature}
                        className="w-full bg-white cursor-crosshair block"
                      />
                    </div>

                    <button
                      onClick={clearSignature}
                      className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition text-sm"
                    >
                      Clear Signature
                    </button>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any delivery notes..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("capture")}
                        className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition text-sm min-h-[44px]"
                      >
                        Back
                      </button>
                      <ActionButton
                        onClick={saveSignature}
                        label="Review"
                        variant="primary"
                        size="md"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === "confirm" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle
                        size={48}
                        className="mx-auto text-emerald-500 mb-3"
                      />
                      <h3 className="font-bold text-lg text-slate-900">
                        Review Proof
                      </h3>
                    </div>

                    {photoUrl && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">
                          Photo
                        </p>
                        <img
                          src={photoUrl}
                          alt="Proof"
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    )}

                    {signature && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">
                          Signature
                        </p>
                        <img
                          src={signature}
                          alt="Signature"
                          className="w-full h-20 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    )}

                    {notes && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">
                          Notes
                        </p>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {notes}
                        </p>
                      </div>
                    )}

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-700">
                      <p className="font-semibold">Ready to submit</p>
                      <p>Marking delivery as complete</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("signature")}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-semibold transition text-sm min-h-[44px]"
                      >
                        Edit
                      </button>
                      <ActionButton
                        onClick={handleSubmit}
                        label={
                          isSubmitting ? "Submitting..." : "Complete Delivery"
                        }
                        variant="success"
                        loading={isSubmitting}
                        size="md"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProofModal;
