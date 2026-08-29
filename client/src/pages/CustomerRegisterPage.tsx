import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from "lucide-react";

const CustomerRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    business_id: 1
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { customerRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await customerRegister(formData);
      navigate("/customer/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Customer registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Customer Features (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/30">
                <Package size={20} />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">
                  DeliveryProof
                </h1>
                <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">
                  Customer Portal
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
              Get instant tracking & cryptographic delivery proofs.
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Create your customer account to track incoming dispatches, receive instant delivery photos, and manage disputes with 100% transparency.
            </p>
          </div>

          {/* Value Props */}
          <div className="relative z-10 space-y-2.5 my-6">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Real-time delivery progress updates</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Direct communication with assigned driver</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Instant electronic signature verification</span>
            </div>
          </div>

          {/* Footer Switcher */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <Link to="/customer/login" className="text-indigo-300 hover:text-white font-semibold flex items-center gap-1">
              ← Back to Customer Login
            </Link>
          </div>
        </div>

        {/* Right Side: Registration Form (7 cols) */}
        <div className="md:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-5">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Create Customer Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in your details to start tracking deliveries
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    required
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Delivery Address
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    required
                    type="text"
                    placeholder="123 Market St, Suite 400"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Sign In Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already registered? </span>
            <Link
              to="/customer/login"
              className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors"
            >
              Sign In to Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerRegisterPage;
