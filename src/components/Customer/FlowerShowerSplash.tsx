'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, X } from 'lucide-react';

interface FlowerShowerSplashProps {
  onDismiss: () => void;
}

const FLOWERS = ['🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '💐', '🏵️'];

interface Petal {
  id: number;
  flower: string;
  left: number; // percentage
  size: number; // px
  delay: number; // seconds
  duration: number; // seconds
  swayAmount: number; // px
}

export default function FlowerShowerSplash({ onDismiss }: FlowerShowerSplashProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    // Generate 36 random petals with varying physics
    const generated: Petal[] = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      flower: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
      left: Math.random() * 96 + 2, // 2% to 98%
      size: Math.floor(Math.random() * 20) + 18, // 18px to 38px
      delay: Math.random() * 1.5,
      duration: Math.random() * 2.5 + 2.5, // 2.5s to 5.0s
      swayAmount: (Math.random() - 0.5) * 60,
    }));
    setPetals(generated);

    // Auto-countdown dismiss
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-300">
      {/* Flower Shower Falling Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="absolute select-none opacity-90 animate-flower-fall"
            style={{
              left: `${petal.left}%`,
              fontSize: `${petal.size}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              animationIterationCount: 'infinite',
            }}
          >
            {petal.flower}
          </div>
        ))}
      </div>

      {/* Welcome Card Container */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 text-center text-white shadow-2xl space-y-4 shadow-emerald-950/50">
        <button
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Skip Splash Greeting"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Festive Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>வணக்கம் • Welcome to Coimbatore</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-1">
          <div className="text-3xl">🌸 🌺 🌼</div>
          <h2 className="text-xl font-black tracking-tight text-white">
            SwiftLoad Coimbatore
          </h2>
          <p className="text-xs text-emerald-300/90 font-medium">
            Express Intra-City Freight & On-Demand Logistics
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2 text-left pt-1">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-medium leading-tight">
              2W, 3W, 4W & EV Loaders
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-medium leading-tight">
              Two-Way Secure OTP
            </span>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="pt-2">
          <button
            onClick={onDismiss}
            className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            <span>Enter Customer App ({countdown}s)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            Peelamedu • Gandhipuram • RS Puram • Saravanampatti • SIDCO
          </p>
        </div>
      </div>
    </div>
  );
}
