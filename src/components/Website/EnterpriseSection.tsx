'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  TrendingDown,
  ShieldCheck,
  Code2,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Headphones,
  Sparkles,
  X,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';

export default function EnterpriseSection() {
  const { showToast } = useLogistics();

  // Calculator sliders
  const [monthlyOrders, setMonthlyOrders] = useState<number>(350);
  const [avgKm, setAvgKm] = useState<number>(14);

  // Enterprise modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');

  // Calculations
  const metrics = useMemo(() => {
    // Estimated SwifLoad cost: ~₹380 average trip for 14km
    const swifloadAvgTripCost = Math.round(180 + avgKm * 18);
    const monthlySwifloadSpend = monthlyOrders * swifloadAvgTripCost;

    // Owning dedicated fleet cost: Vehicle EMI/depreciation, full-time driver salaries, fuel, maintenance, idle deadheads
    const estimatedTrucksNeeded = Math.max(2, Math.ceil(monthlyOrders / 90));
    const fixedCostPerTruck = 42000; // Salary + EMI + Insurance
    const fuelAndMaintPerTrip = Math.round(avgKm * 28);
    const monthlyOwnedSpend = estimatedTrucksNeeded * fixedCostPerTruck + monthlyOrders * fuelAndMaintPerTrip;

    const monthlySavings = Math.max(0, monthlyOwnedSpend - monthlySwifloadSpend);
    const savingsPercent = Math.round((monthlySavings / monthlyOwnedSpend) * 100);

    return {
      monthlySwifloadSpend,
      monthlyOwnedSpend,
      monthlySavings,
      savingsPercent: isNaN(savingsPercent) ? 35 : Math.min(55, Math.max(20, savingsPercent)),
      estimatedTrucksNeeded,
    };
  }, [monthlyOrders, avgKm]);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !businessEmail) {
      showToast('Please provide your company name and email');
      return;
    }
    showToast(`Enterprise consultation booked for ${companyName}! Account team will contact you within 2 business hours.`);
    setIsModalOpen(false);
    setCompanyName('');
    setBusinessEmail('');
    setBusinessPhone('');
  };

  return (
    <section id="enterprise" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>SwifLoad For Enterprise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Streamline City Deliveries with On-Demand Bulk Fleet & APIs
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate fixed fleet overheads. Scale delivery capacity on demand across Coimbatore with priority driver dispatches, multi-stop routing, and automated webhook order injection.
          </p>
        </div>

        {/* Grid: Pillars & Interactive Savings Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Enterprise Features */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Centralized Billing & 100% GST Tax Invoices</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Single monthly consolidated invoice for all branch deliveries, eliminating cash reimbursements and providing full GST input credit.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">RESTful Shipping APIs & Webhook Callbacks</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Direct integration into Shopify, WooCommerce, ERP, and WMS. Automated pickup booking, live location telemetry webhooks, and OTP handovers.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dedicated Key Account Manager & SLA Guarantee</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Guaranteed 99.4% pickup SLA with sub-12 minute vehicle assignment across all Coimbatore industrial and textile belts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Schedule Corporate Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Interactive ROI Savings Calculator */}
          <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black text-white">Interactive Fleet ROI Calculator</h3>
                <p className="text-xs text-slate-400">Compare SwifLoad on-demand vs owning captive trucks</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                ESTIMATED ~{metrics.savingsPercent}% SAVINGS
              </span>
            </div>

            {/* Slider 1: Monthly Shipments */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Monthly Intra-City Shipments:</span>
                <span className="text-blue-400 font-black font-mono text-sm">{monthlyOrders} trips/mo</span>
              </div>
              <input
                type="range"
                min={50}
                max={1500}
                step={25}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50 trips</span>
                <span>500 trips</span>
                <span>1500+ trips</span>
              </div>
            </div>

            {/* Slider 2: Average Distance */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Average Trip Distance:</span>
                <span className="text-blue-400 font-black font-mono text-sm">{avgKm} km</span>
              </div>
              <input
                type="range"
                min={3}
                max={35}
                step={1}
                value={avgKm}
                onChange={(e) => setAvgKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>3 km (Hyperlocal)</span>
                <span>15 km (Cross-city)</span>
                <span>35 km (Suburbs)</span>
              </div>
            </div>

            {/* Comparison Metrics Output */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-700/60 mb-5">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Owning Dedicated Fleet</span>
                <div className="text-base font-bold text-rose-400 line-through">
                  ₹{metrics.monthlyOwnedSpend.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">{metrics.estimatedTrucksNeeded} captive trucks required</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase">With SwifLoad On-Demand</span>
                <div className="text-base font-extrabold text-emerald-400">
                  ₹{metrics.monthlySwifloadSpend.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300/80">Pay only per completed km</span>
              </div>
            </div>

            {/* Total Monthly Savings Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">
                  Estimated Net Monthly Savings
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{metrics.monthlySavings.toLocaleString()} / mo
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{metrics.savingsPercent}%</span>
                <span className="text-[10px] text-slate-400 block">Cost Reduction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl p-6 text-white relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">SwifLoad Enterprise Access</h3>
                <p className="text-xs text-slate-400">Get customized pricing, API keys & credit terms</p>
              </div>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Zenith Furniture Pvt Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Iyer"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="logistics@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Submit Enterprise Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
