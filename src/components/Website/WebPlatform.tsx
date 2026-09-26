'use client';

import React, { useState } from 'react';
import {
  Truck,
  Bike,
  Package,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  Building2,
  Users,
} from 'lucide-react';
import WebNavbar from './WebNavbar';
import HeroBookingWidget from './HeroBookingWidget';
import FleetComparison from './FleetComparison';
import PackersMoversSection from './PackersMoversSection';
import EnterpriseSection from './EnterpriseSection';
import DriverPartnerSection from './DriverPartnerSection';
import TrustAndSafetySection from './TrustAndSafetySection';
import CustomerReviewsSection from './CustomerReviewsSection';
import WebFaqSection from './WebFaqSection';
import WebFooter from './WebFooter';
import LiveTrackingModal from './LiveTrackingModal';
import BookingSuccessModal from './BookingSuccessModal';
import ProhibitedGoodsModal from './ProhibitedGoodsModal';
import { VehicleCategory } from '@/types/logistics';
import { useLogistics } from '@/context/LogisticsContext';

interface WebPlatformProps {
  onOpenSimulator: (mode: 'customer' | 'driver' | 'admin' | 'dual') => void;
}

export default function WebPlatform({ onOpenSimulator }: WebPlatformProps) {
  const { setActiveTripId, showToast } = useLogistics();

  // Modals state
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingTripId, setTrackingTripId] = useState<string | undefined>(undefined);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [latestTripId, setLatestTripId] = useState<string | null>(null);

  const [isProhibitedOpen, setIsProhibitedOpen] = useState(false);

  // Selected vehicle pre-fill for Hero widget
  const [preselectedVehicle, setPreselectedVehicle] = useState<VehicleCategory>('tata_ace');

  const handleBookingSuccess = (tripId: string) => {
    setLatestTripId(tripId);
    setActiveTripId(tripId);
    setIsSuccessOpen(true);
    showToast(`Trip booked successfully! Booking ID: ${tripId.slice(-6).toUpperCase()}`);
  };

  const handleOpenTracking = (tripId?: string) => {
    setTrackingTripId(tripId);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Sticky Navigation */}
      <WebNavbar
        onOpenTracking={() => handleOpenTracking()}
        onOpenSimulator={onOpenSimulator}
        onSelectServiceTab={(tab) => {
          const el = document.getElementById('booking-hero');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Section */}
      <section
        id="booking-hero"
        className="relative pt-10 pb-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden"
      >
        {/* Subtle decorative grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient colored lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Main Headline */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>India’s Leading Intra-City Logistics & Goods Transport Agency</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Reliable & Hassle-Free Goods Transportation
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From a small document courier to 1000kg commercial freight and full-house shifting. On-demand trucks and two-wheelers across Coimbatore in minutes.
            </p>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 pt-2">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Driver-Partners</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Upfront Transparent Fares</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live GPS Tracking & Dual OTPs</span>
              </div>
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>4.8/5 (100k+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* Interactive Booking / Fare Estimator Card */}
          <HeroBookingWidget
            onBookingSuccess={handleBookingSuccess}
            onOpenTracking={handleOpenTracking}
            onOpenProhibited={() => setIsProhibitedOpen(true)}
          />
        </div>
      </section>

      {/* Fleet Comparison Matrix */}
      <FleetComparison
        onSelectVehicle={(category) => {
          setPreselectedVehicle(category);
        }}
      />

      {/* Packers & Movers Dedicated Section */}
      <PackersMoversSection
        onBookMove={() => {
          const el = document.getElementById('booking-hero');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Enterprise Logistics Hub with Interactive ROI Calculator */}
      <EnterpriseSection />

      {/* Driver Partner Section with Instant Onboarding */}
      <DriverPartnerSection
        onOpenDriverApp={() => onOpenSimulator('driver')}
      />

      {/* Trust, Security & Safety Standards */}
      <TrustAndSafetySection
        onOpenProhibited={() => setIsProhibitedOpen(true)}
      />

      {/* Social Proof & Customer Reviews */}
      <CustomerReviewsSection />

      {/* Interactive FAQ Section */}
      <WebFaqSection
        onOpenProhibited={() => setIsProhibitedOpen(true)}
      />

      {/* Comprehensive Footer */}
      <WebFooter
        onOpenProhibited={() => setIsProhibitedOpen(true)}
      />

      {/* ================= MODALS ================= */}
      {/* 1. Live GPS Tracking Modal */}
      <LiveTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialTripId={trackingTripId}
        onOpenSimulator={onOpenSimulator}
      />

      {/* 2. Booking Success Modal */}
      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        tripId={latestTripId}
        onOpenTracking={(tripId) => {
          setIsSuccessOpen(false);
          handleOpenTracking(tripId);
        }}
        onOpenSimulator={onOpenSimulator}
      />

      {/* 3. Prohibited Goods & Policy Modal */}
      <ProhibitedGoodsModal
        isOpen={isProhibitedOpen}
        onClose={() => setIsProhibitedOpen(false)}
      />
    </div>
  );
}
