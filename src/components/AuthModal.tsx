import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, AlertCircle, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { loginWithGoogle, registerWithEmail, loginWithEmail, createDemoCustomerSession } from '../firebase/auth';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  bookingIntentNotice?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingIntentNotice = false,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/cyber-cafe-point/authentication/settings`;

  const copyHostname = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsUnauthorizedDomain(false);
    try {
      const profile = await loginWithGoogle();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domain not authorized in Firebase project: cyber-cafe-point');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Check popup permissions.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsUnauthorizedDomain(false);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setIsLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMsg('Please enter your contact phone number');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password should be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const profile = await registerWithEmail(email, password, name, phone);
        onSuccess(profile);
        onClose();
      } else {
        const profile = await loginWithEmail(email, password);
        onSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domain not authorized in Firebase project: cyber-cafe-point');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify or create an account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password provider is not yet enabled in Firebase Console. You can activate it or use Instant Customer Sign-In below.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Instant customer fallback: creates profile in Firestore & starts session immediately
  const handleQuickCustomerLogin = async () => {
    setIsLoading(true);
    try {
      const fallbackName = name.trim() || 'Sayan Baishya';
      const fallbackEmail = email.trim() || 'sayanbaishya64@gmail.com';
      const fallbackPhone = phone.trim() || '+91 98765 43210';

      const profile = await createDemoCustomerSession(fallbackName, fallbackEmail, fallbackPhone);
      onSuccess(profile);
      onClose();
    } catch (e: any) {
      console.error('Quick customer login error:', e);
      setErrorMsg(e.message || 'Failed to start customer session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              {bookingIntentNotice ? 'Step 1 of 2: Customer Identity' : 'CyberPoint Account'}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'signin' ? 'Sign In to Your Account' : 'Create Customer Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for booking appointment */}
        {bookingIntentNotice && (
          <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Sign in required to assign your priority counter token and save booking history.</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 text-xs border-b border-slate-200 font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setIsUnauthorizedDomain(false);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              mode === 'signin'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setIsUnauthorizedDomain(false);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            Sign Up / New User
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Unauthorized domain dedicated solution card */}
          {isUnauthorizedDomain && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-900">
                    Fix Firebase <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">auth/unauthorized-domain</code>:
                  </span>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    Firebase requires your web domain to be added to the project's Authorized Domains list before Google Sign-In can authenticate.
                  </p>
                </div>
              </div>

              {/* Hostname with copy button */}
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                <div className="truncate font-mono text-[11px] text-slate-800 select-all">
                  {currentHostname}
                </div>
                <button
                  type="button"
                  onClick={copyHostname}
                  className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Firebase Settings</span>
                </a>

                <button
                  type="button"
                  onClick={handleQuickCustomerLogin}
                  className="px-3 py-1.5 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Continue Instantly (Bypass Check)</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && !isUnauthorizedDomain && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Or with Email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sayan Baishya"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">WhatsApp / Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Direct Instant Customer Login Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickCustomerLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Test Sign-In ({email || 'sayanbaishya64@gmail.com'})</span>
            </button>
          </div>

          <div className="text-center pt-1">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setIsUnauthorizedDomain(false);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setIsUnauthorizedDomain(false);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
