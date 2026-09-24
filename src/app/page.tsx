'use client';

import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Truck,
  ShieldAlert,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import CustomerApp from '@/components/Customer/CustomerApp';
import DriverApp from '@/components/Driver/DriverApp';
import AdminPortal from '@/components/Admin/AdminPortal';
import WebPlatform from '@/components/Website/WebPlatform';

export default function Home() {
  const { role, setRole, toastMessage } = useLogistics();
  const [viewMode, setViewMode] = useState<'website' | 'customer' | 'driver' | 'admin' | 'dual'>('website');
  const [isFramed, setIsFramed] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Universal Top Bar when testing in Simulator or toggling to Website */}
      {viewMode !== 'website' && (
        <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 animate-in slide-in-from-top">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('website')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Back to SwifLoad Website</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-slate-400 font-mono">
                Active Simulator: <strong className="text-white uppercase">{viewMode}</strong>
              </span>
            </div>
          </div>

          {/* Simulator switcher tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setViewMode('customer');
                setRole('customer');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'customer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer App</span>
            </button>

            <button
              onClick={() => {
                setViewMode('driver');
                setRole('driver');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'driver'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver App</span>
            </button>

            <button
              onClick={() => {
                setViewMode('admin');
                setRole('admin');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => setViewMode('dual')}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'dual'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-side Customer + Driver Simulation"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Sim</span>
            </button>
          </div>

          {/* Device Frame Toggle */}
          <div className="flex items-center space-x-2">
            {viewMode !== 'admin' && viewMode !== 'dual' && (
              <button
                onClick={() => setIsFramed(!isFramed)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1 transition-colors border border-slate-700"
                title="Toggle mobile device frame"
              >
                {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFramed ? 'Full Width' : 'Phone Frame'}</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Floating System Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[200] animate-bounce">
          <div className="bg-slate-900 border border-emerald-500/80 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ================= 1. WEBSITE PLATFORM (PORTER STYLE) ================= */}
      {viewMode === 'website' && (
        <WebPlatform
          onOpenSimulator={(mode) => {
            setViewMode(mode);
            setRole(mode === 'admin' ? 'admin' : mode === 'driver' ? 'driver' : 'customer');
          }}
        />
      )}

      {/* ================= SIMULATOR WORKSPACE ================= */}
      {viewMode !== 'website' && (
        <main className="flex-1 flex items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* 1. CUSTOMER APP VIEW */}
          {viewMode === 'customer' &&
            (isFramed ? (
              <div className="w-full max-w-[420px] h-[92vh] max-h-[880px] bg-slate-900 rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-slate-800 flex flex-col relative">
                {/* Phone Speaker & Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
                </div>

                {/* Status Bar */}
                <div className="h-6 px-6 pt-1 flex items-center justify-between text-[11px] text-slate-300 font-semibold z-30 select-none">
                  <span>09:41</span>
                  <div className="flex items-center space-x-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Inner App Container */}
                <div className="flex-1 rounded-[34px] overflow-hidden bg-slate-50 relative flex flex-col">
                  <CustomerApp />
                </div>

                {/* Bottom Home Indicator */}
                <div className="h-4 flex items-center justify-center">
                  <div className="w-32 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[90vh] bg-slate-50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <CustomerApp />
              </div>
            ))}

          {/* 2. DRIVER-PARTNER APP VIEW */}
          {viewMode === 'driver' &&
            (isFramed ? (
              <div className="w-full max-w-[420px] h-[92vh] max-h-[880px] bg-slate-900 rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-slate-800 flex flex-col relative">
                {/* Phone Speaker & Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
                </div>

                {/* Status Bar */}
                <div className="h-6 px-6 pt-1 flex items-center justify-between text-[11px] text-slate-300 font-semibold z-30 select-none">
                  <span>09:41</span>
                  <div className="flex items-center space-x-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Inner App Container */}
                <div className="flex-1 rounded-[34px] overflow-hidden bg-slate-900 relative flex flex-col">
                  <DriverApp />
                </div>

                {/* Bottom Home Indicator */}
                <div className="h-4 flex items-center justify-center">
                  <div className="w-32 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[90vh] bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <DriverApp />
              </div>
            ))}

          {/* 3. OPERATIONS ADMIN PORTAL */}
          {viewMode === 'admin' && (
            <div className="w-full h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
              <AdminPortal />
            </div>
          )}

          {/* 4. DUAL LIVE SIMULATION */}
          {viewMode === 'dual' && (
            <div className="w-full max-w-6xl h-[90vh] flex items-center justify-center space-x-6">
              {/* Customer Device */}
              <div className="flex-1 max-w-[420px] h-full bg-slate-900 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 flex flex-col relative">
                <div className="text-center py-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Customer Experience
                  </span>
                </div>
                <div className="flex-1 rounded-[34px] overflow-hidden bg-slate-50 relative flex flex-col">
                  <CustomerApp />
                </div>
              </div>

              {/* Live Synchronizer Banner */}
              <div className="hidden lg:flex flex-col items-center justify-center space-y-3 px-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-spin">
                  ⇄
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase text-center max-w-[80px]">
                  Real-Time State Sync
                </span>
              </div>

              {/* Driver Device */}
              <div className="flex-1 max-w-[420px] h-full bg-slate-900 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 flex flex-col relative">
                <div className="text-center py-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Driver-Partner Experience
                  </span>
                </div>
                <div className="flex-1 rounded-[34px] overflow-hidden bg-slate-900 relative flex flex-col">
                  <DriverApp />
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
