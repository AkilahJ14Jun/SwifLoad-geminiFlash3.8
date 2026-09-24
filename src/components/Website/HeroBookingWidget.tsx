'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Bike,
  Package,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  ArrowRight,
  Calendar,
  Sparkles,
  User,
  Phone,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory, GoodsCategory, LocationPoint, PaymentMethod } from '@/types/logistics';
import { calculateDistanceKm, calculateFare, estimateDurationMins } from '@/lib/pricing';

interface HeroBookingWidgetProps {
  onBookingSuccess: (tripId: string) => void;
  onOpenTracking: (tripId?: string) => void;
  onOpenProhibited: () => void;
}

export default function HeroBookingWidget({
  onBookingSuccess,
  onOpenTracking,
  onOpenProhibited,
}: HeroBookingWidgetProps) {
  const {
    landmarks,
    vehicleConfigs,
    serviceZones,
    createBooking,
    currentCustomer,
    showToast,
  } = useLogistics();

  // Tab: 'trucks' | '2wheeler' | 'packers' | 'track'
  const [activeTab, setActiveTab] = useState<'trucks' | '2wheeler' | 'packers' | 'track'>('trucks');

  // Selected City
  const [selectedCity, setSelectedCity] = useState('Bengaluru');

  // Locations (Default Koramangala -> Indiranagar)
  const [pickupIndex, setPickupIndex] = useState<number>(2); // Koramangala
  const [dropIndex, setDropIndex] = useState<number>(1); // Indiranagar
  const [customPickupText, setCustomPickupText] = useState('');
  const [customDropText, setCustomDropText] = useState('');

  // Vehicle Selection
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<VehicleCategory>('tata_ace');

  // Shipment config
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategory>('Furniture & Home Decor');
  const [hasHelper, setHasHelper] = useState<boolean>(true);
  const [recipientName, setRecipientName] = useState('Rajesh Kumar');
  const [recipientPhone, setRecipientPhone] = useState('+91 98450 12345');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI_GPAY');
  const [trackingSearchInput, setTrackingSearchInput] = useState('');

  // Packers & Movers specific state
  const [shiftingSize, setShiftingSize] = useState<'1bhk' | '2bhk' | '3bhk' | 'few_items'>('1bhk');
  const [shiftingDate, setShiftingDate] = useState('2026-09-24');
  const [shiftingFloor, setShiftingFloor] = useState<'elevator' | 'stairs'>('elevator');

  // Resolved pickup and drop points
  const pickupPoint: LocationPoint = useMemo(() => {
    if (landmarks[pickupIndex]) return landmarks[pickupIndex];
    return landmarks[0];
  }, [landmarks, pickupIndex]);

  const dropPoint: LocationPoint = useMemo(() => {
    if (landmarks[dropIndex]) return landmarks[dropIndex];
    return landmarks[1];
  }, [landmarks, dropIndex]);

  // Dynamic distance & duration
  const distanceKm = useMemo(() => {
    return calculateDistanceKm(
      { lat: pickupPoint.lat, lng: pickupPoint.lng },
      { lat: dropPoint.lat, lng: dropPoint.lng }
    );
  }, [pickupPoint, dropPoint]);

  const durationMins = useMemo(() => {
    return estimateDurationMins(distanceKm);
  }, [distanceKm]);

  // Live fare breakdown
  const activeVehicleType = activeTab === '2wheeler' ? '2wheeler' : selectedVehicleCategory;
  const fareBreakdown = useMemo(() => {
    return calculateFare(
      activeVehicleType,
      distanceKm,
      activeTab === 'trucks' || activeTab === 'packers' ? hasHelper : false,
      vehicleConfigs,
      serviceZones,
      pickupPoint,
      dropPoint
    );
  }, [activeVehicleType, distanceKm, hasHelper, activeTab, vehicleConfigs, serviceZones, pickupPoint, dropPoint]);

  // Packers & movers calculated fare
  const packersCalculatedFare = useMemo(() => {
    let multiplier = 1.0;
    if (shiftingSize === 'few_items') multiplier = 1.2;
    if (shiftingSize === '1bhk') multiplier = 2.4;
    if (shiftingSize === '2bhk') multiplier = 3.8;
    if (shiftingSize === '3bhk') multiplier = 5.2;
    const baseTruckFare = fareBreakdown.totalFare;
    const floorSurcharge = shiftingFloor === 'stairs' ? 500 : 0;
    const packingMaterials = 850;
    return Math.round(baseTruckFare * multiplier + floorSurcharge + packingMaterials);
  }, [shiftingSize, fareBreakdown, shiftingFloor]);

  // Handle instant booking submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pickupIndex === dropIndex) {
      showToast('Pickup and drop locations must be different');
      return;
    }

    try {
      const chosenCategory = activeTab === '2wheeler' ? '2wheeler' : selectedVehicleCategory;
      const approxWeight =
        chosenCategory === '2wheeler'
          ? 15
          : chosenCategory === '3wheeler'
          ? 350
          : chosenCategory === 'tata_ace'
          ? 750
          : 1400;

      const newTripId = createBooking({
        pickup: pickupPoint,
        drop: dropPoint,
        vehicleCategory: chosenCategory,
        goodsCategory,
        approxWeightKg: approxWeight,
        hasHelperRequired: activeTab === 'trucks' || activeTab === 'packers' ? hasHelper : false,
        paymentMethod,
        customerName: currentCustomer.name,
        customerPhone: currentCustomer.phone,
        notes:
          activeTab === 'packers'
            ? `Packers & Movers (${shiftingSize.toUpperCase()}), Floor: ${shiftingFloor}`
            : 'Standard on-demand city dispatch',
      });

      onBookingSuccess(newTripId);
    } catch (err: any) {
      showToast(err.message || 'Error placing booking');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden relative">
      {/* City Badge & Policy Bar */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Service Hub:</span>
          <div className="inline-flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-bold text-white">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{selectedCity} (Full Intra-City Coverage)</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-300">
          <button
            type="button"
            onClick={onOpenProhibited}
            className="text-slate-400 hover:text-white underline decoration-slate-600 transition-colors"
          >
            Prohibited Items Policy
          </button>
          <span className="hidden sm:inline text-emerald-400 font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            Zero Surge Guarantee in Central Zone
          </span>
        </div>
      </div>

      {/* Tabs Row (Porter Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-100/90 border-b border-slate-200 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('trucks');
            if (selectedVehicleCategory === '2wheeler') setSelectedVehicleCategory('tata_ace');
          }}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
            activeTab === 'trucks'
              ? 'bg-white text-blue-700 shadow-md shadow-slate-300/50 border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>City Trucks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('2wheeler');
            setSelectedVehicleCategory('2wheeler');
          }}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
            activeTab === '2wheeler'
              ? 'bg-white text-blue-700 shadow-md shadow-slate-300/50 border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>2-Wheeler (Express)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('packers');
            setSelectedVehicleCategory('tata_ace');
          }}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
            activeTab === 'packers'
              ? 'bg-white text-blue-700 shadow-md shadow-slate-300/50 border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Packers & Movers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
            activeTab === 'track'
              ? 'bg-white text-blue-700 shadow-md shadow-slate-300/50 border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Order</span>
        </button>
      </div>

      {/* Tab 4: Track Order Panel */}
      {activeTab === 'track' ? (
        <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <Search className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Track Your Consignment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Booking ID or customer phone number to see live driver GPS telemetry and OTP codes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackingSearchInput}
                onChange={(e) => setTrackingSearchInput(e.target.value)}
                placeholder="e.g. trip_blr_1001 or +91 98801 99234"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <button
              onClick={() => onOpenTracking(trackingSearchInput || undefined)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-colors whitespace-nowrap"
            >
              Track Live
            </button>
          </div>

          <div className="pt-2 text-slate-400 text-[11px] flex items-center justify-center space-x-2">
            <span>Demo Booking Codes:</span>
            <button
              onClick={() => onOpenTracking('trip_blr_1001')}
              className="text-blue-600 font-mono font-bold hover:underline"
            >
              TRIP-1001
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenTracking('trip_blr_1002')}
              className="text-blue-600 font-mono font-bold hover:underline"
            >
              TRIP-1002
            </button>
          </div>
        </div>
      ) : (
        /* Booking Flow (Trucks / 2-Wheeler / Packers) */
        <form onSubmit={handleBookingSubmit} className="p-6 md:p-8 space-y-6">
          {/* Pickup & Drop Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Pick-up Landmark (Bengaluru)</span>
              </label>
              <select
                value={pickupIndex}
                onChange={(e) => setPickupIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {landmarks.map((l, idx) => (
                  <option key={idx} value={idx}>
                    {l.area} — {l.address}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 truncate">
                📍 {pickupPoint.landmark || pickupPoint.address}
              </p>
            </div>

            {/* Drop */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Drop Landmark (Bengaluru)</span>
              </label>
              <select
                value={dropIndex}
                onChange={(e) => setDropIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {landmarks.map((l, idx) => (
                  <option key={idx} value={idx}>
                    {l.area} — {l.address}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 truncate">
                🎯 {dropPoint.landmark || dropPoint.address}
              </p>
            </div>
          </div>

          {/* Route Distance Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs">
            <div className="flex items-center space-x-2 text-blue-900 font-semibold">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Calculated Route: <strong>{distanceKm} km</strong> • Approx. <strong>{durationMins} mins</strong> in urban traffic
              </span>
            </div>
            <span className="text-[11px] text-blue-700 font-mono hidden sm:inline">
              Bengaluru Tortuosity Factor 1.32x
            </span>
          </div>

          {/* Packers & Movers options (Only when activeTab === 'packers') */}
          {activeTab === 'packers' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Select Shifting Size:</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Includes 3-layer bubble packaging</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'few_items', label: 'Few Items', desc: 'Boxes / Mattress' },
                  { key: '1bhk', label: '1 BHK Complete', desc: 'Standard Mini-Move' },
                  { key: '2bhk', label: '2 BHK Home', desc: 'Full Household' },
                  { key: '3bhk', label: '3 BHK / Villa', desc: 'Heavy Furniture' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setShiftingSize(item.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      shiftingSize === item.key
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Floor & Elevator:</label>
                  <select
                    value={shiftingFloor}
                    onChange={(e) => setShiftingFloor(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="elevator">Elevator Available at Both Ends</option>
                    <option value="stairs">Stairs Only (Manual Carry +₹500)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Preferred Moving Date:</label>
                  <input
                    type="date"
                    value={shiftingDate}
                    onChange={(e) => setShiftingDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Category Selector (Trucks & 2-Wheeler) */}
          {activeTab !== 'packers' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Choose Vehicle Category</span>
                <span className="text-[11px] text-slate-500 font-normal">All rates include 5% GST & Fuel</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeTab === 'trucks' ? (
                  <>
                    {/* 3-Wheeler */}
                    <div
                      onClick={() => setSelectedVehicleCategory('3wheeler')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedVehicleCategory === '3wheeler'
                          ? 'border-blue-600 bg-blue-50/70 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">3-Wheeler Cargo</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          500 kg
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">5 x 4 x 4 ft • Retail crates & boxes</p>
                      <div className="text-xs font-black text-blue-700">
                        ₹
                        {calculateFare(
                          '3wheeler',
                          distanceKm,
                          hasHelper,
                          vehicleConfigs,
                          serviceZones,
                          pickupPoint,
                          dropPoint
                        ).totalFare}
                      </div>
                    </div>

                    {/* Tata Ace */}
                    <div
                      onClick={() => setSelectedVehicleCategory('tata_ace')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        selectedVehicleCategory === 'tata_ace'
                          ? 'border-blue-600 bg-blue-50/70 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        POPULAR
                      </span>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">Tata Ace</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          1000 kg
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">7 x 4.5 x 5 ft • Furniture & freight</p>
                      <div className="text-xs font-black text-blue-700">
                        ₹
                        {calculateFare(
                          'tata_ace',
                          distanceKm,
                          hasHelper,
                          vehicleConfigs,
                          serviceZones,
                          pickupPoint,
                          dropPoint
                        ).totalFare}
                      </div>
                    </div>

                    {/* 8ft Pickup */}
                    <div
                      onClick={() => setSelectedVehicleCategory('pickup_8ft')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedVehicleCategory === 'pickup_8ft'
                          ? 'border-blue-600 bg-blue-50/70 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">8ft Pickup (Bolero)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          1700 kg
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">8.5 x 5 ft • Heavy machinery & loads</p>
                      <div className="text-xs font-black text-blue-700">
                        ₹
                        {calculateFare(
                          'pickup_8ft',
                          distanceKm,
                          hasHelper,
                          vehicleConfigs,
                          serviceZones,
                          pickupPoint,
                          dropPoint
                        ).totalFare}
                      </div>
                    </div>
                  </>
                ) : (
                  /* 2-Wheeler option */
                  <div className="col-span-3 p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/70 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">2-Wheeler Express Parcel</div>
                        <p className="text-[11px] text-slate-500">Max 20kg • Couriers, documents, electronics & small parcels</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Instant Dispatch Fare</span>
                      <span className="text-base font-black text-blue-700">₹{fareBreakdown.totalFare}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cargo Type & Helper Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Cargo / Goods Category</label>
              <select
                value={goodsCategory}
                onChange={(e) => setGoodsCategory(e.target.value as GoodsCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Furniture & Home Decor">Furniture & Home Decor</option>
                <option value="Electronics & Appliances">Electronics & Appliances</option>
                <option value="Hardware & Building Materials">Hardware & Building Materials</option>
                <option value="Groceries & Perishables">Groceries & Perishables</option>
                <option value="Textiles & Garments">Textiles & Garments</option>
                <option value="Industrial Equipment">Industrial Equipment</option>
                <option value="Documents & Small Parcels">Documents & Small Parcels</option>
                <option value="Other Goods">Other Commercial Goods</option>
              </select>
            </div>

            {/* Helper Toggle (for trucks/packers) */}
            {activeTab !== '2wheeler' ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-800">Add Helper For Loading Assistance</div>
                  <div className="text-[10px] text-slate-500">Trained personnel for loading & unloading (+₹250)</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHelper}
                    onChange={(e) => setHasHelper(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 text-xs text-slate-600">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>2-Wheeler delivery rider carries items directly up to your doorstep (up to 20kg).</span>
              </div>
            )}
          </div>

          {/* Fare Summary & CTA Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Total Guaranteed Fare (incl. GST)
              </div>
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>₹{activeTab === 'packers' ? packersCalculatedFare : fareBreakdown.totalFare}</span>
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({fareBreakdown.baseFare} base + ₹{fareBreakdown.distanceFare} dist
                  {hasHelper && activeTab !== '2wheeler' ? ' + ₹250 helper' : ''})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-medium px-3 py-3 rounded-xl focus:outline-none"
              >
                <option value="UPI_GPAY">UPI (GPay / PhonePe)</option>
                <option value="NETBANKING_IMPS">Netbanking IMPS</option>
                <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              </select>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Book Now & Dispatch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
