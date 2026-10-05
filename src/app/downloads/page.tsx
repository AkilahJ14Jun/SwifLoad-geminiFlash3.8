'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Smartphone,
  Truck,
  ArrowLeft,
  QrCode,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Info,
  Phone,
  Mail,
  KeyRound,
  X,
  Lock,
} from 'lucide-react';

export default function DownloadsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Download OTP Verification State (Customer & Driver Partner Apps - Changes Required Items 6 & 7)
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [targetApp, setTargetApp] = useState<'customer' | 'driver'>('customer');
  const [isCustomerVerified, setIsCustomerVerified] = useState<boolean>(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string>('');
  const [isDriverVerified, setIsDriverVerified] = useState<boolean>(false);
  const [verifiedDriverPhone, setVerifiedDriverPhone] = useState<string>('');
  const [inputPhone, setInputPhone] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('1234');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<'apk' | 'pwa' | null>(null);

  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem('swifload_customer_verified_phone');
      if (storedCustomer) {
        setIsCustomerVerified(true);
        setVerifiedPhone(storedCustomer);
      }
      const storedDriver = localStorage.getItem('swifload_driver_verified_phone');
      if (storedDriver) {
        setIsDriverVerified(true);
        setVerifiedDriverPhone(storedDriver);
      }
    } catch {}
  }, []);

  const triggerApkDownload = (app: 'customer' | 'driver') => {
    const filename = app === 'driver' ? 'SwifLoad-Driver.apk' : 'SwifLoad-Customer.apk';
    const link = document.createElement('a');
    link.href = `/downloads/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRequest = (app: 'customer' | 'driver', action: 'apk' | 'pwa') => {
    const isVerified = app === 'driver' ? isDriverVerified : isCustomerVerified;
    if (isVerified) {
      if (action === 'apk') {
        triggerApkDownload(app);
      } else {
        handleInstallPwa(app);
      }
      return;
    }

    setTargetApp(app);
    setPendingAction(action);
    setOtpSent(false);
    setOtpError('');
    setInputPhone('');
    setInputEmail('');
    setShowVerifyModal(true);
  };

  const handleCustomerDownloadRequest = (action: 'apk' | 'pwa') => {
    handleDownloadRequest('customer', action);
  };

  const handleDriverDownloadRequest = (action: 'apk' | 'pwa') => {
    handleDownloadRequest('driver', action);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = inputPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp.trim() !== '1234' && inputOtp.trim().length !== 4) {
      setOtpError('Invalid OTP. Please enter 1234 (Test verification OTP).');
      return;
    }

    const fullPhone = inputPhone.startsWith('+91') ? inputPhone : `+91 ${inputPhone.trim()}`;
    try {
      if (targetApp === 'driver') {
        localStorage.setItem('swifload_driver_verified_phone', fullPhone);
        if (inputEmail.trim()) {
          localStorage.setItem('swifload_driver_verified_email', inputEmail.trim());
        }
        setIsDriverVerified(true);
        setVerifiedDriverPhone(fullPhone);
      } else {
        localStorage.setItem('swifload_customer_verified_phone', fullPhone);
        if (inputEmail.trim()) {
          localStorage.setItem('swifload_customer_verified_email', inputEmail.trim());
        }
        setIsCustomerVerified(true);
        setVerifiedPhone(fullPhone);
      }
    } catch {}

    setShowVerifyModal(false);
    setOtpError('');

    // Proceed to pending action immediately after verification
    const currentApp = targetApp;
    if (pendingAction === 'apk') {
      setTimeout(() => {
        triggerApkDownload(currentApp);
      }, 300);
    } else if (pendingAction === 'pwa') {
      setTimeout(() => {
        handleInstallPwa(currentApp);
      }, 300);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async (app?: 'customer' | 'driver') => {
    if (app) {
      const manifestUrl = app === 'driver' ? '/manifest-driver.json' : '/manifest-customer.json';
      const existing = document.querySelector("link[rel='manifest']");
      if (existing) {
        existing.setAttribute('href', manifestUrl);
      }
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      const targetPage = app === 'driver' ? '/driver' : '/customer';
      const appName = app === 'driver' ? 'Driver-Partner App' : 'Customer App';
      alert(
        `SwifLoad ${appName} (v1.2.0 Latest):\n\n` +
        `• Direct Mobile Web: Open ${targetPage} in Chrome/Safari\n` +
        `• Android (Chrome): Tap browser menu ⋮ ➔ "Add to Home screen" or "Install App"\n` +
        `• iOS (Safari): Tap Share button ➔ "Add to Home Screen"\n` +
        `• Direct APK: Use the "Download Android APK (Direct)" button above to install the native app.`
      );
    }
  };

  const copyToClipboard = (url: string, key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedLink(key);
      setTimeout(() => setCopiedLink(null), 2500);
    }
  };

  const getFullUrl = (path: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SwifLoad Hub</span>
        </Link>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloud Deployment Live</span>
        </span>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Distribution Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Download SwifLoad Mobile Apps
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Get the dedicated mobile versions for Customers and Driver-Partners. Fully synchronized in real-time with the cloud database and operations admin.
          </p>
        </div>

        {/* Two Main Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Customer App Card */}
          <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-xl shadow-blue-950/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                    v1.2.0 Latest
                  </span>
                  <span className="bg-blue-950 text-blue-400 border border-blue-800/60 text-xs px-3 py-1 rounded-full font-semibold">
                    Customer Mobile Edition
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Customer Booking App</h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Instant truck booking, multi-pickup & multi-drop delivery, live GPS driver tracking, slab distance estimates, in-app wallet, and referral rewards for Coimbatore.
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Multi-Stop Routing:</strong> 1 Pick ➔ 1 Drop, Multi-Pickup & Multi-Drop with live fare</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time trip updates linked to cloud database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Interactive Coimbatore route map & OTP pickup proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant wallet top-up & referral bonus program</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              {/* Verification Status Banner if verified */}
              {isCustomerVerified ? (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Device Verified ({verifiedPhone})</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCustomerVerified(false);
                      setVerifiedPhone('');
                      localStorage.removeItem('swifload_customer_verified_phone');
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Change Number
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center space-x-2 text-[11px] text-blue-300">
                  <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Mobile OTP verification required before downloading.</span>
                </div>
              )}

              {/* Option A: Direct Web Launch */}
              <Link
                href="/customer"
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Mobile Web App</span>
              </Link>

              {/* Option B: Direct Android APK (Gated by Mobile + OTP) */}
              <button
                type="button"
                onClick={() => handleCustomerDownloadRequest('apk')}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>
                  {isCustomerVerified ? 'Download Android APK (Direct)' : 'Verify Mobile & Download APK'}
                </span>
              </button>

              {/* Option C: 1-Click PWA Install (Gated by Mobile + OTP) */}
              <button
                type="button"
                onClick={() => handleCustomerDownloadRequest('pwa')}
                className="w-full text-center text-xs text-blue-400 hover:text-blue-300 underline py-1"
              >
                📲 Install as Native Web App on Home Screen
              </button>
            </div>
          </div>

          {/* Driver App Card */}
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl shadow-amber-950/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
                  <Truck className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                    v1.2.0 Latest
                  </span>
                  <span className="bg-amber-950 text-amber-400 border border-amber-800/60 text-xs px-3 py-1 rounded-full font-semibold">
                    Driver Partner Edition
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Driver-Partner App</h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Instant dispatch alerts, multi-stop tracking, 10s countdown alerts, noticeboard balance warnings, company QR payments, and earnings ledger.
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Multi-Stop Tracker:</strong> Popups with next stop address & contact number upon completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>10s Countdown Dispatch:</strong> Locality name, distance to pickup/drop & exact addresses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Noticeboard Warning:</strong> Negative balance alert (debt &le; -₹200) with 5-day recharge rule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Company Payment QR:</strong> Dynamic UPI ICICI QR code (swifload.ops@icici) per stop</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Side Navigation Menu:</strong> Earnings, Ledger, Payments, Profile & Notifications</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              {/* Verification Status Banner if driver verified */}
              {isDriverVerified ? (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Device Verified ({verifiedDriverPhone})</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsDriverVerified(false);
                      setVerifiedDriverPhone('');
                      localStorage.removeItem('swifload_driver_verified_phone');
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center space-x-2 text-[11px] text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mobile OTP verification required before downloading.</span>
                </div>
              )}

              {/* Option A: Direct Web Launch */}
              <Link
                href="/driver"
                className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-600/25"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Mobile Driver App</span>
              </Link>

              {/* Option B: Direct Android APK (Gated by Mobile + OTP) */}
              <button
                type="button"
                onClick={() => handleDriverDownloadRequest('apk')}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>
                  {isDriverVerified ? 'Download Android APK (Direct)' : 'Verify Mobile & Download APK'}
                </span>
              </button>

              {/* Option C: 1-Click PWA Install (Gated by Mobile + OTP) */}
              <button
                type="button"
                onClick={() => handleDriverDownloadRequest('pwa')}
                className="w-full text-center text-xs text-amber-400 hover:text-amber-300 underline py-1 cursor-pointer"
              >
                📲 Install Driver App on Phone Home Screen
              </button>
            </div>
          </div>
        </div>

        {/* Direct Mobile Links / QR Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-4">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Direct URLs to Open on Mobile Devices</h3>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            Share these exact links with your team or test devices. All devices connect to the same cloud database in real-time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Customer App URL
                </span>
                <p className="text-xs text-slate-300 font-mono mt-1 break-all select-all">
                  {getFullUrl('/customer')}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(getFullUrl('/customer'), 'customer')}
                className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-3 rounded-lg border border-slate-700 transition-colors w-fit"
              >
                {copiedLink === 'customer' ? '✓ Link Copied!' : 'Copy Customer Link'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Driver App URL
                </span>
                <p className="text-xs text-slate-300 font-mono mt-1 break-all select-all">
                  {getFullUrl('/driver')}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(getFullUrl('/driver'), 'driver')}
                className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-3 rounded-lg border border-slate-700 transition-colors w-fit"
              >
                {copiedLink === 'driver' ? '✓ Link Copied!' : 'Copy Driver Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-8 bg-blue-950/20 border border-blue-900/30 rounded-xl p-5 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold mb-2">
            <Info className="w-4 h-4" />
            <span>How Mobile Installation Works</span>
          </div>
          <p className="leading-relaxed">
            Both apps are built as Progressive Web Apps (PWA) and standalone Capacitor Android packages. When opened on any smartphone browser (Chrome, Edge, Safari), users will see an automatic prompt to <strong>Add to Home Screen</strong>, which installs the app with a dedicated app icon and full-screen immersive view just like a Play Store app.
          </p>
        </div>
      </div>

      {/* ================= MODAL: APP DOWNLOAD VERIFICATION ================= */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white relative ${
            targetApp === 'driver' ? 'bg-slate-900 border-amber-900/60' : 'bg-slate-900 border-blue-900/60'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  targetApp === 'driver'
                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                    : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                }`}>
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {targetApp === 'driver' ? 'Driver-Partner App Download' : 'Customer App Download'} Verification
                  </h3>
                  <p className="text-[11px] text-slate-400">Security requirement before APK installation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setOtpError('');
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs text-slate-300 leading-relaxed p-3 rounded-xl border ${
              targetApp === 'driver'
                ? 'bg-amber-950/30 border-amber-900/40'
                : 'bg-blue-950/40 border-blue-900/40'
            }`}>
              {targetApp === 'driver'
                ? 'The SwifLoad Driver App requires the mobile number of the phone where it will be installed. An OTP confirmation is required before download.'
                : 'The SwifLoad Customer App requires the mobile number of the device where it will be installed. An OTP will be sent to confirm before initiating the download.'}
            </p>

            {otpError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                {otpError}
              </div>
            )}

            {!otpSent ? (
              /* Step 1: Phone and Email collection */
              <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">
                    Mobile Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400 flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="font-mono text-slate-300">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98422 19283"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      className="w-full pl-18 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mobile number of the phone on which app will be installed.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-200 block mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="customer@example.com (optional)"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mail ID is required for digital receipts but is not mandatory.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 mt-2"
                >
                  <span>Send Confirmation OTP</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Step 2: OTP Entry */
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verifying Device:</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {inputPhone.startsWith('+91') ? inputPhone : `+91 ${inputPhone}`}
                    </span>
                  </div>
                  {inputEmail && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-300">{inputEmail}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-200">
                      Enter 4-Digit Confirmation OTP
                    </label>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Test OTP: 1234
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    className="w-full py-2.5 bg-slate-950 border border-blue-500/60 rounded-xl text-center font-mono font-black text-xl text-emerald-400 tracking-widest focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                  >
                    Edit Phone
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify OTP & Start Download</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
