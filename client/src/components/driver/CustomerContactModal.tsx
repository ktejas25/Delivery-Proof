import React from "react";
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  ExternalLink,
  MapPin,
  Send,
  Compass,
} from "lucide-react";
import { Delivery } from "./types";
import toast from "react-hot-toast";

interface CustomerContactModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
}

const SMS_TEMPLATES = [
  {
    title: "Arrived at destination",
    body: "Hi! I'm your delivery driver and I have arrived outside with your package.",
  },
  {
    title: "5 minutes away",
    body: "Hi! I'm about 5 minutes away with your delivery.",
  },
  {
    title: "Need gate or buzzer code",
    body: "Hi, I'm outside your building and need the gate or buzzer code to complete your delivery.",
  },
  {
    title: "Safe drop confirmation",
    body: "Hi! If you are not available, please let me know if it is okay to leave your parcel at your doorstep.",
  },
];

const CustomerContactModal: React.FC<CustomerContactModalProps> = ({
  delivery,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !delivery) return null;

  const phone = delivery.customer_phone?.trim();
  const address = delivery.address;

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("No phone number registered for this customer");
    }
  };

  const handleSMS = (templateText: string) => {
    if (!phone) {
      toast.error("No phone number registered for this customer");
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    // iOS and Android sms format: sms:PHONE?&body=TEXT
    const smsUrl = `sms:${cleanPhone}?&body=${encodeURIComponent(templateText)}`;
    window.location.href = smsUrl;
  };

  const handleOpenNavigation = (app: "google" | "apple" | "waze") => {
    if (!address) return;
    const enc = encodeURIComponent(address);
    let url = `https://maps.google.com/maps?q=${enc}`;
    if (app === "apple") {
      url = `https://maps.apple.com/?daddr=${enc}`;
    } else if (app === "waze") {
      url = `https://waze.com/ul?q=${enc}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 id="contact-modal-title" className="font-bold text-base text-slate-900">
              Customer Contact & Navigation
            </h3>
            <p className="text-xs text-slate-500">{delivery.customer_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Call Button */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Voice Call
            </label>
            <button
              onClick={handleCall}
              disabled={!phone}
              className="w-full min-h-[46px] p-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Phone size={18} />
              <span>{phone ? `Call ${phone}` : "No Phone Number Available"}</span>
            </button>
          </div>

          {/* Quick SMS Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} className="text-blue-600" />
                <span>Quick SMS Messages</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-400">One-tap send</span>
            </div>

            <div className="space-y-2">
              {SMS_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSMS(tmpl.body)}
                  disabled={!phone}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 active:bg-blue-50 transition group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      {tmpl.title}
                    </span>
                    <Send size={12} className="text-slate-300 group-hover:text-blue-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    "{tmpl.body}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation App Chooser */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass size={13} className="text-indigo-600" />
              <span>Open in Navigation App</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleOpenNavigation("google")}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer border border-slate-200/70"
              >
                <Navigation size={16} className="text-blue-600" />
                <span>Google</span>
              </button>
              <button
                onClick={() => handleOpenNavigation("apple")}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer border border-slate-200/70"
              >
                <MapPin size={16} className="text-slate-800" />
                <span>Apple Maps</span>
              </button>
              <button
                onClick={() => handleOpenNavigation("waze")}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer border border-slate-200/70"
              >
                <ExternalLink size={16} className="text-cyan-600" />
                <span>Waze</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerContactModal;
