'use client';

import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

interface WebFooterProps {
  onOpenProhibited: () => void;
}

export default function WebFooter({ onOpenProhibited }: WebFooterProps) {
  const cities = [
    'Coimbatore',
    'Tiruppur',
    'Chennai',
    'Madurai',
    'Salem',
    'Bangalore',
    'Mumbai',
    'Delhi NCR',
    'Hyderabad',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Surat',
    'Jaipur',
    'Lucknow',
    'Indore',
    'Nagpur',
    'Chandigarh',
    'Kochi',
    'Vadodara',
    'Nashik',
    'Kanpur',
    'Ludhiana',
    'Visakhapatnam',
    'Trivandrum',
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Top Footer Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                ⚡
              </div>
              <span className="font-black text-lg text-white tracking-tight">SwifLoad Logistics</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              India’s reliable on-demand goods transportation and packers & movers network. Delivering seamlessly with verified driver partners, upfront transparent pricing, and live GPS telemetry.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>24/7 Customer Care: <strong>0422 4410 4410</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Support: <strong>help@swifload.in</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Central Hub: Avinashi Road, Near Tidel Park & Peelamedu, Coimbatore 641014, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><a href="#booking-hero" className="hover:text-white transition-colors">City Mini Trucks</a></li>
              <li><a href="#booking-hero" className="hover:text-white transition-colors">2-Wheeler Express Parcel</a></li>
              <li><a href="#packers-movers" className="hover:text-white transition-colors">Packers & Movers</a></li>
              <li><a href="#fleet" className="hover:text-white transition-colors">Fleet Specifications</a></li>
              <li><a href="#enterprise" className="hover:text-white transition-colors">SwifLoad Enterprise</a></li>
              <li><a href="#driver-partner" className="hover:text-white transition-colors">Driver Partner Onboarding</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company & Safety</h4>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Safety & Security Standards</a></li>
              <li>
                <button
                  type="button"
                  onClick={onOpenProhibited}
                  className="text-left hover:text-white transition-colors text-amber-400"
                >
                  Prohibited Items Policy
                </button>
              </li>
              <li><a href="#faq" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Insurance FAQ</a></li>
            </ul>
          </div>

          {/* Operational Cities (Porter list) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Major Cities</h4>
            <div className="flex flex-wrap gap-1.5">
              {cities.slice(0, 14).map((city) => (
                <span
                  key={city}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 SwifLoad Technologies India Pvt. Ltd. CIN: U74999KA2024PTC198421. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>GST Registered Intra-City Transporter</span>
            <span>•</span>
            <span>Made with precision for Indian Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
