import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, customerRegister } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'business' | 'customer'>('business');

  // Business Form State
  const [businessData, setBusinessData] = useState({
    business_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  // Customer Form State
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    business_id: 1
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (accountType === 'business') {
        await register(businessData);
      } else {
        await customerRegister(customerData);
      }
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Side: Benefits Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
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
                <Sparkles size={13} className="text-blue-400" /> Instant Account Activation
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Join the verifiable delivery intelligence network.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Whether you manage an enterprise fleet or track personal deliveries, DeliveryProof gives you cryptographic certainty with SHA-256 signatures and live GPS tracking.
              </p>
            </div>
          </div>

          {/* Checkmark List */}
          <div className="relative z-10 space-y-3 my-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cryptographic Proof of Delivery</p>
                <p className="text-[11px] text-slate-400">Tamper-proof digital signatures and photo verification</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Live Route & Telemetry Monitoring</p>
                <p className="text-[11px] text-slate-400">Sub-second driver coordinates and transit ETA</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Automated Claim Triage</p>
                <p className="text-[11px] text-slate-400">Instant AI fraud scoring and dispute resolution</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Tag */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-400" /> Bank-Grade Security
            </span>
            <span>Zero Setup Fees</span>
          </div>
        </div>

        {/* Right Side: Registration Form (7 cols) */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-5">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create an Account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your account type and get started in seconds
              </p>
            </div>

            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setAccountType('business'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountType === 'business'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 size={15} />
                <span>Business / Organization</span>
              </button>

              <button
                type="button"
                onClick={() => { setAccountType('customer'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountType === 'customer'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package size={15} />
                <span>Customer / Personal</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {accountType === 'business' ? (
                <>
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business / Organization Name
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Deliveries"
                        value={businessData.business_name}
                        onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Name Row (2 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Alex"
                          value={businessData.first_name}
                          onChange={(e) => setBusinessData({ ...businessData, first_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Mercer"
                          value={businessData.last_name}
                          onChange={(e) => setBusinessData({ ...businessData, last_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="admin@company.com"
                        value={businessData.email}
                        onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="•••••••• (Min. 8 characters)"
                        value={businessData.password}
                        onChange={(e) => setBusinessData({ ...businessData, password: e.target.value })}
                        className="w-full pl-10 pr-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
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
                </>
              ) : (
                <>
                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
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
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="jane@example.com"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          placeholder="+1 555-0199"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
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
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="123 Market St, Suite 400"
                        value={customerData.address}
                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={customerData.password}
                        onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                        className="w-full pl-10 pr-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
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
                </>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Account...</span>
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

          {/* Bottom Sign In Link */}
          <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
