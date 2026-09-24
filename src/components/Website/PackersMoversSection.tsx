'use client';

import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Truck,
  Box,
  Wrench,
  Layers,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';

interface PackersMoversSectionProps {
  onBookMove: () => void;
}

export default function PackersMoversSection({ onBookMove }: PackersMoversSectionProps) {
  const { showToast } = useLogistics();
  const [selectedHomeType, setSelectedHomeType] = useState<'1bhk' | '2bhk' | '3bhk' | 'villa'>('2bhk');
  const [includeAssembly, setIncludeAssembly] = useState(true);
  const [includeFragileWrap, setIncludeFragileWrap] = useState(true);

  const homeSizes = [
    { id: '1bhk', label: '1 BHK Apartment', baseCost: 4500, estHours: '3-4 hrs', vehicle: 'Tata Ace (1 Ton)' },
    { id: '2bhk', label: '2 BHK Home', baseCost: 7800, estHours: '5-6 hrs', vehicle: '8ft Large Pickup' },
    { id: '3bhk', label: '3 BHK Large Home', baseCost: 11500, estHours: '6-8 hrs', vehicle: 'Dedicated 14ft Truck' },
    { id: 'villa', label: 'Villa / Penthouse', baseCost: 16000, estHours: 'Full Day', vehicle: 'Multi-Truck Fleet' },
  ];

  const currentHome = homeSizes.find((h) => h.id === selectedHomeType) || homeSizes[1];
  const assemblyAddon = includeAssembly ? 900 : 0;
  const wrapAddon = includeFragileWrap ? 1200 : 0;
  const totalEstimate = currentHome.baseCost + assemblyAddon + wrapAddon;

  return (
    <section id="packers-movers" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Text and Features */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>SwifLoad Packers & Movers</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Relocate Hassle-Free Across Bengaluru & Beyond
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Full-service house shifting with dedicated verified crews, multi-layer corrugated packing, furniture dismantling, and transit damage protection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3-Layer Bubble Wrap</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Edge guards for TVs, refrigerators, sofas & fragile glassware.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Carpentry & Assembly</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dismantling of beds, wardrobes, dining sets and reassembly at drop.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Rescheduling Fee</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Change your shifting slot anytime up to 4 hours before pickup.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">₹25,000 Goods Transit Cover</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Included in every booking with instant zero-dep claim assistance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Shifting Estimator Box */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Instant Shifting Estimator</h3>
                <p className="text-xs text-slate-500">Transparent rates for Bengaluru city shifting</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Guaranteed Slot
              </span>
            </div>

            {/* Home Size Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-700 block">Select Apartment / Home Size:</label>
              <div className="grid grid-cols-2 gap-2">
                {homeSizes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedHomeType(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedHomeType === item.id
                        ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.vehicle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-on toggles */}
            <div className="space-y-2.5 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Optional Relocation Add-ons:</label>

              <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Bed & Wardrobe Carpenter Dismantling</div>
                    <div className="text-[10px] text-slate-500">Includes tools, re-screwing, and assembly at drop</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700">+₹900</span>
                  <input
                    type="checkbox"
                    checked={includeAssembly}
                    onChange={(e) => setIncludeAssembly(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <Box className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Multi-layer Bubble & Thermocol Packing</div>
                    <div className="text-[10px] text-slate-500">Premium corrugated boxes and stretch film</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700">+₹1,200</span>
                  <input
                    type="checkbox"
                    checked={includeFragileWrap}
                    onChange={(e) => setIncludeFragileWrap(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </label>
            </div>

            {/* Cost Breakdown & Book CTA */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Estimated All-Inclusive Fare</span>
                <div className="text-2xl font-black text-white">₹{totalEstimate.toLocaleString()}</div>
                <span className="text-[10px] text-emerald-400 font-medium">Includes labor, vehicle & GST</span>
              </div>

              <button
                onClick={() => {
                  onBookMove();
                  showToast(`Packers & Movers configured for ${currentHome.label}!`);
                }}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
              >
                <span>Book This Move</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
