import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Package, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2
} from "lucide-react";

const CustomerLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { customerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await customerLogin(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid customer credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
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
              Track your parcels in real-time with verified proof.
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              View live driver ETA, inspect cryptographic delivery photos, and file dispute claims securely.
            </p>
          </div>

          {/* Value Props */}
          <div className="relative z-10 space-y-2.5 my-6">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Live GPS driver coordinates & transit map</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Tamper-proof photo & signature receipts</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>1-Click dispute resolution triage</span>
            </div>
          </div>

          {/* Footer Switcher */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <Link to="/login" className="text-blue-300 hover:text-white font-semibold flex items-center gap-1">
              ← Admin / Staff Sign In
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form (7 cols) */}
        <div className="md:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Customer Sign In
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your customer account credentials to view your orders
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Customer Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Register Link */}
          <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>New customer? </span>
            <Link
              to="/customer/register"
              className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerLoginPage;
