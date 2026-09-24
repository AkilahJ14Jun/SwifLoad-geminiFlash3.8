'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  MapPin,
  Truck,
  Phone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ChevronRight,
  Package,
  Sparkles,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import LeafletMap from '@/components/Map/LeafletMap';
import { TripStatus } from '@/types/logistics';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTripId?: string;
  onOpenSimulator?: (mode: 'driver' | 'customer' | 'dual') => void;
}

export default function LiveTrackingModal({
  isOpen,
  onClose,
  initialTripId,
  onOpenSimulator,
}: LiveTrackingModalProps) {
  const { trips, drivers, activeTripId } = useLogistics();
  const [searchQuery, setSearchQuery] = useState(initialTripId || activeTripId || 'trip_blr_1001');

  if (!isOpen) return null;

  // Find trip by ID, booking code, or customer phone
  const selectedTrip =
    trips.find(
      (t) =>
        t.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
        t.bookingCode.toLowerCase() === searchQuery.trim().toLowerCase() ||
        t.customerPhone.includes(searchQuery.trim())
    ) || trips[0];

  const matchedDriver = selectedTrip?.driverId
    ? drivers.find((d) => d.id === selectedTrip.driverId)
    : null;

  const statusSteps: Array<{ key: TripStatus; label: string }> = [
    { key: 'DRIVER_ASSIGNED', label: 'Driver Confirmed' },
    { key: 'AT_PICKUP', label: 'Arrived at Pickup' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: TripStatus) => {
    switch (status) {
      case 'SEARCHING':
        return 0;
      case 'DRIVER_ASSIGNED':
      case 'ARRIVING_PICKUP':
        return 1;
      case 'AT_PICKUP':
        return 2;
      case 'IN_TRANSIT':
      case 'ARRIVED_DESTINATION':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = selectedTrip ? getStepIndex(selectedTrip.status) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold">Live Consignment Tracking</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time driver location and delivery telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Trip ID (e.g. trip_blr_1001) or Phone"
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Quick chip selector for existing demo trips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-medium whitespace-nowrap">Recent Trips:</span>
            {trips.slice(0, 3).map((t) => (
              <button
                key={t.id}
                onClick={() => setSearchQuery(t.id)}
                className={`px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all whitespace-nowrap ${
                  selectedTrip?.id === t.id
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.bookingCode}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        {selectedTrip ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Side: Map and Progress */}
            <div className="lg:col-span-7 p-5 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200">
              {/* Map Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-64 sm:h-72">
                <LeafletMap
                  pickup={selectedTrip.pickup}
                  drop={selectedTrip.drop}
                  driver={
                    selectedTrip.driverLocation
                      ? { ...selectedTrip.driverLocation, vehicleCategory: selectedTrip.vehicleCategory }
                      : matchedDriver
                      ? { ...matchedDriver.currentLocation, vehicleCategory: selectedTrip.vehicleCategory }
                      : null
                  }
                  className="w-full h-full"
                />

                {/* Overlaid Status Banner */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {selectedTrip.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-3">
                  <span>Shipment Journey</span>
                  <span className="text-blue-600 font-semibold">{selectedTrip.distanceKm} km • ~{selectedTrip.durationMins} mins</span>
                </div>

                <div className="grid grid-cols-4 gap-2 relative">
                  {statusSteps.map((step, idx) => {
                    const isPassed = currentStep >= idx + 1;
                    const isCurrent = currentStep === idx + 1;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                            isPassed
                              ? 'bg-blue-600 text-white shadow-sm'
                              : isCurrent
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] leading-tight font-medium ${
                            isPassed || isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Simulator Action Banner */}
              {onOpenSimulator && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Want to simulate driver acceptance?</div>
                      <div className="text-[11px] text-slate-600">Open in Driver App or Dual Sim to accept and complete this trip!</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSimulator('driver');
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>Driver App</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSimulator('dual');
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Dual Sim
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Trip Details, OTPs, Driver Card */}
            <div className="lg:col-span-5 p-5 flex flex-col space-y-4 justify-between bg-white">
              <div className="space-y-4">
                {/* Trip ID & OTP Handshake */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tracking ID</span>
                    <div className="text-sm font-black font-mono text-slate-900">{selectedTrip.bookingCode}</div>
                  </div>

                  {/* Dual OTPs */}
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-emerald-300 px-2.5 py-1 rounded-xl text-center shadow-xs">
                      <span className="text-[9px] text-emerald-700 font-bold block uppercase">Pickup OTP</span>
                      <span className="text-xs font-black font-mono text-emerald-800 tracking-wider">
                        {selectedTrip.shipment.pickupOtp || '4920'}
                      </span>
                    </div>

                    <div className="bg-white border border-blue-300 px-2.5 py-1 rounded-xl text-center shadow-xs">
                      <span className="text-[9px] text-blue-700 font-bold block uppercase">Drop OTP</span>
                      <span className="text-xs font-black font-mono text-blue-800 tracking-wider">
                        {selectedTrip.shipment.deliveryOtp || '8392'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Partner Profile */}
                {matchedDriver ? (
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-base">
                        {matchedDriver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-sm text-white">{matchedDriver.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{matchedDriver.vehicleNumber}</div>
                        <div className="text-[10px] text-amber-400 flex items-center space-x-1">
                          <span>★ {matchedDriver.rating.toFixed(1)}</span>
                          <span className="text-slate-500">• {matchedDriver.totalTrips} trips</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${matchedDriver.phone}`}
                      className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow transition-colors"
                      title="Call Driver"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 animate-spin" />
                    <span>Matching nearest driver partner in your pickup area...</span>
                  </div>
                )}

                {/* Route Points */}
                <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {/* Pickup */}
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      P
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{selectedTrip.pickup.address}</p>
                      <p className="text-[11px] text-slate-500">{selectedTrip.pickup.area}</p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-300 ml-2.5 h-3" />

                  {/* Drop */}
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-500 text-rose-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      D
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Drop Location</span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{selectedTrip.drop.address}</p>
                      <p className="text-[11px] text-slate-500">{selectedTrip.drop.area}</p>
                    </div>
                  </div>
                </div>

                {/* Shipment & Fare Summary */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cargo Type:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{selectedTrip.shipment.goodsCategory}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Vehicle Class:</span>
                    <span className="font-semibold text-slate-900 uppercase">{selectedTrip.vehicleCategory.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Status:</span>
                    <span className="font-bold text-emerald-600">{selectedTrip.paymentStatus} ({selectedTrip.paymentMethod.replace('_', ' ')})</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Total Fare (incl. GST):</span>
                    <span className="text-blue-600 font-extrabold text-base">₹{selectedTrip.fare.totalFare}</span>
                  </div>
                </div>
              </div>

              {/* Close / Done */}
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
              >
                Close Tracking Window
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No Trip Found</div>
            <p className="text-xs">Please verify your Tracking ID or choose from recent trips above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
