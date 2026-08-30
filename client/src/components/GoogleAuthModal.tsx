import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, UserPlus, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  mode = 'login',
}) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = async (account: {
    name: string;
    email: string;
    avatarBg: string;
  }) => {
    setLoading(true);
    try {
      await googleLogin({
        email: account.email,
        name: account.name,
        first_name: account.name.split(' ')[0],
        last_name: account.name.split(' ').slice(1).join(' ') || 'User',
        business_name: `${account.name.split(' ')[0]}'s Logistics`,
      });
      toast.success(`Signed in as ${account.email}`);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    setLoading(true);
    try {
      const name = customName.trim() || customEmail.split('@')[0];
      await googleLogin({
        email: customEmail.trim(),
        name: name,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || 'Enterprise',
        business_name: `${name.split(' ')[0]}'s Logistics`,
      });
      toast.success(`Signed in as ${customEmail}`);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const presetAccounts = [
    {
      name: 'Tejas Kadam',
      email: 'itstejaskadam@gmail.com',
      avatarBg: 'bg-emerald-600',
    },
    {
      name: 'Alex Mercer (Logistics Operations)',
      email: 'alex.mercer@gmail.com',
      avatarBg: 'bg-blue-600',
    },
    {
      name: 'Enterprise Fleet Admin',
      email: 'admin.fleet@gmail.com',
      avatarBg: 'bg-indigo-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="font-bold text-sm text-slate-800">
              {mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              Choose an account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              to continue to <strong className="text-slate-800">DeliveryProof Manager</strong>
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-xs font-semibold text-slate-600">
                Verifying Google identity & workspace...
              </p>
            </div>
          ) : !showCustomInput ? (
            <div className="space-y-2">
              {presetAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-2xs"
                >
                  <div className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}>
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {acc.email}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-3 text-left cursor-pointer text-xs font-semibold text-slate-700"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <UserPlus size={16} />
                </div>
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !customEmail}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck size={13} className="text-blue-600" />
            <span>Google OAuth 2.0 Verified</span>
          </div>
          <span>English (United States)</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
