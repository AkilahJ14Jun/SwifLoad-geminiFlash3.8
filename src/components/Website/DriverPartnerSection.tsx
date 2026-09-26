'use client';

import React, { useState } from 'react';
import {
  Truck,
  Bike,
  ShieldCheck,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory } from '@/types/logistics';

interface DriverPartnerSectionProps {
  onOpenDriverApp: () => void;
}

export default function DriverPartnerSection({ onOpenDriverApp }: DriverPartnerSectionProps) {
  const { registerDriver, setSelectedDriverId, showToast } = useLogistics();

  // Registration form
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('tata_ace');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newDriverId, setNewDriverId] = useState('');

  const earningsTiers = [
    { category: '2-Wheeler Bike', earnings: '₹18,000 - ₹24,000', trips: '15-20 trips/day', icon: Bike },
    { category: '3-Wheeler Auto', earnings: '₹28,000 - ₹36,000', trips: '8-12 trips/day', icon: Truck },
    { category: 'Tata Ace (1 Ton)', earnings: '₹35,000 - ₹48,000', trips: '5-8 trips/day', icon: Truck, highlight: true },
    { category: '8ft Bolero Pickup', earnings: '₹45,000 - ₹62,000', trips: '4-7 trips/day', icon: Truck },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerPhone || !vehicleNumber) {
      showToast('Please fill all required partner fields');
      return;
    }

    try {
      const driverId = registerDriver({
        name: partnerName,
        phone: partnerPhone.startsWith('+91') ? partnerPhone : `+91 ${partnerPhone}`,
        email: `${partnerName.toLowerCase().replace(/\s+/g, '')}@partner.swifload.in`,
        vehicleCategory: selectedVehicle,
        vehicleModel:
          selectedVehicle === 'tata_ace'
            ? 'Tata Ace Gold'
            : selectedVehicle === '3wheeler'
            ? 'Bajaj Maxima'
            : selectedVehicle === 'pickup_8ft'
            ? 'Mahindra Bolero Maxi'
            : 'Honda Activa 6G',
        vehicleNumber: vehicleNumber.toUpperCase(),
        licenseNumber: drivingLicense || 'KA-01-2023000984',
        rcNumber: `RC-${vehicleNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
        insuranceNumber: 'POL-HDFC-99120',
        aadhaarNumber: 'XXXX-XXXX-8821',
        accountName: partnerName,
        accountNumber: '91882001928',
        ifscCode: 'HDFC0001824',
        upiId: `${partnerPhone.replace(/[^0-9]/g, '').slice(-10)}@upi`,
      });

      setNewDriverId(driverId);
      setSelectedDriverId(driverId);
      setIsSuccess(true);
      showToast('Driver Partner application registered successfully!');
    } catch (err: any) {
      showToast(err.message || 'Error registering driver');
    }
  };

  return (
    <section id="driver-partner" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Drive With SwifLoad</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Turn Your Vehicle Into a Reliable Daily Income Machine
          </h2>
          <p className="text-sm text-slate-400">
            Join 50,000+ driver-partners across India. Enjoy daily instant IMPS payouts, flexible work hours, zero joining fee, and comprehensive health & accident cover.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Earnings Tiers & Perks */}
          <div className="lg:col-span-7 space-y-6">
            {/* Earnings grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {earningsTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    tier.highlight
                      ? 'bg-gradient-to-br from-blue-900/60 to-slate-800 border-blue-500/60 shadow-lg'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">{tier.category}</span>
                    {tier.highlight && (
                      <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                        HIGH DEMAND
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-emerald-400">{tier.earnings}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Expected: {tier.trips}</div>
                </div>
              ))}
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <Wallet className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-xs font-bold text-white">Daily IMPS Payouts</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Withdraw your trip earnings directly into your bank within 60 seconds.</p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-xs font-bold text-white">₹5 Lakh Insurance</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Complimentary accidental & hospitalization cover for you and your family.</p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs font-bold text-white">100% Flexibility</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Switch online whenever you want. No forced minimum logins or penalty.</p>
              </div>
            </div>
          </div>

          {/* Right: Partner Onboarding Form */}
          <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Partner Application Received!</h3>
                <p className="text-xs text-slate-300">
                  Partner ID: <strong className="font-mono text-emerald-400">{newDriverId}</strong>. Your documents are being verified by the operations desk.
                </p>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2 text-left">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Instant Simulator Test</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You can switch right now to the Driver-Partner App simulator to see this driver account online and accept incoming trips!
                  </p>
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    onClick={onOpenDriverApp}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg"
                  >
                    <span>Launch Driver Simulator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setPartnerName('');
                      setPartnerPhone('');
                      setVehicleNumber('');
                    }}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-medium"
                  >
                    Register Another Vehicle
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-base font-black text-white">Attach Your Vehicle Now</h3>
                  <p className="text-xs text-slate-400">Start accepting orders in Coimbatore within 15 minutes</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Murugan K"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="+91 98422 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Vehicle Category *</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value as VehicleCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="tata_ace">Tata Ace (Chota Hathi - 1000kg)</option>
                    <option value="3wheeler">3-Wheeler Cargo Auto (500kg)</option>
                    <option value="pickup_8ft">8ft Large Pickup Bolero (1700kg)</option>
                    <option value="2wheeler">2-Wheeler Bike (20kg)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Vehicle Reg Number *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="TN-38-AX-4821"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Driving Licence (DL)</label>
                    <input
                      type="text"
                      value={drivingLicense}
                      onChange={(e) => setDrivingLicense(e.target.value)}
                      placeholder="TN-38-2019..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Register As Partner</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
