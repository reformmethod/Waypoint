import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { formatSecretKey, getTOTPCode } from '../utils/twoFactor';

interface AuthScreenProps {
  onOpenEmergency: () => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot';

export function AuthScreen({ onOpenEmergency }: AuthScreenProps) {
  const {
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    sendPasswordReset,
    verify2FA,
    verifyBackupCode,
    cancel2FA,
    is2FAPending,
    pendingProfile,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FAOnSignup, setEnable2FAOnSignup] = useState(false); // 2FA is optional

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  // Status and error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  // Real-time helper for testing 2FA code if 2FA challenge is active
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (is2FAPending && pendingProfile?.twoFactorSecret) {
      const updateCode = async () => {
        try {
          const code = await getTOTPCode(pendingProfile.twoFactorSecret!);
          setDemoCode(code);
        } catch (err) {
          console.error(err);
        }
      };
      updateCode();
      timer = setInterval(updateCode, 5000);
    }
    return () => clearInterval(timer);
  }, [is2FAPending, pendingProfile]);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please try again in a few minutes or reset your password.');
      } else {
        setErrorMessage(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, silently ignore or inform
        setErrorMessage('Google sign-in was closed before completion.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // another popup triggered
      } else {
        setErrorMessage(error.message || 'Failed to sign in with Google.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    clearMessages();
    setSocialLoading('apple');
    try {
      await signInWithApple();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Apple sign-in was closed before completion.');
      } else {
        setErrorMessage(error.message || 'Failed to sign in with Apple.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for security.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(email.trim(), password, displayName.trim(), enable2FAOnSignup);
      if (result.requires2FA) {
        setSuccessMessage('Account created! Please complete 2FA verification below to finalize your setup.');
      } else {
        setSuccessMessage('Account created successfully!');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please include letters and numbers.');
      } else {
        setErrorMessage(error.message || 'Failed to create account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setErrorMessage('Please enter the email address linked to your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccessMessage(`Password reset link has been dispatched to ${email.trim()}. Check your inbox or spam folder.`);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account was found with that email address.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please provide a valid email address.');
      } else {
        setErrorMessage(error.message || 'Unable to send password reset email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2FA = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (isUsingBackupCode) {
      if (!backupCodeInput.trim()) {
        setErrorMessage('Please enter your 8-character recovery backup code (e.g. XXXX-XXXX).');
        return;
      }

      setIsSubmitting(true);
      const success = await verifyBackupCode(backupCodeInput.trim());
      setIsSubmitting(false);

      if (!success) {
        setErrorMessage('Invalid backup code. Each recovery code can only be used once.');
      }
      return;
    }

    const cleaned = twoFactorCode.trim().replace(/\s/g, '');
    if (cleaned.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const success = await verify2FA(cleaned);
    setIsSubmitting(false);

    if (!success) {
      setErrorMessage('Incorrect 6-digit code or code expired. Codes refresh every 30 seconds.');
    }
  };

  const copySecretToClipboard = () => {
    if (pendingProfile?.twoFactorSecret) {
      navigator.clipboard.writeText(pendingProfile.twoFactorSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  // 2FA Challenge View (Only displayed if the user's account has 2FA enabled)
  if (is2FAPending) {
    return (
      <div className="flex flex-col min-h-full p-4 sm:p-6 justify-between text-zinc-100">
        <div className="max-w-md mx-auto w-full space-y-5 pt-2">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">
              Two-Factor Authentication (2FA)
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              This account has Two-Factor Authentication enabled for enhanced privacy.
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-start gap-2 text-xs text-cyan-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 2FA Form */}
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            {!isUsingBackupCode ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Enter 6-Digit Code</span>
                    <span className="text-[11px] text-cyan-400 font-normal">Refreshes every 30s</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-center text-xl tracking-[0.4em] font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                    />
                  </div>
                </div>

                {/* Quick Auto-Fill Helper for instant testing without extra device */}
                {demoCode && (
                  <div className="bg-[#0b0b10] border border-cyan-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Current Active Code:</span>
                      <span className="font-mono font-bold text-white tracking-widest bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {demoCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorCode(demoCode)}
                      className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Use Code
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Open App</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Emergency Backup Recovery Code
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Enter one of your 8-character recovery codes (e.g. ABCD-1234).
                  </p>
                  <input
                    type="text"
                    value={backupCodeInput}
                    onChange={(e) => setBackupCodeInput(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl px-3 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Redeem Backup Code</span>
                  )}
                </button>
              </form>
            )}

            {/* Switch between TOTP and Backup code */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setIsUsingBackupCode(!isUsingBackupCode);
                }}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
              >
                {isUsingBackupCode ? 'Use 6-digit Authenticator Code' : 'Lost device? Use Emergency Backup Code'}
              </button>
            </div>

            {/* Secret key viewer for Authenticator app setup */}
            {pendingProfile?.twoFactorSecret && (
              <div className="mt-3 p-3 bg-[#0a0a0e] rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-medium">Your 2FA Secret Key (Base32):</span>
                  <button
                    type="button"
                    onClick={copySecretToClipboard}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                  >
                    {copiedSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-zinc-300 tracking-wider bg-[#14141c] p-2 rounded border border-white/5 select-all break-all">
                  {formatSecretKey(pendingProfile.twoFactorSecret)}
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Compatible with Google Authenticator, Microsoft Authenticator, Apple Passwords, or Authy.
                </p>
              </div>
            )}
          </div>

          {/* Cancel button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={cancel2FA}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Sign out & return to login
            </button>
          </div>
        </div>

        {/* Emergency SOS Access Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onOpenEmergency}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>In Crisis? Emergency Support (No Sign-In Required)</span>
          </button>
        </div>
      </div>
    );
  }

  // Standard Login / Sign Up / Forgot Password View
  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 justify-between text-zinc-100">
      <div className="max-w-md mx-auto w-full space-y-4 pt-1">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">
            Daily Habit & Recovery
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Cloud-synchronized accountability with optional Two-Factor Authentication (2FA).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-[#101015] p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setActiveTab('signin');
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              activeTab === 'signin'
                ? 'bg-[#1e1e28] text-white shadow-sm border border-white/10 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setActiveTab('signup');
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              activeTab === 'signup'
                ? 'bg-[#1e1e28] text-white shadow-sm border border-white/10 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-2 text-xs text-red-200 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-2 text-xs text-emerald-200 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Sign In */}
        {activeTab === 'signin' && (
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            {/* Social Logins */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={socialLoading !== null || isSubmitting}
                className="w-full bg-[#181822] hover:bg-[#20202e] border border-white/15 text-white font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-white/25 disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={socialLoading !== null || isSubmitting}
                className="w-full bg-[#181822] hover:bg-[#20202e] border border-white/15 text-white font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-white/25 disabled:opacity-50"
              >
                {socialLoading === 'apple' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.34-6.3-9.74-11.19-20.9-14.67-33.48-3.48-12.58-5.22-24.16-5.22-34.74 0-14.9 3.73-27.18 11.2-36.85 7.47-9.67 16.9-14.6 28.3-14.81 4.7 0 10.05 1.25 16.05 3.76 6 2.5 9.7 3.82 11.1 3.94 2.05-.24 6.04-1.63 11.96-4.17 5.92-2.54 11.04-3.71 15.36-3.52 11.75.56 21.05 4.67 27.91 12.33-10.24 6.19-15.24 14.8-15 25.82.26 8.5 3.4 15.63 9.42 21.39 6.02 5.76 13.23 9.17 21.63 10.23-2.22 6.64-4.88 13.48-7.98 20.52zM119.22 31.02c0-7.23 2.6-13.88 7.8-19.95 5.2-6.07 11.66-9.76 19.38-11.07.64 6.72-1.74 13.43-7.14 20.13-5.4 6.7-11.94 10.74-19.62 12.12-.11-.42-.42-1.23-.42-1.23z" />
                  </svg>
                )}
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#131318] px-2 text-[10px] text-zinc-500 uppercase tracking-widest font-medium shrink-0">
                Or with Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setActiveTab('forgot');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Your Habits</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Trust ABAC Security & Real-Time Sync</span>
            </div>
          </div>
        )}

        {/* Tab 2: Create Account */}
        {activeTab === 'signup' && (
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            {/* Social Logins */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={socialLoading !== null || isSubmitting}
                className="w-full bg-[#181822] hover:bg-[#20202e] border border-white/15 text-white font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-white/25 disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={socialLoading !== null || isSubmitting}
                className="w-full bg-[#181822] hover:bg-[#20202e] border border-white/15 text-white font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-white/25 disabled:opacity-50"
              >
                {socialLoading === 'apple' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.34-6.3-9.74-11.19-20.9-14.67-33.48-3.48-12.58-5.22-24.16-5.22-34.74 0-14.9 3.73-27.18 11.2-36.85 7.47-9.67 16.9-14.6 28.3-14.81 4.7 0 10.05 1.25 16.05 3.76 6 2.5 9.7 3.82 11.1 3.94 2.05-.24 6.04-1.63 11.96-4.17 5.92-2.54 11.04-3.71 15.36-3.52 11.75.56 21.05 4.67 27.91 12.33-10.24 6.19-15.24 14.8-15 25.82.26 8.5 3.4 15.63 9.42 21.39 6.02 5.76 13.23 9.17 21.63 10.23-2.22 6.64-4.88 13.48-7.98 20.52zM119.22 31.02c0-7.23 2.6-13.88 7.8-19.95 5.2-6.07 11.66-9.76 19.38-11.07.64 6.72-1.74 13.43-7.14 20.13-5.4 6.7-11.94 10.74-19.62 12.12-.11-.42-.42-1.23-.42-1.23z" />
                  </svg>
                )}
                <span>Sign up with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#131318] px-2 text-[10px] text-zinc-500 uppercase tracking-widest font-medium shrink-0">
                Or with Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Name / Alias <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex R."
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Password <span className="text-zinc-500 text-[10px]">(Min 8 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 2FA Option Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-[#0b0b10] rounded-xl border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={enable2FAOnSignup}
                  onChange={(e) => setEnable2FAOnSignup(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-[#161620] text-cyan-400 focus:ring-cyan-400/50 w-4 h-4 accent-cyan-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enable Two-Factor Authentication (2FA)</span>
                    <span className="text-[10px] text-cyan-400 font-normal bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Require a 6-digit authenticator code or emergency backup code when signing in. You can also turn this on or off later in Settings.
                  </p>
                </div>
              </label>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {enable2FAOnSignup ? 'Create Account & Setup 2FA' : 'Create Account'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Forgot Password */}
        {activeTab === 'forgot' && (
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Reset Account Password</h2>
              <p className="text-xs text-zinc-400">
                Enter your email address and we'll send a secure password reset link.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#09090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setActiveTab('signin');
                  }}
                  className="w-full text-center text-xs text-zinc-400 hover:text-white py-1 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Direct Emergency SOS Panic Button */}
      <div className="mt-5 pt-3 border-t border-white/10 text-center">
        <button
          type="button"
          onClick={onOpenEmergency}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>In Crisis? Emergency Support (No Sign-In Required)</span>
        </button>
      </div>
    </div>
  );
}
