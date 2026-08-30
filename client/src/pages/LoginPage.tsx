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
  Truck, 
  AlertCircle,
  Loader2,
  PackageCheck,
  Check
} from 'lucide-react';
import GoogleAuthModal from '../components/GoogleAuthModal';

const LoginPage: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('itstejaskadam@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

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

  const isEmailValid = email.includes('@') && email.includes('.');

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-[1060px] bg-white rounded-[32px] border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Hero & Logistics Feature Showcase (6 cols) */}
        <div className="lg:col-span-6 bg-[#09152E] text-white flex flex-col justify-between relative overflow-hidden p-8 lg:p-10">
          {/* Background Truck & Cyber Map Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 pointer-events-none mix-blend-luminosity scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('/delivery_fleet_hero.jpg')` }}
          />
          {/* Ambient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060E1F] via-[#09152E]/70 to-[#09152E]/90 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                <PackageCheck />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white leading-none">
                  DeliveryProof
                </h1>
                <span className="text-[10px] font-extrabold text-[#00E5FF] tracking-wider uppercase">
                  UNIVERSAL LOGISTICS OS
                </span>
              </div>
            </div>

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-md mb-4">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verifiable Proof of Delivery</span>
            </div>

            {/* Hero Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-tight mb-3">
              One platform for <br />
              <span className="text-[#00D2FF]">modern fleet </span>
              <span className="text-[#B388FF]">operations & tracking.</span>
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed font-normal max-w-md">
              Cryptographic SHA-256 receipts, automated AI fraud inspection, and sub-second GPS telemetry designed for seamless logistics.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0F1E38]/85 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cryptographic PoD Ledger</p>
                <p className="text-[11px] text-slate-300/80">Tamper-proof digital signatures & verified photo evidence</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0F1E38]/85 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Real-Time Telemetry & Maps</p>
                <p className="text-[11px] text-slate-300/80">Sub-second driver coordinates with geofenced delivery zones</p>
              </div>
            </div>
          </div>

          {/* Bottom Security / Status Bar */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Systems Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>SOC-2 & ISO 27001 Ready</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean White Sign-in Card (6 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Top Center Shield Icon Badge */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
                <ShieldCheck size={24} className="text-blue-600" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in with your credentials to access your workspace
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none"
                  />
                  {isEmailValid && (
                    <Check size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    PASSWORD
                  </label>
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors">
                    Forgot password?
                  </span>
                </div>
                <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer font-medium">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing In...</span>
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

            {/* Divider OR */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold text-[10px] tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:border-slate-300 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Bottom Link & Security Badge */}
          <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
            <div>
              <span>Don't have an account yet? </span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors hover:underline"
              >
                Create an Account
              </Link>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-blue-500" />
              <span>Protected by end-to-end 256-bit SSL encryption</span>
            </div>
          </div>
        </div>

      </div>

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        mode="login"
      />
    </div>
  );
};

export default LoginPage;
