'use client';

import React, { useState } from 'react';
import {
  Truck,
  Bike,
  Package,
  Search,
  MapPin,
  ChevronDown,
  Phone,
  ShieldCheck,
  Building2,
  Smartphone,
  Columns,
  ShieldAlert,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';

interface WebNavbarProps {
  onOpenTracking: () => void;
  onOpenSimulator: (mode: 'customer' | 'driver' | 'admin' | 'dual') => void;
  onSelectServiceTab: (tab: 'trucks' | '2wheeler' | 'packers') => void;
}

export default function WebNavbar({
  onOpenTracking,
  onOpenSimulator,
  onSelectServiceTab,
}: WebNavbarProps) {
  const { currentCustomer } = useLogistics();
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSimDropdownOpen, setIsSimDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cities = [
    'Coimbatore',
    'Bengaluru',
    'Chennai',
    'Tiruppur',
    'Madurai',
    'Salem',
    'Hyderabad',
    'Mumbai',
    'Delhi NCR',
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Top micro bar for Helpline & App download prompt */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-[11px] flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-300">
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>24/7 Helpline: <strong>080 4410 4410</strong></span>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            India's Leading Intra-City On-Demand Freight Network
          </span>
        </div>

        {/* Quick Simulator Highlight */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenSimulator('dual')}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold font-mono transition-colors"
          >
            <Columns className="w-3 h-3" />
            <span>Dual Live Sim (Customer + Driver)</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & City Selector */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="font-black text-xl tracking-tight text-slate-900">SwifLoad</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Logistics</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium tracking-tight -mt-0.5">Move Anything, Anywhere</p>
            </div>
          </div>

          {/* City Selector Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>City: <strong>{selectedCity}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isCityOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                    className={`w-full text-left px-4 py-1.5 text-xs font-medium hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      selectedCity === city ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{city}</span>
                    {city === 'Coimbatore' && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-700">
          {/* Services Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors py-1"
            >
              <span>Services</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isServicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                <button
                  onClick={() => {
                    onSelectServiceTab('trucks');
                    scrollToSection('booking-hero');
                    setIsServicesOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
                >
                  <Truck className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">City Mini Trucks</div>
                    <div className="text-[10px] text-slate-500">Tata Ace, 3-Wheeler, Bolero</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectServiceTab('2wheeler');
                    scrollToSection('booking-hero');
                    setIsServicesOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
                >
                  <Bike className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">2-Wheeler (Express)</div>
                    <div className="text-[10px] text-slate-500">Parcels, couriers up to 20kg</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    scrollToSection('packers-movers');
                    setIsServicesOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Packers & Movers</div>
                    <div className="text-[10px] text-slate-500">House & office shifting</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => scrollToSection('fleet')}
            className="hover:text-blue-600 transition-colors"
          >
            Vehicle Fleet
          </button>

          <button
            onClick={() => scrollToSection('enterprise')}
            className="hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>For Enterprise</span>
          </button>

          <button
            onClick={() => scrollToSection('driver-partner')}
            className="hover:text-blue-600 transition-colors text-emerald-700 font-bold"
          >
            Driver Partner
          </button>

          <button
            onClick={onOpenTracking}
            className="hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Track Order</span>
          </button>

          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-blue-600 transition-colors"
          >
            Support
          </button>
        </div>

        {/* Right Side: Simulator Dropdown & Book CTA */}
        <div className="flex items-center space-x-2.5">
          {/* Mobile App Simulator Menu */}
          <div className="relative">
            <button
              onClick={() => setIsSimDropdownOpen(!isSimDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">App Simulator</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSimDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test In Mobile Solutions
                </div>

                <button
                  onClick={() => {
                    onOpenSimulator('customer');
                    setIsSimDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Customer App</div>
                    <div className="text-[10px] text-slate-400">Mobile phone frame simulator</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSimulator('driver');
                    setIsSimDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                >
                  <Truck className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Driver-Partner App</div>
                    <div className="text-[10px] text-slate-400">Accept trips, verify OTPs, navigate</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSimulator('admin');
                    setIsSimDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Operations Admin</div>
                    <div className="text-[10px] text-slate-400">Live dispatch, KYC, pricing, finance</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSimulator('dual');
                    setIsSimDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/80 flex items-center space-x-2.5 transition-colors"
                >
                  <Columns className="w-4 h-4 text-teal-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Dual Live Sim</div>
                    <div className="text-[10px] text-teal-300">Customer + Driver side by side</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Book Now Button */}
          <button
            onClick={() => scrollToSection('booking-hero')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            Book Online
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 text-xs font-semibold animate-in slide-in-from-top">
          <button
            onClick={() => {
              onSelectServiceTab('trucks');
              scrollToSection('booking-hero');
            }}
            className="w-full text-left py-2 text-slate-800"
          >
            🚚 City Trucks
          </button>
          <button
            onClick={() => {
              onSelectServiceTab('2wheeler');
              scrollToSection('booking-hero');
            }}
            className="w-full text-left py-2 text-slate-800"
          >
            🛵 2-Wheeler Courier
          </button>
          <button
            onClick={() => scrollToSection('packers-movers')}
            className="w-full text-left py-2 text-slate-800"
          >
            📦 Packers & Movers
          </button>
          <button
            onClick={() => scrollToSection('fleet')}
            className="w-full text-left py-2 text-slate-800"
          >
            🚛 Vehicle Fleet Guide
          </button>
          <button
            onClick={() => scrollToSection('enterprise')}
            className="w-full text-left py-2 text-slate-800"
          >
            🏢 SwifLoad Enterprise
          </button>
          <button
            onClick={() => scrollToSection('driver-partner')}
            className="w-full text-left py-2 text-emerald-700 font-bold"
          >
            💵 Drive & Earn With Us
          </button>
          <button
            onClick={() => {
              onOpenTracking();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-blue-600 font-bold"
          >
            🔍 Track Active Consignment
          </button>
        </div>
      )}
    </nav>
  );
}
