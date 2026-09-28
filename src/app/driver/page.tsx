'use client';

import React, { useEffect } from 'react';
import DriverApp from '@/components/Driver/DriverApp';
import { useLogistics } from '@/context/LogisticsContext';
import Link from 'next/link';
import { Truck, Download, ArrowLeft } from 'lucide-react';

export default function DriverPage() {
  const { setRole } = useLogistics();

  useEffect(() => {
    setRole('driver');
  }, [setRole]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Mobile Driver Header Utility Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>SwifLoad Home</span>
        </Link>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Driver Live</span>
          </span>
          <Link
            href="/downloads"
            className="flex items-center space-x-1 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-medium border border-amber-500/30 transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Driver APK</span>
          </Link>
        </div>
      </header>

      {/* Main Driver Interface */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-md bg-slate-950 flex flex-col min-h-[calc(100vh-41px)] shadow-2xl">
          <DriverApp />
        </div>
      </main>
    </div>
  );
}
