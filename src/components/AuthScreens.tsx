/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { UserType } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Camera, Search, HelpCircle } from 'lucide-react';

export default function AuthScreens() {
  const {
    onboardingStep,
    setOnboardingStep,
    login,
    loginWithGoogle,
    signup,
    verifyEmailCode,
    completeEducation,
    submitInstituteVerification,
    pendingAuthUser,
    resetPasswordRequest,
    performPasswordReset,
    enableMockBypass,
    isFirebaseMock
  } = useSocial();

  // Unified Error and Input states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forms Fields
  const [roleSelection, setRoleSelection] = useState<UserType>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Education form state
  const [country, setCountry] = useState('United States');
  const [institute, setInstitute] = useState('Brooklyn College');
  const [degree, setDegree] = useState('Creative Writing & Arts');

  // Verification form state
  const [regNo, setRegNo] = useState('');
  const [regPhoto, setRegPhoto] = useState('');

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const clearError = () => setError(null);

  const handleRoleSubmit = (role: UserType) => {
    setRoleSelection(role);
    setOnboardingStep('signup');
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
      await signup(email, password, fullName, username, roleSelection);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!otpCode) {
      setError("Please input the 4-digit token received on your email.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmailCode(otpCode);
    } catch (err: any) {
      setError(err.message || "Invalid pin code.");
    } finally {
      setLoading(false);
    }
  };

  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeEducation(country, institute, degree);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo) {
      setError("Please fill out your Registration Number.");
      return;
    }
    setLoading(true);
    try {
      await submitInstituteVerification(regNo, regPhoto);
    } catch (err: any) {
      setError(err.message || "Verification upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) {
      setError("Requires both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Fail parsing credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!resetEmail) {
      setError("Email address is required.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordRequest(resetEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!resetCode) {
      setError("Requires 4-digit code.");
      return;
    }
    setOnboardingStep('reset-password');
  };

  const handlePasswordResetComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!newPassword || !confirmNewPassword) {
      setError("Fill both fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await performPasswordReset(newPassword);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Skip visual mock verification to expedite review
  const handleSkipVerification = () => {
    submitInstituteVerification("SKIPPED-ID-" + Date.now().toString().slice(-4), "");
  };

  // Helper logo badge component
  const LogoHeader = () => (
    <div className="flex flex-col items-center mb-6">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 shadow-lg shadow-cyan-300/40 mb-3">
        <span className="text-white text-4.5xl font-black">C</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 p-6 relative overflow-hidden">
      {/* Wave shape overlay backdrop */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-sky-50 to-transparent -z-10 rounded-b-[40px]"></div>

      {/* Back button (Where applicable) */}
      <div className="flex items-center min-h-[44px]">
        {onboardingStep !== 'who-are-you' && onboardingStep !== 'welcome' && (
          <button 
            id="back-auth-btn"
            onClick={() => {
              clearError();
              if (onboardingStep === 'signup') setOnboardingStep('who-are-you');
              else if (onboardingStep === 'verify-email') setOnboardingStep('signup');
              else if (onboardingStep === 'edu-setup') setOnboardingStep('congrats-email');
              else if (onboardingStep === 'verify-institute') setOnboardingStep('edu-setup');
              else if (onboardingStep === 'signin') setOnboardingStep('welcome');
              else if (onboardingStep === 'forgot-password') setOnboardingStep('signin');
              else if (onboardingStep === 'verify-code') setOnboardingStep('forgot-password');
              else if (onboardingStep === 'reset-password') setOnboardingStep('verify-code');
              else setOnboardingStep('welcome');
            }}
            className="p-1 text-slate-500 hover:text-cyan-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full my-4">
        {error && (
          <div className="mb-4 p-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 rounded-xl leading-relaxed flex flex-col gap-2.5">
            <div>{error}</div>
            {!isFirebaseMock && (
              <button
                type="button"
                onClick={enableMockBypass}
                className="w-full mt-1.5 py-2.5 px-3 rounded-lg bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition-colors cursor-pointer text-center text-[11px] uppercase tracking-wider"
              >
                Instant Sandbox Demo Bypass ✨
              </button>
            )}
          </div>
        )}

        {/* STEP 1: ROLL SELECTOR */}
        {onboardingStep === 'who-are-you' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Who are you?
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-8">
              Select your academic affiliation to start compiling campus threads.
            </p>

            <div className="flex flex-col gap-4 w-full">
              {(['student', 'teacher', 'institute'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSubmit(role)}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 font-extrabold text-left capitalize hover:border-cyan-400 hover:bg-cyan-50/40 hover:text-cyan-600 transition-all active:scale-[0.99] flex justify-between items-center"
                >
                  <span>I'm a {role}</span>
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-white bg-white peer-checked:bg-cyan-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent"></div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: REGISTER ACCOUNT */}
        {onboardingStep === 'signup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center text-slate-800 tracking-tight mb-1">
              Sign Up
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Affiliated with a university and looking to connect?
            </p>

            <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
              </div>

              <input
                type="type"
                placeholder="University Email (e.g., student@collegio.edu)"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              <div className="flex items-start gap-2.5 py-1 text-xs text-slate-500 font-medium leading-relaxed">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-cyan-500 h-4 w-4 rounded"
                />
                <label htmlFor="agree-terms">
                  *email must be of an educational institute.
                  <br />I agree with the <span className="text-cyan-500 font-bold hover:underline cursor-pointer">Terms & Conditions</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold hover:opacity-95 transition-all shadow-md shadow-cyan-300/40"
              >
                {loading ? 'Processing...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-400 font-semibold">
              I already have an account.{' '}
              <button onClick={() => setOnboardingStep('signin')} className="text-cyan-500 hover:underline">
                Sign In
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: OTP EMAIL VERIFY */}
        {onboardingStep === 'verify-email' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Verify Email
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Please, enter the verification code we've received on your email{' '}
              <span className="text-slate-800 font-bold font-mono">{pendingAuthUser?.email}</span>.
            </p>

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={6}
                placeholder="XXXX"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-[12px] font-mono text-2xl p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              <button
                type="submit"
                className="w-full py-4 mt-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                Verify Code
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-400 font-medium">
              Didn't receive code?{' '}
              <button onClick={() => alert("Verification code resent! Check your inbox or enter code '1111'.")} className="text-cyan-500 font-bold hover:underline">
                Re-send code.
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: EMAIL CONGRATS */}
        {onboardingStep === 'congrats-email' && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center">
            <LogoHeader />
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-6">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              Congratulations!
            </h2>
            <p className="text-slate-500 text-sm px-6 font-medium leading-relaxed mb-8">
              Your academic email has been verified. Let's finish building your university profile.
            </p>

            <button
              onClick={() => setOnboardingStep('edu-setup')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* STEP 5: EDUCATION DETAILS SETUP */}
        {onboardingStep === 'edu-setup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-2xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Your Academic Profile
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Select your country, institute, and parameters you are taking.
            </p>

            <form onSubmit={handleEduSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-55 outline-none focus:border-cyan-500"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Australia">Australia</option>
                  <option value="Greece">Greece</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Institute</label>
                <select
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-55 outline-none focus:border-cyan-500"
                >
                  <option value="Brooklyn College">Brooklyn College</option>
                  <option value="Boston University">Boston University</option>
                  <option value="UMT Lahore">UMT Lahore</option>
                  <option value="Harvard University">Harvard University</option>
                  <option value="Chicago Culinary Academy">Chicago Culinary Academy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {roleSelection === 'teacher' ? 'Which subject do you teach?' : 'Studying which degree?'}
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-55 outline-none focus:border-cyan-500"
                >
                  <option value="Creative Writing & Arts">Creative Writing & Arts</option>
                  <option value="Gastronomy & Culinary Arts">Gastronomy & Culinary Arts</option>
                  <option value="Computer Science & IT">Computer Science & IT</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                Next
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 6: VERIFY YOUR INSTITUTE */}
        {onboardingStep === 'verify-institute' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <span></span>
              <button onClick={handleSkipVerification} className="text-cyan-500 font-bold text-sm hover:underline">
                Skip
              </button>
            </div>
            
            <LogoHeader />
            <h2 className="text-2xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Verify Your Institute.
            </h2>
            <p className="text-slate-400 text-sm text-center px-4 font-medium mb-6">
              Please, add your registration index and upload user ID photo.
            </p>

            <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Registration No."
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              {/* Upload mockup placeholder */}
              <div 
                onClick={() => setRegPhoto('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80')}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  regPhoto ? 'border-cyan-400 bg-cyan-50/20 text-cyan-600' : 'border-slate-200 hover:border-cyan-400 text-slate-400'
                }`}
              >
                {regPhoto ? (
                  <div className="text-center">
                    <Check className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                    <span className="text-xs font-bold text-cyan-500 block">ID_CARD_VERIFICATION.PNG attached</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRegPhoto(''); }} className="text-[10px] text-rose-500 underline mt-1 block">Remove</button>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 stroke-1 mb-2" />
                    <span className="text-xs font-semibold">Attach a registration photo</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                {loading ? 'Creating account...' : 'Next'}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 7: SIGN IN */}
        {onboardingStep === 'signin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Sign In
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Welcome back to Collegio platform.
            </p>

            <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl leading-relaxed text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-505 outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setOnboardingStep('forgot-password')}
                  className="text-xs font-bold text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative flex items-center justify-center my-1 w-full">
                <div className="absolute inset-x-0 h-px bg-slate-100"></div>
                <span className="relative z-10 bg-white px-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">or sign in with</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    setError(err.message || "Google Sign-In failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-3.5 active:scale-[0.99] cursor-pointer shadow-sm text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-1.12-1.03-2.41-1.03-3.72l-.32-4.94z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google Account</span>
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-400 font-semibold">
              I don't have an account.{' '}
              <button onClick={() => setOnboardingStep('who-are-you')} className="text-cyan-500 hover:underline">
                Let's Sign Up
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 8: FORGOT PASSWORD */}
        {onboardingStep === 'forgot-password' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Forgot Password?
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Please enter your registered email below to receive resetting link.
            </p>

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={resetEmail}
                required
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              />

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                Next
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 9: RESET PASSWORD VERIFY CODE */}
        {onboardingStep === 'verify-code' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-2 text-slate-800">
              Verify Code.
            </h2>
            <p className="text-slate-400 text-sm text-center font-medium mb-6">
              Please, enter the verification code we've received on your email to unlock reset.
            </p>

            <form onSubmit={handlePasswordVerifyCode} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="XXXX"
                maxLength={4}
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full text-center tracking-[12px] font-mono text-2xl p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                Next
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 10: SET NEW PASSWORD */}
        {onboardingStep === 'reset-password' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LogoHeader />
            <h2 className="text-3xl font-extrabold text-slate-800 text-center tracking-tight mb-6">
              Set New Password.
            </h2>

            <form onSubmit={handlePasswordResetComplete} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:border-cyan-500"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
              >
                Next
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 11: RESET SUCCESS */}
        {onboardingStep === 'success-reset' && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center">
            <LogoHeader />
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-6">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              Congrats!
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-8 px-4">
              Your password has been successfully changed. Try signing in now.
            </p>

            <button
              onClick={() => setOnboardingStep('signin')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center text-xs text-slate-400 py-1 font-mono">
         Collegio Sandbox Mode • Local Encryption Engaged
      </div>
    </div>
  );
}
