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
} from 'lucide-react';

export default function DownloadsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install this app on your mobile device:\n\n' +
        '• Android (Chrome): Tap the three-dot menu ⋮ at top right and choose "Add to Home screen" or "Install app".\n' +
        '• iOS (Safari): Tap the Share button at bottom and tap "Add to Home Screen".'
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
                <span className="bg-blue-950 text-blue-400 border border-blue-800/60 text-xs px-3 py-1 rounded-full font-semibold">
                  Customer Mobile Edition
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Customer Booking App</h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Instant truck booking, live GPS driver tracking, slab distance estimates, in-app wallet, and referral rewards for Coimbatore.
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-300">
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
              {/* Option A: Direct Web Launch */}
              <Link
                href="/customer"
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Mobile Web App</span>
              </Link>

              {/* Option B: Direct Android APK */}
              <a
                href="/downloads/SwifLoad-Customer.apk"
                download="SwifLoad-Customer.apk"
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-xs"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Android APK (Direct)</span>
              </a>

              {/* Option C: 1-Click PWA Install */}
              <button
                onClick={handleInstallPwa}
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
                <span className="bg-amber-950 text-amber-400 border border-amber-800/60 text-xs px-3 py-1 rounded-full font-semibold">
                  Driver Partner Edition
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Driver-Partner App</h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Instant dispatch alerts, trip acceptance, OTP verification, photo cargo proof, wallet earnings, and KYC verification.
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Immediate broadcast alert on customer trip requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Negative balance tolerance & daily payout clearance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Coimbatore driver group radius filtering</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              {/* Option A: Direct Web Launch */}
              <Link
                href="/driver"
                className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-600/25"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Mobile Driver App</span>
              </Link>

              {/* Option B: Direct Android APK */}
              <a
                href="/downloads/SwifLoad-Driver.apk"
                download="SwifLoad-Driver.apk"
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-xs"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Android APK (Direct)</span>
              </a>

              {/* Option C: 1-Click PWA Install */}
              <button
                onClick={handleInstallPwa}
                className="w-full text-center text-xs text-amber-400 hover:text-amber-300 underline py-1"
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
    </div>
  );
}
