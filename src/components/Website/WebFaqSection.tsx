'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert } from 'lucide-react';

interface WebFaqSectionProps {
  onOpenProhibited: () => void;
}

export default function WebFaqSection({ onOpenProhibited }: WebFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What items are prohibited by SwifLoad for transport?',
      a: 'Prohibited items include: flammable items (firecrackers, arms, ammunition, paint cans, fuel), corrosive chemicals, toxic substances, biological or medical waste, contraband, narcotics, precious metals/cash, loose glass displays, and livestock. All shipments are subject to physical inspection by driver partners before loading.',
      action: 'View Prohibited Goods List',
    },
    {
      q: 'How are the charges for goods transportation calculated?',
      a: 'The fare is calculated transparently based on: 1) Base fare for initial kilometers, 2) Per-km rate for additional distance, 3) Optional helper loading assistance, and 4) 5% GST. The fare shown upfront before booking is guaranteed with no hidden driver surcharges.',
    },
    {
      q: 'Does SwifLoad provide Packers and Movers for home shifting?',
      a: 'Yes! SwifLoad Packers & Movers provides complete intracity and intercity relocation for 1 BHK, 2 BHK, 3 BHK, and office setups. Services include trained shifting labor, multi-layer corrugated bubble wrap packing, furniture dismantling/assembly, and transit insurance coverage.',
    },
    {
      q: 'How does live GPS tracking and dual OTP verification work?',
      a: 'Every booking generates a real-time tracking link with live Leaflet GPS telemetry. For security, a 4-digit Pickup OTP must be verified by the driver before loading goods, and a 4-digit Delivery OTP must be entered by the recipient upon safe drop-off.',
    },
    {
      q: 'Does SwifLoad provide vehicles like Tata Ace on monthly lease?',
      a: 'SwifLoad provides instant on-demand availability of vehicles without lock-in contracts. For regular high-volume deliveries, businesses can utilize SwifLoad Enterprise which provides prioritized vehicle allocation, dedicated account managers, and consolidated monthly billing.',
    },
    {
      q: 'How does an API integration work for e-commerce and retail businesses?',
      a: 'SwifLoad provides developer-friendly REST APIs and webhooks. Your order management system or website (Shopify, WooCommerce, custom ERP) can automatically trigger pickups, receive live location telemetry, and verify deliveries seamlessly.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Got Questions? We’ve Got Answers</h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about SwifLoad goods transport, pricing, and security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-3 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    <p>{faq.a}</p>
                    {faq.action && (
                      <button
                        onClick={onOpenProhibited}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{faq.action}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
