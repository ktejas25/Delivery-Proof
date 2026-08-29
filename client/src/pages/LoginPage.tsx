import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Truck, 
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: DeliveryProof Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Mesh */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
                DP
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white leading-none">
                  DeliveryProof
                </h1>
                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                  Universal Logistics OS
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-semibold border border-blue-500/30">
                <Sparkles size={13} className="text-blue-400" /> Unified Operations & Tracking
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                One platform for administrators, drivers & customers.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in with your credentials to access your tailored dashboard: Enterprise Command Center, Driver Dispatches, or Customer Live Parcel Tracking.
              </p>
            </div>
          </div>

          {/* Value Props */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">SHA-256 Tamper-Proof Receipts</p>
                <p className="text-[11px] text-slate-400">Cryptographically verified proof of delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Live Telemetry & GPS Tracking</p>
                <p className="text-[11px] text-slate-400">Real-time driver location and transit ETA</p>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" /> ISO 27001 & SOC-2 Ready
            </span>
            <span className="font-semibold text-slate-300">v2.4.0 PROD</span>
          </div>
        </div>

        {/* Right Side: Unified Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your account email and password to access your dashboard
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
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
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to DeliveryProof</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Signup Link */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
