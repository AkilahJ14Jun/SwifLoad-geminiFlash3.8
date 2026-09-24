'use client';

import React from 'react';
import {
  CheckCircle2,
  X,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Columns,
  Share2,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  onOpenTracking: (tripId: string) => void;
  onOpenSimulator: (mode: 'customer' | 'driver' | 'admin' | 'dual') => void;
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  tripId,
  onOpenTracking,
  onOpenSimulator,
}: BookingSuccessModalProps) {
  const { trips } = useLogistics();

  if (!isOpen || !tripId) return null;

  const trip = trips.find((t) => t.id === tripId) || trips[0];
  if (!trip) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-tight">Booking Confirmed!</h3>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Your goods transport dispatch has been broadcasted to verified drivers
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4 text-xs">
          {/* Booking Code & OTP */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Booking ID</span>
              <span className="text-xs font-mono font-black text-slate-900">{trip.bookingCode}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Pickup OTP</span>
              <span className="text-sm font-mono font-black text-emerald-900 tracking-wider">
                {trip.shipment.pickupOtp}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">Drop OTP</span>
              <span className="text-sm font-mono font-black text-blue-900 tracking-wider">
                {trip.shipment.deliveryOtp}
              </span>
            </div>
          </div>

          {/* Route Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">FROM</span>
                <p className="font-semibold text-slate-800 text-xs leading-snug">{trip.pickup.address}</p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-slate-300 ml-1 h-2" />
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">TO</span>
                <p className="font-semibold text-slate-800 text-xs leading-snug">{trip.drop.address}</p>
              </div>
            </div>
          </div>

          {/* Fare and Vehicle Info */}
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-700" />
              <span className="font-semibold text-slate-800 uppercase">{trip.vehicleCategory.replace('_', ' ')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Total Payable:</span>
              <span className="text-sm font-black text-blue-700">₹{trip.fare.totalFare}</span>
            </div>
          </div>

          {/* Dual/Driver Simulator Callout */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Developer & Product Demo Test</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Test end-to-end trip fulfilment by switching to the Driver App to accept and navigate this dispatch.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSimulator('driver');
                }}
                className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition-colors"
              >
                <span>Accept in Driver App</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSimulator('dual');
                }}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition-colors"
              >
                <Columns className="w-3 h-3" />
                <span>Dual Live Sim</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onClose();
              onOpenTracking(trip.id);
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-colors"
          >
            <span>Track Live Shipment On Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
