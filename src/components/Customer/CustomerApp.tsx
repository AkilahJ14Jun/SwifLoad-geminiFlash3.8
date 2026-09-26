'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Truck,
  Bike,
  CarFront,
  Container,
  Navigation,
  Clock,
  ShieldCheck,
  CreditCard,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  Calendar,
  X,
  FileText,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Wallet,
  Gift,
  Share2,
  Copy,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Check,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory, GoodsCategory, PaymentMethod, LocationPoint, CustomerType } from '@/types/logistics';
import { calculateDistanceKm, calculateCustomerQuotedSlabFare, estimateDurationMins } from '@/lib/pricing';

// Dynamic import of Leaflet map to prevent SSR window reference error
const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

export default function CustomerApp() {
  const {
    trips,
    drivers,
    activeTripId,
    setActiveTripId,
    vehicleConfigs,
    landmarks,
    serviceZones,
    createBooking,
    cancelTrip,
    submitRating,
    showToast,
    currentCustomer,
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    customerSlabConfigs,
    referralConfig,
    referrals,
    applyCustomerReferralCode,
    topUpCustomerWallet,
    updateCustomerType,
  } = useLogistics();

  // Active sub-tab in Customer App: 'book' | 'tracking' | 'history' | 'wallet' | 'referrals' | 'profile' | 'support'
  const [activeTab, setActiveTab] = useState<'book' | 'tracking' | 'history' | 'wallet' | 'referrals' | 'profile' | 'support'>('book');

  // Referral and Wallet UI States
  const [referralInputCode, setReferralInputCode] = useState<string>('');
  const [referralCopied, setReferralCopied] = useState<boolean>(false);
  const [showWalletTopupModal, setShowWalletTopupModal] = useState<boolean>(false);
  const [walletTopupAmount, setWalletTopupAmount] = useState<number>(500);
  const [showSlabBreakdownDetails, setShowSlabBreakdownDetails] = useState<boolean>(false);

  // Customer Auth / Registration Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regCompany, setRegCompany] = useState<string>('');
  const [authOtp, setAuthOtp] = useState<string>('1234');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // Booking Flow States
  const [pickupPoint, setPickupPoint] = useState<LocationPoint>(landmarks[2] || landmarks[0]); // Peelamedu
  const [dropPoint, setDropPoint] = useState<LocationPoint>(landmarks[0] || landmarks[1]); // Gandhipuram
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('tata_ace');
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategory>('Industrial Equipment');
  const [weightKg, setWeightKg] = useState<number>(180);
  const [hasHelper, setHasHelper] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Machined engineering components, handle carefully');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI_GPAY');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduleTime, setScheduleTime] = useState<string>('Tomorrow, 10:00 AM');
  const [senderName, setSenderName] = useState<string>(currentCustomer?.name || 'Kavitha Sundaram');
  const [senderPhone, setSenderPhone] = useState<string>(currentCustomer?.phone || '+91 98422 19283');
  const [receiverName, setReceiverName] = useState<string>('Venkatesh Babu');
  const [receiverPhone, setReceiverPhone] = useState<string>('+91 98422 88712');
  const [showShipmentModal, setShowShipmentModal] = useState<boolean>(false);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Driver taking too long');

  // Call Driver Modal
  const [showCallModal, setShowCallModal] = useState<boolean>(false);

  // Rating Modal
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [hasRated, setHasRated] = useState<boolean>(false);

  // Invoice Modal
  const [viewInvoiceTripId, setViewInvoiceTripId] = useState<string | null>(null);

  // Distance and slab pricing calculation
  const distanceKm = calculateDistanceKm(pickupPoint, dropPoint);
  const durationMins = estimateDurationMins(distanceKm);
  const custType: CustomerType = currentCustomer?.customerType || 'regular';

  // Quoted based on farthest driver in closest range to prevent surprise fare jumps
  const fareBreakdown = calculateCustomerQuotedSlabFare(
    distanceKm,
    custType,
    pickupPoint,
    dropPoint,
    drivers,
    customerSlabConfigs,
    hasHelper,
    selectedVehicle,
    vehicleConfigs,
    serviceZones
  );

  // Active Trip
  const currentTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleBookNow = () => {
    const newTripId = createBooking({
      pickup: {
        ...pickupPoint,
        senderOrReceiverName: senderName,
        contactPhone: senderPhone,
      },
      drop: {
        ...dropPoint,
        senderOrReceiverName: receiverName,
        contactPhone: receiverPhone,
      },
      vehicleCategory: selectedVehicle,
      goodsCategory,
      approxWeightKg: Number(weightKg) || 50,
      hasHelperRequired: hasHelper,
      notes,
      paymentMethod,
      customerType: custType,
      scheduledTime: isScheduled ? scheduleTime : 'Instant Now',
      customerName: senderName,
      customerPhone: senderPhone,
    });
    if (newTripId) {
      setActiveTab('tracking');
    }
  };

  const getVehicleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike':
        return <Bike className="w-6 h-6 text-emerald-600" />;
      case 'CarFront':
        return <CarFront className="w-6 h-6 text-emerald-600" />;
      case 'Container':
        return <Container className="w-6 h-6 text-emerald-600" />;
      default:
        return <Truck className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 pb-20 md:pb-6">
      {/* Top Customer Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-inner">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight">SwifLoad Coimbatore</h1>
            <p className="text-[11px] text-emerald-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Intra-City On-Demand Express Freight • Tamil Nadu</span>
            </p>
          </div>
        </div>

        {/* Profile / Wallet / Referrals / Support Shortcut */}
        <div className="flex items-center space-x-2">
          {/* Quick Wallet Balance Badge */}
          <button
            onClick={() => setActiveTab('wallet')}
            className="px-2.5 py-1 text-xs bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg flex items-center space-x-1.5 transition-all border border-white/20"
            title="Customer Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-300" />
            <span>₹{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className="px-2.5 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 font-bold rounded-lg flex items-center space-x-1 border border-emerald-400/30 transition-all"
            title="Refer & Earn Rewards"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Refer & Earn</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            className="px-2.5 py-1 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1 transition-all shadow"
            title="Register new customer profile"
          >
            <span>+ Customer</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className="px-2.5 py-1 text-xs bg-emerald-800/60 hover:bg-emerald-800 rounded-lg flex items-center space-x-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on sub-tab */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4">
        {/* ================= TAB 1: BOOKING VIEW ================= */}
        {activeTab === 'book' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Customer Tier / Category Selector */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer Category / Pricing Tier
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                  Active Tier: {custType === 'new' ? 'NEW USER' : custType === 'regular' ? 'REGULAR' : custType === 'multi_pickup' ? 'MULTI-PICKUP' : 'CORPORATE B2B'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'regular', top: 'Regular', bottom: '', icon: '👤', title: 'Regular Customer' },
                  { type: 'new', top: 'New', bottom: 'User', icon: '✨', title: 'New User / Welcome Slabs' },
                  { type: 'multi_pickup', top: 'Multi', bottom: 'Pickup', icon: '📍', title: 'Multi-Pickup Location' },
                  { type: 'corporate', top: 'Corporate', bottom: 'B2B', icon: '🏢', title: 'Corporate B2B Customer' },
                ].map((tier) => {
                  const isSelected = custType === tier.type;
                  return (
                    <button
                      key={tier.type}
                      type="button"
                      title={tier.title}
                      onClick={() => updateCustomerType(tier.type as CustomerType)}
                      className={`group p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between h-full min-h-[82px] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {/* Top portion displayed on top of the icon */}
                      <span
                        className={`text-xs font-bold leading-tight block ${
                          isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'
                        }`}
                      >
                        {tier.top}
                      </span>

                      {/* Respective Icon in the center */}
                      <span
                        className={`w-7 h-7 my-1 rounded-lg flex items-center justify-center text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 shadow-2xs group-hover:border-slate-300'
                        }`}
                      >
                        {tier.icon}
                      </span>

                      {/* Bottom portion displayed below the icon when lengthy */}
                      {tier.bottom ? (
                        <span
                          className={`text-[10px] font-bold leading-tight block ${
                            isSelected ? 'text-emerald-800 font-extrabold' : 'text-slate-600'
                          }`}
                        >
                          {tier.bottom}
                        </span>
                      ) : (
                        <span className="text-[10px] leading-tight block invisible select-none" aria-hidden="true">
                          &nbsp;
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Preview */}
            <div className="relative">
              <LeafletMap
                pickup={{ lat: pickupPoint.lat, lng: pickupPoint.lng, label: 'Pickup' }}
                drop={{ lat: dropPoint.lat, lng: dropPoint.lng, label: 'Drop' }}
                className="h-48 md:h-56 w-full rounded-2xl shadow-sm border border-slate-200"
              />
              <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200 flex items-center space-x-1">
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>{distanceKm} km • ~{durationMins} mins</span>
              </div>
            </div>

            {/* Address Selection Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Route Details</span>
                <button
                  onClick={() => {
                    const temp = pickupPoint;
                    setPickupPoint(dropPoint);
                    setDropPoint(temp);
                  }}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Swap Locations</span>
                </button>
              </div>

              {/* Pickup selector */}
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  <div className="w-0.5 h-8 bg-slate-200 my-0.5" />
                  <div className="w-3 h-3 rounded-full bg-rose-600 ring-4 ring-rose-100" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pickup Location</label>
                    <select
                      value={pickupPoint.address}
                      onChange={(e) => {
                        const found = landmarks.find((l) => l.address === e.target.value);
                        if (found) setPickupPoint(found);
                      }}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {landmarks.map((l, i) => (
                        <option key={i} value={l.address}>
                          {l.area}: {l.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drop selector */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Drop Location</label>
                    <select
                      value={dropPoint.address}
                      onChange={(e) => {
                        const found = landmarks.find((l) => l.address === e.target.value);
                        if (found) setDropPoint(found);
                      }}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {landmarks.map((l, i) => (
                        <option key={i} value={l.address}>
                          {l.area}: {l.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selection with Slab Rates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Vehicle Category</span>
                <span className="text-[11px] text-emerald-600 font-medium">Distance slab pricing active</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {vehicleConfigs.map((veh) => {
                  const isSel = selectedVehicle === veh.id;
                  const estimate = calculateCustomerQuotedSlabFare(
                    distanceKm,
                    custType,
                    pickupPoint,
                    dropPoint,
                    drivers,
                    customerSlabConfigs,
                    hasHelper,
                    veh.id,
                    vehicleConfigs,
                    serviceZones
                  );
                  return (
                    <button
                      key={veh.id}
                      onClick={() => setSelectedVehicle(veh.id)}
                      className={`text-left p-3 rounded-2xl border transition-all relative ${
                        isSel
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isSel && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                      <div className="flex items-center space-x-2 mb-1">
                        {getVehicleIcon(veh.icon)}
                        <span className="font-bold text-xs text-slate-900 leading-tight">{veh.name.split('(')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mb-1.5">Max {veh.capacityKg} kg • {veh.dimensions}</div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                        <span className="text-sm font-extrabold text-slate-900">₹{estimate.totalFare}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">ETA ~10m</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shipment & Helper Summary Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    📦
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Shipment & Loading Info</h3>
                    <p className="text-[11px] text-slate-500">{goodsCategory} • ~{weightKg} kg</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShipmentModal(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg"
                >
                  Edit Details
                </button>
              </div>

              {/* Helper Checkbox */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasHelper}
                    onChange={(e) => setHasHelper(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Need Loading & Unloading Helper</div>
                    <div className="text-[10px] text-slate-500">Driver/porter assist in moving cargo</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  +₹{vehicleConfigs.find((v) => v.id === selectedVehicle)?.helperFee || 0}
                </span>
              </label>

              {/* Schedule Booking Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">Schedule for later?</span>
                </div>
                <button
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    isScheduled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isScheduled ? scheduleTime : 'Dispatch Now'}
                </button>
              </div>
            </div>

            {/* Payment Mode Selector with Wallet Option */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Option</span>
                <span className="text-[10px] text-slate-500 font-medium">Customer Wallet Balance: ₹{currentCustomer?.wallet?.balance || 0}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'WALLET',
                    name: 'SwifLoad Wallet',
                    icon: '👛',
                    sub: `Bal: ₹${currentCustomer?.wallet?.balance || 0}`,
                  },
                  { id: 'UPI_GPAY', name: 'GPay / UPI', icon: '⚡', sub: 'Instant UPI' },
                  { id: 'NETBANKING_IMPS', name: 'IMPS Bank', icon: '🏛', sub: 'Direct transfer' },
                  { id: 'CASH_ON_DELIVERY', name: 'Cash on Drop', icon: '💵', sub: 'Pay driver cash' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentMethod === pm.id
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="text-base">{pm.icon}</div>
                    <div className="text-xs font-bold mt-0.5">{pm.name}</div>
                    <div className="text-[9px] text-slate-500 truncate">{pm.sub}</div>
                  </button>
                ))}
              </div>

              {/* Insufficient Wallet Warning */}
              {paymentMethod === 'WALLET' && (currentCustomer?.wallet?.balance || 0) < fareBreakdown.totalFare && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="text-rose-700">
                    <span className="font-bold">Insufficient Wallet Balance: </span>
                    You have ₹{currentCustomer?.wallet?.balance || 0}, required is ₹{fareBreakdown.totalFare}.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletTopupAmount(Math.max(100, fareBreakdown.totalFare - (currentCustomer?.wallet?.balance || 0)));
                      setShowWalletTopupModal(true);
                    }}
                    className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shrink-0 text-[11px]"
                  >
                    Top Up
                  </button>
                </div>
              )}
            </div>

            {/* Fare Breakdown & Book Action with Distance Slabs Math */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg space-y-3">
              {/* Distance Slab Notice Banner */}
              <div className="p-3 rounded-xl bg-slate-800/90 border border-amber-500/40 text-xs text-amber-200 leading-relaxed flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Transparent Distance Pricing Notice: </span>
                  {fareBreakdown.pricingNotice}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">Base Fare (0 to 1 km flat minimum price)</span>
                <span>₹{fareBreakdown.baseFare}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="text-slate-400">Distance Slab Charges</span>
                  <div className="text-[10px] text-slate-500">
                    {distanceKm} km trip + {fareBreakdown.farthestDriverDistanceKm} km range buffer = {fareBreakdown.totalSlabDistanceKm} km total
                  </div>
                </div>
                <span>₹{fareBreakdown.distanceFare}</span>
              </div>

              {/* Toggle to inspect exact slab math */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSlabBreakdownDetails(!showSlabBreakdownDetails)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                >
                  <Info className="w-3 h-3" />
                  <span>{showSlabBreakdownDetails ? 'Hide Distance Slab Details' : 'View Configured Slab Math Breakdown'}</span>
                </button>
                {showSlabBreakdownDetails && (
                  <div className="mt-2 space-y-1 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-[10px]">
                    <div className="font-bold text-slate-400 border-b border-slate-700 pb-1 mb-1">
                      Tier: {custType.replace(/_/g, ' ').toUpperCase()} Distance Slabs Applied:
                    </div>
                    {fareBreakdown.slabBreakdown?.map((slab, i) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span>
                          {slab.slabLabel}: {slab.kmInSlab} km @ ₹{slab.rate}
                          {slab.rateType === 'per_km' ? '/km' : ' flat min'}
                        </span>
                        <span className="font-mono font-bold text-emerald-400">₹{slab.cost}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasHelper && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                  <span className="text-slate-400">Loading / Unloading Helper</span>
                  <span>₹{fareBreakdown.helperFee}</span>
                </div>
              )}
              {fareBreakdown.surgeFare > 0 && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-amber-400">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Zone Surge Demand</span>
                  </span>
                  <span>+₹{fareBreakdown.surgeFare}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400">GST (5% Logistics)</span>
                <span>₹{fareBreakdown.taxGst}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[11px] text-slate-400">Total Fare (Quoted & Guaranteed)</div>
                  <div className="text-2xl font-black text-emerald-400">₹{fareBreakdown.totalFare}</div>
                </div>
                <button
                  onClick={handleBookNow}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center space-x-2"
                >
                  <span>Book Goods Vehicle</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE TRIP TRACKING ================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Real-time Map with Driver position */}
            <div className="relative">
              <LeafletMap
                pickup={{ lat: currentTrip.pickup.lat, lng: currentTrip.pickup.lng, label: 'Pickup' }}
                drop={{ lat: currentTrip.drop.lat, lng: currentTrip.drop.lng, label: 'Drop' }}
                driver={
                  currentTrip.driverLocation && currentTrip.status !== 'SEARCHING'
                    ? {
                        lat: currentTrip.driverLocation.lat,
                        lng: currentTrip.driverLocation.lng,
                        label: `${currentTrip.driverName || 'Driver'} (Live)`,
                      }
                    : null
                }
                targetDestination={currentTrip.status === 'IN_TRANSIT' ? 'drop' : 'pickup'}
                className="h-64 w-full rounded-2xl shadow-sm border border-slate-200"
              />

              {/* Status Pill on Map */}
              <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${currentTrip.status === 'SEARCHING' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <span>{currentTrip.status.replace('_', ' ')}</span>
              </div>

              <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md">
                {currentTrip.bookingCode}
              </div>

              {/* Live ETA banner if driver assigned and on the way */}
              {currentTrip.driverLocation && currentTrip.status !== 'SEARCHING' && currentTrip.status !== 'DELIVERED' && (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-white px-3 py-2 rounded-xl text-xs flex items-center justify-between shadow-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 animate-bounce text-sm">🚚</span>
                    <div>
                      <span className="font-bold text-emerald-400">Live GPS Tracking: </span>
                      <span className="text-slate-200">
                        {currentTrip.status === 'ARRIVING_PICKUP'
                          ? `Driver en route to pickup (~${Math.max(1, Math.round(((calculateDistanceKm(currentTrip.driverLocation, currentTrip.pickup)) / 25) * 60))} min • ${calculateDistanceKm(currentTrip.driverLocation, currentTrip.pickup)} km)`
                          : currentTrip.status === 'AT_PICKUP'
                          ? 'Driver has arrived at pickup point'
                          : `Cargo en route to drop (~${Math.max(1, Math.round(((calculateDistanceKm(currentTrip.driverLocation, currentTrip.drop)) / 30) * 60))} min)`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    Live Uber-Sync
                  </span>
                </div>
              )}
            </div>

            {/* Cascading Group Dispatch Status (Shown while SEARCHING before acceptance) */}
            {currentTrip.status === 'SEARCHING' ? (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900/40 border border-amber-500/30 rounded-2xl p-4.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm animate-spin">
                      ⏳
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Cascading Group Dispatch Active
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Nearest driver group offered first; cascades if unaccepted
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-extrabold text-amber-600 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                      {currentTrip.dispatchCountdownSecs ?? 15}s Left
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/60 dark:border-amber-900/60 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Current Offered Fleet Group:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {currentTrip.currentDispatchGroupName || 'Nearest Cluster'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Dispatch Cascade Stage:</span>
                    <span>
                      Zone {(currentTrip.currentDispatchGroupIndex ?? 0) + 1} of {(currentTrip.dispatchGroupSequence?.length ?? 5)} (Escalates to adjacent zone)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-900/40 p-2 rounded-lg">
                  <span className="text-xs">🔒</span>
                  <span>Driver partner identity and phone number will be revealed as soon as accepted.</span>
                </div>
              </div>
            ) : null}

            {/* OTP Security Verification Badge */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold">Secure Delivery OTPs</div>
                <div className="text-xs text-emerald-50 mt-0.5">Share with driver only at physical verification</div>
              </div>
              <div className="flex items-center space-x-3 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/30">
                  <div className="text-[10px] text-emerald-100 font-semibold">Pickup OTP</div>
                  <div className="text-lg font-black tracking-widest">{currentTrip.shipment.pickupOtp}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/30">
                  <div className="text-[10px] text-emerald-100 font-semibold">Drop OTP</div>
                  <div className="text-lg font-black tracking-widest">{currentTrip.shipment.deliveryOtp}</div>
                </div>
              </div>
            </div>

            {/* Driver Partner Details Card (Revealed only after acceptance) */}
            {currentTrip.driverName && currentTrip.status !== 'SEARCHING' ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Driver"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">{currentTrip.driverName}</h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-emerald-700 text-emerald-700" />
                          <span>{currentTrip.driverRating || 4.9}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{currentTrip.driverVehicleNumber}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{currentTrip.vehicleCategory.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Privacy Masked Call & WhatsApp (Unlocked after acceptance) */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCallModal(true)}
                      className="w-10 h-10 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shadow-sm"
                      title="Call Driver via Masked Number"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <a
                      href="https://wa.me/919845012345?text=Hello%20SwifLoad%20Partner%20regarding%20booking"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center transition-colors shadow-sm"
                      title="WhatsApp Chat"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Goods: {currentTrip.shipment.goodsCategory} (~{currentTrip.shipment.approxWeightKg}kg)</span>
                  <span className="font-bold text-slate-800">Fare: ₹{currentTrip.fare.totalFare}</span>
                </div>
              </div>
            ) : null}

            {/* Trip Status Milestones Timeline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Trip Progress</h4>
              <div className="space-y-3 text-xs">
                {[
                  { key: 'DRIVER_ASSIGNED', label: 'Driver Allocated & Confirmed' },
                  { key: 'ARRIVING_PICKUP', label: 'Driver En Route to Pickup Location' },
                  { key: 'AT_PICKUP', label: 'Driver Arrived at Pickup (Enter OTP)' },
                  { key: 'IN_TRANSIT', label: 'Cargo Loaded & On Way to Drop' },
                  { key: 'ARRIVED_DESTINATION', label: 'Reached Destination' },
                  { key: 'DELIVERED', label: 'Goods Safely Delivered' },
                ].map((step, idx) => {
                  const statuses = ['DRIVER_ASSIGNED', 'ARRIVING_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERED'];
                  const currentIndex = statuses.indexOf(currentTrip.status);
                  const stepIndex = statuses.indexOf(step.key);
                  const isDone = stepIndex <= currentIndex;
                  const isCurrent = step.key === currentTrip.status;

                  return (
                    <div key={idx} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`font-medium ${isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions: Cancel & Feedback */}
            <div className="flex items-center space-x-3">
              {currentTrip.status !== 'DELIVERED' && currentTrip.status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel Trip
                </button>
              )}
              {currentTrip.status === 'DELIVERED' && (
                <button
                  onClick={() => setViewInvoiceTripId(currentTrip.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>
              )}
            </div>

            {/* Rating Section if Delivered */}
            {currentTrip.status === 'DELIVERED' && !hasRated && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-900">How was your delivery experience?</h4>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingVal
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Leave a comment for driver..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full text-xs p-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => {
                    submitRating(currentTrip.id, ratingVal, feedbackText || 'Great service!');
                    setHasRated(true);
                  }}
                  className="text-xs bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Submit Rating
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: BOOKING HISTORY ================= */}
        {activeTab === 'history' && (
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-sm font-bold text-slate-800">Your Booking History</h2>
            {trips.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900">{tr.bookingCode}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tr.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tr.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tr.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{tr.fare.totalFare}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate">{tr.pickup.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                    <span className="truncate">{tr.drop.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(tr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveTripId(tr.id);
                        setActiveTab('tracking');
                      }}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      View Live
                    </button>
                    <button
                      onClick={() => setViewInvoiceTripId(tr.id)}
                      className="text-slate-600 font-semibold hover:underline"
                    >
                      Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 4: PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {currentCustomer && currentCustomer.isLoggedIn ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md">
                  {currentCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{currentCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{currentCustomer.phone} • {currentCustomer.email}</p>
                  {currentCustomer.companyName && (
                    <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                      🏢 {currentCustomer.companyName}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                  >
                    + Register New Customer
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Switch Account
                  </button>
                  <button
                    onClick={logoutCustomer}
                    className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
                  📦
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Welcome to SwifLoad Shipper Portal</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Register your business or personal account to book freight vehicles, track live GPS deliveries, and generate tax receipts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Register as New Customer
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                  >
                    Login with Mobile OTP
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Saved Business Addresses</h4>
              {landmarks.slice(0, 3).map((lm, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">{lm.area}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{lm.address}</div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">{i === 0 ? 'Home' : i === 1 ? 'Office' : 'Warehouse'}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Security & App Version</h4>
              <div className="flex items-center justify-between text-slate-600">
                <span>OTP Authentication</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Data Privacy & KYC</span>
                <span className="text-emerald-600 font-bold">Compliant</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>App Build</span>
                <span className="font-mono text-[11px]">v1.0.0-MVP (Coimbatore, Tamil Nadu)</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SUPPORT ================= */}
        {activeTab === 'support' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Customer Care & Dispute Resolution</h3>
              <p className="text-xs text-slate-600">
                Facing an issue with your trip, driver delay, or damaged goods? Our Coimbatore operations team is live 24/7.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="https://wa.me/919845012345?text=Hi%20SwifLoad%20Support,%20I%20need%20help%20with%20my%20order"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 flex flex-col items-center justify-center text-teal-800 font-bold text-xs text-center space-y-1"
                >
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <span>WhatsApp Support</span>
                </a>
                <a
                  href="tel:+918023456789"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 font-bold text-xs text-center space-y-1"
                >
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span>Call Operations Desk</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-700">Frequently Asked Questions</h4>
              <details className="p-2 bg-slate-50 rounded-lg">
                <summary className="font-semibold cursor-pointer text-slate-800">How is the fare calculated?</summary>
                <p className="mt-1 text-slate-600 text-[11px]">
                  Fares are calculated based on distance slab rates configured for your tier (0-1 km flat minimum price, 1-3 km and 3-5 km incremental rates), quoted on the farthest available driver in range.
                </p>
              </details>
              <details className="p-2 bg-slate-50 rounded-lg">
                <summary className="font-semibold cursor-pointer text-slate-800">What is the cancellation charge policy?</summary>
                <p className="mt-1 text-slate-600 text-[11px]">
                  Cancellation is free while searching. If a driver has arrived at pickup, a nominal fee of ₹30-₹120 is charged to compensate the driver's fuel.
                </p>
              </details>
              <details className="p-2 bg-slate-50 rounded-lg">
                <summary className="font-semibold cursor-pointer text-slate-800">Are my goods insured during transit?</summary>
                <p className="mt-1 text-slate-600 text-[11px]">
                  All SwifLoad partner trips include transit damage coverage up to ₹50,000 when verified by pickup & drop OTPs.
                </p>
              </details>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SWIFLOAD CUSTOMER WALLET ================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Wallet Balance Hero Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-emerald-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Customer Express Wallet</span>
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Zero Negative Balance Policy</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                  {custType.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="relative z-10 pt-1">
                <div className="text-xs text-slate-400">Available Balance</div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-baseline space-x-1">
                  <span className="text-emerald-400">₹</span>
                  <span>{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Enjoy instantaneous one-tap booking deductions without payment gateway delays.
                </p>
              </div>

              {/* Quick Top-Up Presets */}
              <div className="relative z-10 pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-300">Quick Add Money:</div>
                <div className="flex gap-2">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => topUpCustomerWallet(amt)}
                      className="flex-1 py-1.5 bg-white/10 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold text-slate-200 transition-colors border border-white/5"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Top Up Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Add Custom Amount</h4>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={walletTopupAmount}
                    onChange={(e) => setWalletTopupAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    placeholder="Enter amount"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    topUpCustomerWallet(walletTopupAmount);
                    showToast(`Added ₹${walletTopupAmount} to your wallet!`);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Money</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Note: In accordance with SwifLoad rules, customer wallets cannot hold negative balances. Overdraft is exclusively reserved for approved delivery partners.
              </p>
            </div>

            {/* Wallet Transaction Ledger */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Wallet Activity Ledger</h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {currentCustomer?.wallet?.transactions?.length || 0} Transactions
                </span>
              </div>

              <div className="space-y-2">
                {currentCustomer?.wallet?.transactions && currentCustomer.wallet.transactions.length > 0 ? (
                  currentCustomer.wallet.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 leading-tight">{tx.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(tx.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-xs ${
                            tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </span>
                        <div className="text-[9px] text-slate-400">Bal: ₹{tx.balanceAfter}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No transactions yet. Recharge your wallet to start!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: REFER & EARN ================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Refer & Earn Hero */}
            <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">
                  🎁
                </div>
                <div>
                  <h3 className="font-bold text-base">SwifLoad Refer & Earn</h3>
                  <p className="text-[11px] text-emerald-200">Earn wallet credits for every friend & business you invite</p>
                </div>
              </div>

              {/* Unique Code Card */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Your Shareable Referral Code</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-white tracking-widest">
                    {currentCustomer?.referralCode || 'SWIF-USER-88'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentCustomer?.referralCode || 'SWIF-USER-88');
                      setReferralCopied(true);
                      showToast('Referral code copied to clipboard!');
                      setTimeout(() => setReferralCopied(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-white text-slate-900 hover:bg-emerald-400 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow"
                  >
                    {referralCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{referralCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Bonus Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-emerald-200">Referee Gets</div>
                  <div className="text-lg font-black text-emerald-300 mt-0.5">
                    ₹{referralConfig?.customerToCustomerRefereeBonus || 100}
                  </div>
                  <div className="text-[10px] text-slate-300">Welcome wallet credit on signup</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-emerald-200">You Receive</div>
                  <div className="text-lg font-black text-emerald-300 mt-0.5">
                    ₹{referralConfig?.customerToCustomerReferrerBonus || 150}
                  </div>
                  <div className="text-[10px] text-slate-300">After their 1st trip completes</div>
                </div>
              </div>
            </div>

            {/* Apply Referral Code Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Have a Referral Code from a Friend or Driver?
              </h4>
              <p className="text-slate-600 text-[11px]">
                Apply a referral code to immediately credit ₹{referralConfig?.customerToCustomerRefereeBonus || 100} to your SwifLoad Wallet.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. SWIF-DRV01-44 or SWIF-KAV-12"
                  value={referralInputCode}
                  onChange={(e) => setReferralInputCode(e.target.value.toUpperCase())}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!referralInputCode.trim()) {
                      showToast('Please enter a referral code.');
                      return;
                    }
                    const res = applyCustomerReferralCode(referralInputCode.trim());
                    if (res.success) {
                      setReferralInputCode('');
                    }
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Apply Code
                </button>
              </div>
              {currentCustomer?.referredBy && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  ✓ Successfully linked with referral code: <strong>{currentCustomer.referredBy}</strong>
                </div>
              )}
            </div>

            {/* Referral Ledger List */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Your Referral Invites</h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {referrals.filter((r) => r.referrerId === currentCustomer?.id || r.refereePhone === currentCustomer?.phone).length} records
                </span>
              </div>
              <div className="space-y-2">
                {referrals.filter((r) => r.referrerId === currentCustomer?.id || r.refereePhone === currentCustomer?.phone).length > 0 ? (
                  referrals
                    .filter((r) => r.referrerId === currentCustomer?.id || r.refereePhone === currentCustomer?.phone)
                    .map((ref) => (
                      <div key={ref.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{ref.refereeName} ({ref.refereePhone})</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ref.notes}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-600 text-xs">+₹{ref.bonusAmount}</span>
                          <div>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              {ref.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No friends referred yet. Share your code to earn bonuses!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between z-30 shadow-lg">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'book' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Book</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center space-y-0.5 relative ${activeTab === 'tracking' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">Active</span>
          {currentTrip.status !== 'DELIVERED' && currentTrip.status !== 'CANCELLED' && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'wallet' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'referrals' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px]">Refer</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'history' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

      {/* ================= MODAL: SHIPMENT DETAILS EDIT ================= */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Shipment & Recipient Details</h3>
              <button onClick={() => setShowShipmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Goods Category</label>
                <select
                  value={goodsCategory}
                  onChange={(e) => setGoodsCategory(e.target.value as GoodsCategory)}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-xl"
                >
                  <option>Electronics & Appliances</option>
                  <option>Furniture & Home Decor</option>
                  <option>Groceries & Perishables</option>
                  <option>Hardware & Building Materials</option>
                  <option>Textiles & Garments</option>
                  <option>Documents & Small Parcels</option>
                  <option>Industrial Equipment</option>
                  <option>Other Goods</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Approx. Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Receiver Name & Contact</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Receiver Name"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="p-2 bg-slate-50 border rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Cargo Handling Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-xl"
                  placeholder="e.g. fragile, carry rope, lift available..."
                />
              </div>
            </div>

            <button
              onClick={() => setShowShipmentModal(false)}
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 text-xs"
            >
              Save Shipment Information
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCELLATION ================= */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Cancel Booking?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please choose a reason for cancellation. Note that nominal cancellation charges may apply if the driver has already reached pickup.
            </p>
            <div className="space-y-2 text-xs">
              {[
                'Driver taking too long to arrive',
                'Change of plans / rescheduled',
                'Booked wrong vehicle type',
                'Driver asked to cancel or pay cash extra',
              ].map((reason) => (
                <label key={reason} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border cursor-pointer">
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="text-rose-600"
                  />
                  <span className="text-slate-700 text-[11px]">{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 rounded-xl text-slate-600"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  cancelTrip(currentTrip.id, cancelReason);
                  setShowCancelModal(false);
                }}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRIVACY MASKED CALL ================= */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Privacy Safe Calling</h3>
            <p className="text-xs text-slate-600">
              Connecting you with <strong>{currentTrip.driverName}</strong> via SwifLoad's virtual bridge number:
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-base font-bold text-emerald-700">
              +91 80 4719 8921 ext 4
            </div>
            <p className="text-[10px] text-slate-400">Your personal mobile number is never shared with the driver.</p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 rounded-xl text-slate-700"
              >
                Close
              </button>
              <a
                href="tel:+918047198921"
                className="flex-1 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl"
              >
                Dial Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAX INVOICE RECEIPT ================= */}
      {viewInvoiceTripId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-600 text-lg">⚡ SwifLoad</span>
                <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded">TAX INVOICE</span>
              </div>
              <button onClick={() => setViewInvoiceTripId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const invTrip = trips.find((t) => t.id === viewInvoiceTripId) || currentTrip;
              return (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <div>
                      <div>Invoice No: <strong>INV-{invTrip.bookingCode}</strong></div>
                      <div>Date: {invTrip.createdAt.slice(0, 10)}</div>
                    </div>
                    <div className="text-right">
                      <div>GSTIN: <strong>33AAACS8192K1Z5</strong></div>
                      <div>Coimbatore, Tamil Nadu</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">Trip Breakdown:</div>
                    <div className="text-[11px] text-slate-600">Pickup: {invTrip.pickup.address}</div>
                    <div className="text-[11px] text-slate-600">Drop: {invTrip.drop.address}</div>
                    <div className="text-[11px] text-slate-600">Distance: {invTrip.distanceKm} km ({invTrip.vehicleCategory})</div>
                  </div>

                  <div className="space-y-1 border-t pt-2">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span>₹{invTrip.fare.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance Charge</span>
                      <span>₹{invTrip.fare.distanceFare}</span>
                    </div>
                    {invTrip.fare.helperFee > 0 && (
                      <div className="flex justify-between">
                        <span>Helper Fee</span>
                        <span>₹{invTrip.fare.helperFee}</span>
                      </div>
                    )}
                    {invTrip.fare.surgeFare > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Demand Surge</span>
                        <span>₹{invTrip.fare.surgeFare}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1">
                      <span>GST (5%)</span>
                      <span>₹{invTrip.fare.taxGst}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm border-t pt-1 text-slate-900">
                      <span>Total Paid ({invTrip.paymentMethod})</span>
                      <span className="text-emerald-600">₹{invTrip.fare.totalFare}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast('Receipt downloaded to device!');
                      setViewInvoiceTripId(null);
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 text-xs"
                  >
                    Save PDF Invoice
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER AUTH & REGISTRATION ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {authMode === 'register' ? 'Register as New Customer' : 'Customer Mobile Login'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authMode === 'register'
                    ? 'Create your shipper profile for Coimbatore freight services'
                    : 'Sign in with your mobile number and OTP'}
                </p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setAuthMode('register')}
                className={`py-2 rounded-lg transition-colors ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register New
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className={`py-2 rounded-lg transition-colors ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In with OTP
              </button>
            </div>

            {/* Registration Form */}
            {authMode === 'register' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!regName.trim() || !regPhone.trim()) {
                    showToast('Please enter your full name and mobile number.');
                    return;
                  }
                  registerCustomer({
                    name: regName.trim(),
                    phone: regPhone.trim().startsWith('+91') ? regPhone.trim() : `+91 ${regPhone.trim()}`,
                    email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                    companyName: regCompany.trim() || undefined,
                  });
                  setSenderName(regName.trim());
                  setSenderPhone(regPhone.trim().startsWith('+91') ? regPhone.trim() : `+91 ${regPhone.trim()}`);
                  setShowAuthModal(false);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98450 11223"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Company / Shop Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Hardware Mart"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-emerald-900">4-Digit Verification OTP</label>
                    <span className="text-[10px] text-emerald-700 font-mono">Test OTP: 1234</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-center font-mono font-bold tracking-widest text-base focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Verify OTP & Register Account
                </button>
              </form>
            ) : (
              /* Login Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!regPhone.trim()) {
                    showToast('Please enter your mobile phone number.');
                    return;
                  }
                  const ok = loginCustomer(regPhone, authOtp);
                  if (ok) {
                    setShowAuthModal(false);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700">Registered Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98801 99234"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Enter 4-Digit OTP</label>
                    <span className="text-[10px] text-slate-500 font-mono">Test OTP: 1234</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold tracking-widest text-base focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Sign In with OTP
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER WALLET TOP-UP ================= */}
      {showWalletTopupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Recharge Express Wallet</h3>
                  <p className="text-[11px] text-slate-500">Current Balance: ₹{currentCustomer?.wallet?.balance || 0}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWalletTopupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Enter Top-Up Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-emerald-600">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={walletTopupAmount}
                    onChange={(e) => setWalletTopupAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-lg text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWalletTopupAmount(amt)}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 leading-snug">
                ⚡ Instant wallet credit via simulated UPI / Card test gateway. Customer wallets strictly do not allow negative balance.
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalletTopupModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  topUpCustomerWallet(walletTopupAmount);
                  setShowWalletTopupModal(false);
                  showToast(`Successfully added ₹${walletTopupAmount} to SwifLoad Wallet!`);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-200"
              >
                Add ₹{walletTopupAmount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
