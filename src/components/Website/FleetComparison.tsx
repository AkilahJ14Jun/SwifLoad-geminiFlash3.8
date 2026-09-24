'use client';

import React from 'react';
import { Truck, Bike, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { VehicleCategory } from '@/types/logistics';

interface FleetComparisonProps {
  onSelectVehicle: (category: VehicleCategory) => void;
}

export default function FleetComparison({ onSelectVehicle }: FleetComparisonProps) {
  const fleetData = [
    {
      id: '2wheeler' as VehicleCategory,
      name: '2-Wheeler (Bike)',
      hindiTag: 'Express Courier',
      icon: Bike,
      capacity: 'Up to 20 kg',
      dimensions: '40 x 40 x 40 cm',
      basePrice: '₹45',
      perKm: '₹9/km',
      bestFor: 'Documents, small boxes, food items, medicine deliveries, retail parcels.',
      badge: 'Fastest in Traffic',
      color: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'hover:border-amber-500',
    },
    {
      id: '3wheeler' as VehicleCategory,
      name: '3-Wheeler Cargo Auto',
      hindiTag: 'Piaggio / Bajaj Maxima',
      icon: Truck,
      capacity: 'Up to 500 kg',
      dimensions: '5 x 4 x 4 ft',
      basePrice: '₹140',
      perKm: '₹16/km',
      bestFor: 'Small household shifting, electronic cartons, textiles, catering boxes, hardware crates.',
      badge: 'Narrow Lane Hero',
      color: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'hover:border-blue-500',
    },
    {
      id: 'tata_ace' as VehicleCategory,
      name: 'Tata Ace (Chota Hathi)',
      hindiTag: 'Most Popular Across India',
      icon: Truck,
      capacity: 'Up to 1000 kg (1 Ton)',
      dimensions: '7 x 4.5 x 5 ft',
      basePrice: '₹280',
      perKm: '₹24/km',
      bestFor: '1 BHK house shifting, furniture, refrigerators, washing machines, commercial shop supply.',
      badge: 'India’s #1 Choice',
      isPopular: true,
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-blue-600',
    },
    {
      id: 'pickup_8ft' as VehicleCategory,
      name: '8ft Large Pickup (Bolero)',
      hindiTag: 'Mahindra Bolero Maxi',
      icon: Truck,
      capacity: 'Up to 1700 kg (1.7 Ton)',
      dimensions: '8.5 x 5 x 5.5 ft',
      basePrice: '₹420',
      perKm: '₹32/km',
      bestFor: 'Industrial machinery, 2-3 BHK house shifting, steel rods, timber, large event setups.',
      badge: 'Heavy Duty',
      color: 'from-purple-500/10 to-violet-500/10',
      borderColor: 'hover:border-purple-500',
    },
  ];

  return (
    <section id="fleet" className="py-20 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Versatile Fleet Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The Right Vehicle for Every Consignment
          </h2>
          <p className="text-sm text-slate-600">
            From quick document deliveries to heavy industrial transport, choose from our verified, GPS-enabled fleet across Bengaluru.
          </p>
        </div>

        {/* Fleet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetData.map((vehicle) => {
            const IconComp = vehicle.icon;
            return (
              <div
                key={vehicle.id}
                className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                  vehicle.isPopular ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                {/* Popular Pill */}
                {vehicle.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Icon & Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {vehicle.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{vehicle.name}</h3>
                  <div className="text-[11px] text-slate-500 font-medium">{vehicle.hindiTag}</div>

                  {/* Pricing Overview */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">STARTING FROM</span>
                      <span className="text-lg font-black text-slate-900">{vehicle.basePrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">RUNNING RATE</span>
                      <span className="text-xs font-bold text-blue-700">{vehicle.perKm}</span>
                    </div>
                  </div>

                  {/* Key Specs */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Payload Capacity:</span>
                      <span className="font-bold text-slate-900">{vehicle.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-bold text-slate-900">{vehicle.dimensions}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Recommended for:</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{vehicle.bestFor}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onSelectVehicle(vehicle.id);
                      const el = document.getElementById('booking-hero');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
                      vehicle.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>Book {vehicle.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
