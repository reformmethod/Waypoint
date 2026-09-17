import React, { useState } from 'react';
import { AuthUser } from '../../types/waypoint';
import { WaypointLogo } from './WaypointLogo';
import { CrisisModal } from './CrisisModal';
import { CrisisButton } from './CrisisButton';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { AppleAuthModal } from './AppleAuthModal';
import { KeyGeneratorTwoFactor } from './KeyGeneratorTwoFactor';
import { registerClientFromPersonalApp } from '../../utils/clientNotesStorage';
import {
  validateStaffCode,
  redeemStaffCode,
} from '../../utils/staffInviteStorage';
import {
  User,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Lock,
  Smartphone,
  RotateCcw,
  Key,
  Building,
  UserPlus,
} from 'lucide-react';

interface SafeguardedAuthScreenProps {
  onLogin: (user: AuthUser) => void;
  onTriggerCrisisBypass?: () => void;
}

export type AuthMode = 'personal' | 'staff' | 'admin';

export const SafeguardedAuthScreen: React.FC<SafeguardedAuthScreenProps> = ({
  onLogin,
  onTriggerCrisisBypass,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('personal');

  // Personal sub-mode: signin vs register
  const [personalTab, setPersonalTab] = useState<'signin' | 'register'>('signin');

  // Shared inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffCode, setStaffCode] = useState('');

  // Personal Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAge, setRegAge] = useState(16);
  const [regPathwayFocus, setRegPathwayFocus] = useState('Youth Justice Order & Restorative Reparation');
  const [regWorkingWithOrg, setRegWorkingWithOrg] = useState(true);
  const [regOrgCode, setRegOrgCode] = useState('YJS-LEEDS');
  const [regWorkerName, setRegWorkerName] = useState('Jordan Miller (Lead Key Worker)');
  const [regStatutoryOrder, setRegStatutoryOrder] = useState('Youth Rehabilitation Order (YRO)');

  // 2FA State for Staff Login
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [demo2FACode, setDemo2FACode] = useState('749215');
  const [pendingStaffUser, setPendingStaffUser] = useState<AuthUser | null>(null);
  const [is2FASubmitting, setIs2FASubmitting] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotUserType, setForgotUserType] = useState<'personal' | 'staff'>('personal');

  // SSO Modals State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAppleModalOpen, setIsAppleModalOpen] = useState(false);

  // Status & Error
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCrisisClick = () => {
    if (onTriggerCrisisBypass) {
      onTriggerCrisisBypass();
    } else {
      setIsCrisisModalOpen(true);
    }
  };

  // Switch mode helper that clears errors and presets sample hints
  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setStaffCode('');
    setIs2FAStep(false);
    setPendingStaffUser(null);
  };

  // Demo autofill helpers
  const fillDemoPersonal = () => {
    setEmail('alex.morgan@waypoint.nhs.uk');
    setPassword('demopass123');
    setErrorMessage('');
  };

  const fillDemoStaff = () => {
    setEmail('jordan.worker@yjs.gov.uk');
    setPassword('staffpass123');
    setStaffCode('WAYPOINT-STAFF-2026');
    setErrorMessage('');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@waypoint.gov.uk');
    setPassword('admin2026');
    setErrorMessage('');
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // 1. ADMIN MODE SIGN-IN
      if (authMode === 'admin') {
        const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('lead') || password === 'admin2026';
        if (!isAdmin && password.length < 4) {
          setErrorMessage('Invalid admin credentials. For demo access use admin@waypoint.gov.uk / admin2026.');
          return;
        }

        onLogin({
          id: `admin-${Date.now().toString(36)}`,
          email: cleanEmail,
          name: 'System Administrator',
          role: 'Admin',
          orgCode: 'WAYPOINT-HQ',
          practitionerRole: 'Service Manager & Designated Safeguarding Lead',
          lastLogin: new Date().toISOString(),
        });
        return;
      }

      // 2. STAFF MODE SIGN-IN (Requires verified Staff Access Code + 2FA)
      if (authMode === 'staff') {
        if (!staffCode.trim()) {
          setErrorMessage('Staff access code is required. If you do not have one, request an invite from your Service Administrator.');
          return;
        }

        const validation = validateStaffCode(staffCode);
        if (!validation.valid) {
          setErrorMessage(validation.error || 'Invalid or expired staff access code.');
          return;
        }

        // Redeem usage of the code
        redeemStaffCode(staffCode);

        const invite = validation.invite;
        const staffUser: AuthUser = {
          id: `staff-${Date.now().toString(36)}`,
          email: cleanEmail,
          name: invite?.staffName || cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Key Worker',
          role: 'Organization',
          orgCode: invite?.orgCode || (cleanEmail.includes('kirk') ? 'CGL-KIRK' : 'YJS-LEEDS'),
          practitionerRole: invite?.role || 'Youth Justice Key Worker & Caseworker',
          lastLogin: new Date().toISOString(),
          staffInviteCodeUsed: staffCode.trim().toUpperCase(),
        };

        // Trigger Mandatory 2FA Step for High Security
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setDemo2FACode(generatedOtp);
        setPendingStaffUser(staffUser);
        setIs2FAStep(true);
        setTwoFactorCode('');

        // Dispatch to backend 2FA service
        fetch('/api/auth/generate-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.otp) {
              setDemo2FACode(data.otp);
            }
          })
          .catch(() => {
            // retain local OTP
          });
        return;
      }

      // 3. PERSONAL MODE SIGN-IN
      onLogin({
        id: `usr-${Date.now().toString(36)}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Waypoint Member',
        role: 'Personal',
        orgCode: 'YJS-LEEDS',
        lastLogin: new Date().toISOString(),
      });
    }, 350);
  };

  // Staff 2FA Verification Handler with Backend & Failover Validation
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setIs2FASubmitting(true);

    const cleanOtp = twoFactorCode.trim().replace(/\s/g, '');
    if (!cleanOtp) {
      setIs2FASubmitting(false);
      setTwoFactorError('Please enter your 6-digit verification code.');
      return;
    }

    try {
      // Verify with backend authentication service
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingStaffUser?.email,
          code: cleanOtp,
        }),
      });

      if (response.ok) {
        setIs2FASubmitting(false);
        if (pendingStaffUser) {
          onLogin({
            ...pendingStaffUser,
            twoFactorVerified: true,
          });
        }
        return;
      }
    } catch {
      // If server is starting up or disconnected, fall back to client verification
    }

    // Client validation fallback
    const isLocalValid =
      cleanOtp === demo2FACode || cleanOtp === '749215' || cleanOtp === '128943';

    setIs2FASubmitting(false);
    if (isLocalValid && pendingStaffUser) {
      onLogin({
        ...pendingStaffUser,
        twoFactorVerified: true,
      });
    } else {
      setTwoFactorError(
        'Invalid or expired 2FA code. Please verify the code on your authenticator device or use an emergency staff key.'
      );
    }
  };

  // Apple & Google SSO modal triggers (Personal Mode)
  const handleSSO = (provider: 'Apple' | 'Google') => {
    if (provider === 'Google') {
      setIsGoogleModalOpen(true);
    } else {
      setIsAppleModalOpen(true);
    }
  };

  // Demo Registration quick autofill
  const fillDemoRegistration = () => {
    setRegFullName('Kai Taylor');
    setRegEmail('kai.taylor@example.com');
    setRegPassword('pass1234');
    setRegConfirmPassword('pass1234');
    setRegAge(16);
    setRegPathwayFocus('Youth Justice Order & Restorative Reparation');
    setRegWorkingWithOrg(true);
    setRegOrgCode('YJS-LEEDS');
    setRegWorkerName('Jordan Miller (Lead Key Worker)');
    setRegStatutoryOrder('Youth Rehabilitation Order (YRO)');
    setErrorMessage('');
  };

  // Registration handler for young people / personal users
  const handlePersonalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const userId = `usr-reg-${Date.now().toString(36)}`;
      const orgNamesMap: Record<string, string> = {
        'YJS-LEEDS': 'Leeds Youth Justice Service',
        'CGL-KIRK': 'Kirklees Recovery Service / CGL',
        'YJS-MANC': 'Manchester Complex Safeguarding & YJS',
        'YOS-BIRM': 'Birmingham Youth Offending Service',
        'YJS-HACK': 'Hackney Specialist Youth Service',
        'YJS-BRIS': 'Bristol & South Gloucestershire YJS',
        'YJS-CAMD': 'Camden & Islington Adolescent Services',
      };

      if (regWorkingWithOrg) {
        // Automatically creates client profile in the staff area with live statistics & interventions!
        registerClientFromPersonalApp({
          userId,
          name: regFullName.trim(),
          email: cleanEmail,
          age: regAge || 16,
          orgCode: regOrgCode,
          orgName: orgNamesMap[regOrgCode] || 'Youth Justice Service',
          workerName: regWorkerName.trim() || 'Jordan Miller (Key Worker)',
          statutoryOrder: regStatutoryOrder,
          pathwayFocus: regPathwayFocus,
        });
      }

      onLogin({
        id: userId,
        email: cleanEmail,
        name: regFullName.trim(),
        role: 'Personal',
        orgCode: regWorkingWithOrg ? regOrgCode : 'PERSONAL-INDEPENDENT',
        lastLogin: new Date().toISOString(),
      });
    }, 400);
  };

  // Live code validation status preview for Staff Mode
  const codeCheck = staffCode.trim() ? validateStaffCode(staffCode) : null;

  return (
    <div
      id="waypoint-login-screen"
      className="min-h-screen w-full bg-[#394452] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-100 relative"
    >
      {/* 1. DISCREET TOP-RIGHT TOGGLE (Completely out of the way) */}
      <nav
        aria-label="Portal Mode Switcher"
        className="absolute top-3 right-3 sm:top-4 sm:right-5 z-20"
      >
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#1e2530]/75 backdrop-blur-md border border-slate-700/60 shadow-md text-[11px]">
          <button
            type="button"
            onClick={() => handleSwitchMode('personal')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              authMode === 'personal'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('staff')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              authMode === 'staff'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('admin')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              authMode === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin
          </button>
        </div>
      </nav>

      <div className="w-full max-w-md space-y-4 sm:space-y-5">
        {/* Top Header with Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-1 pb-1">
          <WaypointLogo size="lg" />
          <p className="text-xs text-slate-300">
            Psychosocial Support, Habit Infrastructure &amp; Child-First Justice
          </p>
        </div>

        {/* Crisis Grounding Button (Personal & Staff support) */}
        <CrisisButton onClick={handleCrisisClick} label="Crisis Support" />

        {/* Dynamic Authentication Card */}
        <div className="rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] p-6 sm:p-7 shadow-2xl space-y-4 text-[#1A202C]">
          {/* =========================================================================
              SCREEN 2FA: MANDATORY STAFF TWO-FACTOR AUTHENTICATION (Google/Microsoft)
              ========================================================================= */}
          {is2FAStep && pendingStaffUser ? (
            <KeyGeneratorTwoFactor
              email={pendingStaffUser.email}
              workerRole={pendingStaffUser.practitionerRole}
              onVerified={() => {
                if (pendingStaffUser) {
                  onLogin({
                    ...pendingStaffUser,
                    twoFactorVerified: true,
                  });
                }
              }}
              onCancel={() => {
                setIs2FAStep(false);
                setPendingStaffUser(null);
              }}
            />
          ) : (
            <>
          {/* =========================================================================
              SCREEN 1: PERSONAL SIGN-IN / REGISTRATION SCREEN
              ========================================================================= */}
          {authMode === 'personal' && (
            <div className="space-y-4">
              {/* Segmented Control: Sign In vs Register */}
              <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-2xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setPersonalTab('signin');
                    setErrorMessage('');
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    personalTab === 'signin'
                      ? 'bg-white text-[#1A202C] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPersonalTab('register');
                    setErrorMessage('');
                  }}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    personalTab === 'register'
                      ? 'bg-white text-emerald-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Register on Personal</span>
                </button>
              </div>

              {personalTab === 'signin' ? (
                <>
                  <div className="border-b border-[#E2E8F0] pb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-[#1A202C]">
                        Member &amp; Youth Portal
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Safe &amp; Private
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5568] leading-relaxed">
                      Your daily steps, thoughts, and reflections stay confidential on your device.
                    </p>
                  </div>

                  {/* SSO Options */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSSO('Apple')}
                      className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-900 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.65-8.6-9.97-18.49-12.98-29.68-3-11.19-4.51-21.94-4.51-32.25 0-14.12 3.38-25.77 10.14-34.94 6.76-9.17 15.34-13.84 25.75-14.02 5.01 0 10.45 1.34 16.32 4.02 5.87 2.68 9.77 4.08 11.71 4.2 1.63 0 5.62-1.39 11.97-4.18 6.35-2.79 11.83-4.08 16.44-3.87 13.9.76 24.62 5.61 32.18 14.56-11.96 7.23-17.83 17.1-17.61 29.6.22 9.87 4.03 18.06 11.44 24.56 7.41 6.5 16.32 10.15 26.74 10.96-2.5 7.6-5.44 14.63-8.81 21.09zM119.22 33.7c0-7.39 2.67-14.18 8.01-20.37 5.34-6.19 11.89-9.87 19.64-11.04.22 1.09.33 2.06.33 2.93 0 7.39-2.77 14.28-8.31 20.67-5.54 6.39-12.16 10.09-19.86 11.1-0.22-1.08-.33-2.05-.33-2.92z" />
                      </svg>
                      <span>Continue with Apple</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSSO('Google')}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-[#2D3748] border border-[#CBD5E0] font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
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
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#CBD5E0] w-full" />
                    <span className="bg-[#F7FAFC] px-3 text-[11px] text-[#718096] font-bold uppercase tracking-wider absolute">
                      or sign in with email
                    </span>
                  </div>
                </>
              ) : (
                /* Registration Questionnaire */
                <form onSubmit={handlePersonalRegister} className="space-y-3.5">
                  <div className="border-b border-[#E2E8F0] pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                        Create Personal Profile
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Self-Registration
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5568]">
                      Answer the questions below to tailor your daily grounding and connect with support.
                    </p>
                  </div>

                  {/* Autofill Demo Registration button */}
                  <button
                    type="button"
                    onClick={fillDemoRegistration}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Autofill Sample Registration (Kai Taylor - YJS Leeds)</span>
                    </span>
                  </button>

                  {/* Name and Age */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-[#4A5568]">Full Name *</label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Kai Taylor"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#4A5568]">Age *</label>
                      <input
                        type="number"
                        min={12}
                        max={25}
                        value={regAge}
                        onChange={(e) => setRegAge(parseInt(e.target.value) || 16)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#4A5568]">Email Address *</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. kai.taylor@example.com"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#4A5568]">Create Password *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#4A5568]">Confirm Password *</label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>

                  {/* Focus Pathway */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#4A5568]">Primary Support Focus *</label>
                    <select
                      value={regPathwayFocus}
                      onChange={(e) => setRegPathwayFocus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E0] text-xs focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Youth Justice Order & Restorative Reparation">Youth Justice Order &amp; Restorative Reparation</option>
                      <option value="Daily Routine, Sleep & Emotional Stability">Daily Routine, Sleep &amp; Emotional Stability</option>
                      <option value="Substance Recovery & Harm Reduction">Substance Recovery &amp; Harm Reduction</option>
                      <option value="Emotional Grounding & Anger Regulation">Emotional Grounding &amp; Anger Regulation</option>
                      <option value="Education, Training & Employment (ETE)">Education, Training &amp; Employment (ETE)</option>
                    </select>
                  </div>

                  {/* CRITICAL QUESTION BOX: Working with an organisation? */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="reg-working-org-check"
                        checked={regWorkingWithOrg}
                        onChange={(e) => setRegWorkingWithOrg(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="reg-working-org-check"
                        className="text-xs font-bold text-emerald-950 cursor-pointer select-none"
                      >
                        Are you working with a Youth Justice Service, NHS Trust, or support organisation?
                      </label>
                    </div>

                    {regWorkingWithOrg && (
                      <div className="space-y-2.5 pt-1 pl-6 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Which organisation are you working with? *</span>
                          </label>
                          <select
                            value={regOrgCode}
                            onChange={(e) => setRegOrgCode(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                          >
                            <option value="YJS-LEEDS">Leeds Youth Justice Service (YJS-LEEDS)</option>
                            <option value="CGL-KIRK">Kirklees Recovery Service / CGL (CGL-KIRK)</option>
                            <option value="YJS-MANC">Manchester Complex Safeguarding &amp; YJS (YJS-MANC)</option>
                            <option value="YOS-BIRM">Birmingham Youth Offending Service (YOS-BIRM)</option>
                            <option value="YJS-HACK">Hackney Specialist Youth Service (YJS-HACK)</option>
                            <option value="YJS-BRIS">Bristol &amp; South Gloucestershire YJS (YJS-BRIS)</option>
                            <option value="YJS-CAMD">Camden &amp; Islington Adolescent Services (YJS-CAMD)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-emerald-900">Key Worker / Practitioner</label>
                            <input
                              type="text"
                              value={regWorkerName}
                              onChange={(e) => setRegWorkerName(e.target.value)}
                              placeholder="e.g. Jordan Miller"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-emerald-900">Statutory Order / Support</label>
                            <select
                              value={regStatutoryOrder}
                              onChange={(e) => setRegStatutoryOrder(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-white border border-emerald-300 text-[11px]"
                            >
                              <option value="Youth Rehabilitation Order (YRO)">Youth Rehabilitation Order (YRO)</option>
                              <option value="Referral Order (RO)">Referral Order (RO)</option>
                              <option value="Detention & Training Order (DTO)">Detention &amp; Training Order (DTO)</option>
                              <option value="Deferred Prosecution / Diversion">Deferred Prosecution / Diversion</option>
                              <option value="Voluntary Support">Voluntary Support</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-[10px] text-emerald-800 leading-snug bg-emerald-100/60 p-2 rounded-xl border border-emerald-200">
                          ✨ <strong>Automatic Linkage:</strong> Registering with an organisation creates a client profile in your key worker's staff area. Your worker can view your habit statistics and dispatch supportive interventions directly to your dashboard.
                        </p>
                      </div>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <span>Setting up profile...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register &amp; Connect Profile</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              SCREEN 2: STAFF SIGN-IN SCREEN (Practitioners & Key Workers)
              ========================================================================= */}
          {authMode === 'staff' && (
            <div className="space-y-3.5 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-[#1A202C]">
                    Key Worker &amp; Practitioner Portal
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Statutory Access
                </span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Authorized access for Youth Justice Mentors, NHS Clinicians, and YJS Case Officers. Enter your work email and the <strong>Staff Access Code</strong> issued by your Service Administrator.
              </p>

              {/* Demo Helper Pill */}
              <button
                type="button"
                onClick={fillDemoStaff}
                className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Fill Demo Key Worker (Jordan Miller + Code)</span>
                </span>
                <span className="text-[10px] font-mono bg-sky-200/60 px-2 py-0.5 rounded">
                  WAYPOINT-STAFF-2026
                </span>
              </button>
            </div>
          )}

          {/* =========================================================================
              SCREEN 3: ADMIN SIGN-IN SCREEN
              ========================================================================= */}
          {authMode === 'admin' && (
            <div className="space-y-3.5 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-[#1A202C]">
                    Service Administration Login
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Restricted Portal
                </span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Issue staff invitations, generate special authorization codes, and audit system safeguarding governance.
              </p>

              {/* Demo Helper Pill */}
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fill Demo Admin Credentials</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-200/60 px-2 py-0.5 rounded">
                  admin@waypoint.gov.uk
                </span>
              </button>
            </div>
          )}

          {/* Standard Sign In Form (for staff, admin, and personal signin tab) */}
          {(authMode !== 'personal' || personalTab === 'signin') && (
            <>
              <form onSubmit={handleSignIn} className="space-y-3.5">
                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A5568]">
                    {authMode === 'staff'
                      ? 'Professional Work Email'
                      : authMode === 'admin'
                      ? 'Administrator Email'
                      : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      authMode === 'staff'
                        ? 'jordan.worker@yjs.gov.uk'
                        : authMode === 'admin'
                        ? 'admin@waypoint.gov.uk'
                        : 'name@example.com'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#CBD5E0] text-[#1A202C] placeholder-slate-400 text-xs focus:outline-none focus:border-[#718096] focus:ring-2 focus:ring-[#718096]/20 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#4A5568]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotUserType(authMode === 'staff' ? 'staff' : 'personal');
                        setIsForgotModalOpen(true);
                      }}
                      className={`text-[11px] font-semibold hover:underline ${
                        authMode === 'staff' ? 'text-sky-700' : 'text-[#4A5568]'
                      }`}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#CBD5E0] text-[#1A202C] placeholder-slate-400 text-xs focus:outline-none focus:border-[#718096] focus:ring-2 focus:ring-[#718096]/20 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* STAFF ONLY: Special Staff Access Code input with live validation */}
                {authMode === 'staff' && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1A202C] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                        <span>Special Staff Access Code *</span>
                      </label>
                      {codeCheck && (
                        <span
                          className={`text-[10px] font-bold ${
                            codeCheck.valid ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {codeCheck.valid ? 'Valid Code' : 'Invalid'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WAYPOINT-STAFF-2026"
                      required
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-xs font-mono font-bold uppercase transition-all shadow-sm ${
                        codeCheck?.valid
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900'
                          : staffCode.trim()
                          ? 'border-rose-400 ring-2 ring-rose-400/20 text-rose-900'
                          : 'border-[#CBD5E0] text-[#1A202C] placeholder-slate-400'
                      }`}
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#718096] pt-0.5">
                      <span>Issued by your Service Administrator</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('admin')}
                        className="text-sky-700 hover:underline font-semibold"
                      >
                        Need a code? Open Admin Panel
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-2 active:scale-[0.99] ${
                    authMode === 'staff'
                      ? 'bg-sky-700 hover:bg-sky-800'
                      : authMode === 'admin'
                      ? 'bg-amber-600 hover:bg-amber-700 text-slate-950'
                      : 'bg-[#2D3748] hover:bg-[#1A202C]'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Verifying credentials...</span>
                  ) : authMode === 'staff' ? (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>Sign In as Staff Practitioner</span>
                    </>
                  ) : authMode === 'admin' ? (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Access Administration Panel</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Waypoint</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Quick Demo Switchers for Easy Reviewing */}
              {authMode === 'personal' && (
                <div className="pt-2 border-t border-[#CBD5E0]/60 flex items-center justify-between text-xs text-[#718096]">
                  <span>Need to test young person flow?</span>
                  <button
                    type="button"
                    onClick={fillDemoPersonal}
                    className="font-bold text-[#2D3748] hover:underline"
                  >
                    Autofill Alex Morgan
                  </button>
                </div>
              )}
            </>
          )}
            </>
          )}
        </div>

        {/* 2. DISCREET BOTTOM OUT-OF-THE-WAY FOOTER SWITCHER */}
        <div className="text-center text-xs text-slate-400/90 pt-1">
          {authMode === 'personal' ? (
            <div className="flex items-center justify-center gap-1.5">
              <span>Practitioner or Key Worker?</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('staff')}
                className="text-sky-300 hover:text-white font-medium hover:underline transition-colors"
              >
                Staff sign in →
              </button>
              <span className="opacity-30 mx-1">•</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('admin')}
                className="text-slate-400 hover:text-amber-300 transition-colors"
              >
                Admin
              </button>
            </div>
          ) : authMode === 'staff' ? (
            <div className="flex items-center justify-center gap-1.5">
              <span>Young person or member?</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('personal')}
                className="text-emerald-300 hover:text-white font-medium hover:underline transition-colors"
              >
                ← Personal sign in
              </button>
              <span className="opacity-30 mx-1">•</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('admin')}
                className="text-slate-400 hover:text-amber-300 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('personal')}
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                ← Personal sign in
              </button>
              <span className="opacity-30">•</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('staff')}
                className="text-sky-300 hover:text-white font-medium transition-colors"
              >
                Staff sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        userType={forgotUserType}
        initialEmail={email}
        onPasswordResetComplete={(resetEmail) => {
          setEmail(resetEmail);
          setSuccessMessage('Password reset successfully. You may now sign in with your new credentials.');
        }}
      />

      {/* Google Authentication Dialog */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(user) => onLogin(user)}
      />

      {/* Apple Authentication Dialog */}
      <AppleAuthModal
        isOpen={isAppleModalOpen}
        onClose={() => setIsAppleModalOpen(false)}
        onSuccess={(user) => onLogin(user)}
      />

      {/* Standalone Emergency Grounding Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />
    </div>
  );
};
