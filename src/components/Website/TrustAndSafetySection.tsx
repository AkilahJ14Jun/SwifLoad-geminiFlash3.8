'use client';

import React from 'react';
import { ShieldCheck, Lock, PhoneCall, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TrustAndSafetySectionProps {
  onOpenProhibited: () => void;
}

export default function TrustAndSafetySection({ onOpenProhibited }: TrustAndSafetySectionProps) {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Verified Drivers',
      desc: 'Commercial DL, RC book, police background clearance, and vehicle fitness inspected before onboarding.',
      badge: 'Verified KYC',
    },
    {
      icon: Lock,
      title: 'Dual OTP Handover Protocol',
      desc: 'Guaranteed parcel custody: Driver cannot start trip without Pickup OTP, nor complete it without Delivery OTP.',
      badge: 'Zero Loss SLA',
    },
    {
      icon: PhoneCall,
      title: 'Masked Virtual Calling',
      desc: 'Customer and recipient personal numbers remain completely private through cloud telephony routing.',
      badge: '100% Privacy',
    },
    {
      icon: FileText,
      title: 'Automated GST Invoicing',
      desc: 'Instant PDF tax invoice with verified HSN/SAC codes (9965) for 100% GST input tax credit claim.',
      badge: 'Tax Compliant',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise-Grade Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Safety & Reliability Built into Every Single Mile
          </h2>
          <p className="text-sm text-slate-400">
            We hold our fleet and technology to strict urban transport standards, ensuring safe transit for commercial consignments and home valuables alike.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 font-mono bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prohibited items warning bar */}
        <div className="mt-10 p-4 bg-slate-800/90 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3 text-slate-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Zero Tolerance Compliance:</strong> Transporting hazardous chemicals, explosives, or illegal contraband is strictly prohibited.
            </span>
          </div>

          <button
            onClick={onOpenProhibited}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold transition-colors"
          >
            Review Prohibited Goods Policy
          </button>
        </div>
      </div>
    </section>
  );
}
