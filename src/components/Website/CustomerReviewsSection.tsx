'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote } from 'lucide-react';

export default function CustomerReviewsSection() {
  const reviews = [
    {
      name: 'Ravi Teja',
      designation: 'Store Manager, Royal Hardware Peenya',
      content:
        'We ship 15-20 consignments of industrial pipes and fittings daily. SwifLoad’s 8ft pickup trucks arrive in less than 15 minutes, and their GST invoices make reconciliation seamless.',
      rating: 5,
      vehicle: '8ft Large Pickup',
      city: 'Peenya, Bengaluru',
    },
    {
      name: 'Sneha Venkatesh',
      designation: 'Founder, Botanica Bloom D2C',
      content:
        'The 2-wheeler express delivery is an absolute lifesaver for our flower & luxury gift hampers. Live OTP handover ensures zero parcel misplacement and our customers love the live tracking link!',
      rating: 5,
      vehicle: '2-Wheeler Express',
      city: 'Indiranagar, Bengaluru',
    },
    {
      name: 'Dr. Alok Sen & Family',
      designation: 'Moved from Koramangala to Whitefield',
      content:
        'We booked the 2 BHK Packers & Movers service. The crew arrived with high-grade bubble wrap and dismantled our modular wooden wardrobes without a scratch. Extremely professional team!',
      rating: 5,
      vehicle: 'Packers & Movers',
      city: 'Whitefield, Bengaluru',
    },
  ];

  const stats = [
    { label: 'Operational Cities', value: '22+', sub: 'Across Tier 1 & 2 India' },
    { label: 'Completed Deliveries', value: '10M+', sub: 'Safe goods dispatches' },
    { label: 'Verified Partners', value: '50K+', sub: 'Commercial drivers & bikes' },
    { label: 'Customer Rating', value: '4.8 ★', sub: 'From 1,20,000+ ratings' },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-16 border-b border-slate-200">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-xs font-bold text-slate-800">{s.label}</div>
              <div className="text-[11px] text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto my-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span>Trusted Across Karnataka</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Loved by 500,000+ Businesses & Households
          </h2>
          <p className="text-sm text-slate-600">
            Read real feedback from store owners, enterprise distributors, and relocated residents.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">5.0</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic mb-6">
                  "{r.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{r.name}</div>
                    <div className="text-[11px] text-slate-500">{r.designation}</div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700">
                    {r.vehicle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
