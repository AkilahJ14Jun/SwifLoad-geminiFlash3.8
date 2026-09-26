'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Power,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Camera,
  Upload,
  Clock,
  HelpCircle,
  XCircle,
  Check,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  UserPlus,
  X,
  Gift,
  Copy,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory } from '@/types/logistics';
import { calculateDriverTaskPayout } from '@/lib/pricing';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

export default function DriverApp() {
  const {
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    trips,
    driverGroups,
    acceptTripByDriver,
    passTripToNextGroup,
    advanceTripStatus,
    toggleDriverOnline,
    requestDriverPayout,
    registerDriver,
    showToast,
    customerSlabConfigs,
    vehicleConfigs,
    serviceZones,
    referralConfig,
    referrals,
    topUpDriverWallet,
  } = useLogistics();

  const [activeDriverTab, setActiveDriverTab] = useState<'trips' | 'earnings' | 'referrals' | 'kyc' | 'support'>('trips');
  const [pickupOtpInput, setPickupOtpInput] = useState<string>('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<string>('');
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [showIncomingTripModal, setShowIncomingTripModal] = useState<boolean>(false);
  const [dismissedTripIds, setDismissedTripIds] = useState<string[]>([]);

  // Driver Top-Up / Clear Dues Modal State
  const [showDriverTopupModal, setShowDriverTopupModal] = useState<boolean>(false);
  const [driverTopupAmt, setDriverTopupAmt] = useState<number>(500);
  const [driverReferralCopied, setDriverReferralCopied] = useState<boolean>(false);
  const [referredByDriverCode, setReferredByDriverCode] = useState<string>('');

  // Driver Onboarding & Registration State
  const [showDriverRegModal, setShowDriverRegModal] = useState<boolean>(false);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [driverVehCat, setDriverVehCat] = useState<VehicleCategory>('tata_ace');
  const [driverVehModel, setDriverVehModel] = useState<string>('Tata Ace Gold Diesel');
  const [driverVehNumber, setDriverVehNumber] = useState<string>('');
  const [driverDL, setDriverDL] = useState<string>('');
  const [driverRC, setDriverRC] = useState<string>('');
  const [driverInsurance, setDriverInsurance] = useState<string>('');
  const [driverAadhaar, setDriverAadhaar] = useState<string>('');
  const [bankAccName, setBankAccName] = useState<string>('');
  const [bankAccNum, setBankAccNum] = useState<string>('');
  const [bankIFSC, setBankIFSC] = useState<string>('');
  const [driverUpi, setDriverUpi] = useState<string>('');

  // Current Driver
  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Active assigned trip for this driver
  const assignedTrip = trips.find(
    (t) =>
      t.driverId === currentDriver.id &&
      ['DRIVER_ASSIGNED', 'ARRIVING_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'ARRIVED_DESTINATION'].includes(t.status)
  );

  // Unaccepted trips currently offered to this driver's assigned group
  const availableGroupTrips = trips.filter(
    (t) =>
      t.status === 'SEARCHING' &&
      t.currentDispatchGroupId === currentDriver.groupId
  );

  // Active incoming task popup target
  const activeIncomingTrip =
    !assignedTrip && currentDriver.isOnline
      ? availableGroupTrips.find((t) => !dismissedTripIds.includes(t.id)) || null
      : null;

  // Completed trips by this driver
  const completedDriverTrips = trips.filter(
    (t) => t.driverId === currentDriver.id && t.status === 'DELIVERED'
  );

  const handleAdvanceStatus = () => {
    if (!assignedTrip) return;

    if (assignedTrip.status === 'AT_PICKUP') {
      const res = advanceTripStatus(assignedTrip.id, pickupOtpInput);
      if (res.success) {
        setPickupOtpInput('');
      }
      return;
    }

    if (assignedTrip.status === 'ARRIVED_DESTINATION') {
      const res = advanceTripStatus(
        assignedTrip.id,
        deliveryOtpInput,
        podPhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'
      );
      if (res.success) {
        setDeliveryOtpInput('');
        setPodPhotoUrl('');
      }
      return;
    }

    advanceTripStatus(assignedTrip.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 pb-20 md:pb-6">
      {/* Top Driver Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 shadow-md space-y-2.5">
        {/* Row 1: Profile & Primary Online Switch */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src={currentDriver.avatar}
                alt={currentDriver.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  currentDriver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-1">
                <span className="font-bold text-sm text-white truncate">{currentDriver.name}</span>
                <span className="text-[10px] bg-slate-800/90 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap shrink-0 tracking-wider inline-block">
                  {currentDriver.vehicleNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 capitalize truncate mt-0.5">
                {currentDriver.vehicleModel} • ⭐ {currentDriver.rating || 4.9} ({currentDriver.totalTrips} trips)
              </p>
              <div className="flex items-center space-x-1.5 flex-wrap text-[11px] mt-1">
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 text-[10px]">
                  <span>📍</span>
                  <span>{currentDriver.groupName || 'Central Fleet'}</span>
                </span>
                <span className="text-slate-400 text-[10px] truncate max-w-[190px]">
                  Range: {currentDriver.locationRange || 'Coimbatore Core'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Online/Offline Switch */}
          <button
            onClick={() => toggleDriverOnline(currentDriver.id)}
            className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-black shadow-lg transition-all ${
              currentDriver.isOnline
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 ring-2 ring-emerald-400/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-700 hover:bg-rose-900'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{currentDriver.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Row 2: Secondary Quick Bar (Register Driver, Wallet Chip, Referrals & Switch Profile) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Switch:</span>
            <select
              value={currentDriver.id}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none truncate max-w-[150px]"
              title="Switch Driver Profile"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleNumber}) - {d.wallet.balance < 0 ? `-₹${Math.abs(d.wallet.balance)}` : `₹${d.wallet.balance}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Quick Wallet Overdraft Chip */}
            <button
              onClick={() => setActiveDriverTab('earnings')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 border transition-colors ${
                currentDriver.wallet.balance < 0
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
              }`}
              title="Driver Wallet Balance & Overdraft"
            >
              <Wallet className="w-3 h-3" />
              <span>
                {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
              </span>
            </button>

            {/* Refer & Earn Shortcut */}
            <button
              onClick={() => setActiveDriverTab('referrals')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center space-x-1"
              title="Refer Drivers or Customers"
            >
              <Gift className="w-3 h-3" />
              <span className="hidden sm:inline">Refer & Earn</span>
            </button>

            <button
              onClick={() => setShowDriverRegModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Register as New Driver Partner"
            >
              <UserPlus className="w-3 h-3" />
              <span className="whitespace-nowrap">+ Driver</span>
            </button>
          </div>
        </div>
      </div>

      {/* KYC Warning Banner if not verified */}
      {currentDriver.kycStatus !== 'VERIFIED' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-amber-300 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              KYC Status: <strong>{currentDriver.kycStatus}</strong>. Documents awaiting admin verification.
            </span>
          </div>
          <button
            onClick={() => setActiveDriverTab('kyc')}
            className="text-[11px] underline font-semibold text-amber-200"
          >
            View Docs
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4">
        {/* ================= TAB 1: ACTIVE TRIPS & DISPATCH ================= */}
        {activeDriverTab === 'trips' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* If there is an active assigned trip */}
            {assignedTrip ? (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Active Dispatch: {assignedTrip.bookingCode}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-lg">
                    Earnings: ₹{assignedTrip.fare.driverEarnings}
                  </span>
                </div>

                {/* Map View with route */}
                <LeafletMap
                  pickup={{ lat: assignedTrip.pickup.lat, lng: assignedTrip.pickup.lng, label: 'Pickup' }}
                  drop={{ lat: assignedTrip.drop.lat, lng: assignedTrip.drop.lng, label: 'Drop' }}
                  driver={{
                    lat: assignedTrip.driverLocation?.lat || currentDriver.currentLocation.lat,
                    lng: assignedTrip.driverLocation?.lng || currentDriver.currentLocation.lng,
                    label: 'You (Driver)',
                  }}
                  targetDestination={assignedTrip.status === 'IN_TRANSIT' ? 'drop' : 'pickup'}
                  className="h-44 w-full rounded-xl border border-slate-800"
                />

                {/* Deep link Google Maps Navigation button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${
                    assignedTrip.status === 'AT_PICKUP' || assignedTrip.status === 'IN_TRANSIT'
                      ? `${assignedTrip.drop.lat},${assignedTrip.drop.lng}`
                      : `${assignedTrip.pickup.lat},${assignedTrip.pickup.lng}`
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow"
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    Open In Google Maps Navigation (
                    {assignedTrip.status === 'AT_PICKUP' || assignedTrip.status === 'IN_TRANSIT' ? 'To Drop' : 'To Pickup'}
                    )
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Locations */}
                <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-start space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">Pickup ({assignedTrip.pickup.area})</div>
                      <div className="text-[11px] text-slate-400">{assignedTrip.pickup.address}</div>
                      <div className="text-[10px] text-slate-500">Contact: {assignedTrip.pickup.senderOrReceiverName || assignedTrip.customerName}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2 border-t border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">Drop Destination ({assignedTrip.drop.area})</div>
                      <div className="text-[11px] text-slate-400">{assignedTrip.drop.address}</div>
                      <div className="text-[10px] text-slate-500">Contact: {assignedTrip.drop.senderOrReceiverName || 'Receiver'}</div>
                    </div>
                  </div>
                </div>

                {/* Goods details */}
                <div className="flex items-center justify-between text-xs bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Cargo:</span>{' '}
                    <span className="font-semibold text-slate-200">{assignedTrip.shipment.goodsCategory} (~{assignedTrip.shipment.approxWeightKg}kg)</span>
                  </div>
                  {assignedTrip.shipment.hasHelperRequired && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                      Helper Assistance Req.
                    </span>
                  )}
                </div>

                {/* Masked Call Customer */}
                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${assignedTrip.customerPhone}`}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Masked Call Customer</span>
                  </a>
                  <a
                    href={`https://wa.me/919880199234?text=Hello%20Customer,%20I%20am%20your%20SwifLoad%20driver`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-teal-900/50 hover:bg-teal-900 text-teal-300 rounded-xl border border-teal-700"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                {/* TRIP EXECUTION ACTIONS BY STATUS */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Trip Stage</div>

                  {assignedTrip.status === 'DRIVER_ASSIGNED' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                    >
                      I Am En Route to Pickup Location ➔
                    </button>
                  )}

                  {assignedTrip.status === 'ARRIVING_PICKUP' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                    >
                      I Have Arrived at Pickup Point ➔
                    </button>
                  )}

                  {assignedTrip.status === 'AT_PICKUP' && (
                    <div className="space-y-2">
                      <div className="text-xs text-amber-300 font-medium">
                        Ask sender for 4-digit Pickup OTP before loading goods:
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 4821"
                          value={pickupOtpInput}
                          onChange={(e) => setPickupOtpInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                          onClick={handleAdvanceStatus}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs"
                        >
                          Verify & Start Trip
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 italic">Demo Tip: Valid Pickup OTP is {assignedTrip.shipment.pickupOtp}</div>
                    </div>
                  )}

                  {assignedTrip.status === 'IN_TRANSIT' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                    >
                      I Have Reached Drop Destination ➔
                    </button>
                  )}

                  {assignedTrip.status === 'ARRIVED_DESTINATION' && (
                    <div className="space-y-3">
                      <div className="text-xs text-amber-300 font-medium">
                        Collect Drop OTP from recipient & optional delivery proof:
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Drop OTP"
                          value={deliveryOtpInput}
                          onChange={(e) => setDeliveryOtpInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                          onClick={handleAdvanceStatus}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs"
                        >
                          Confirm Delivery
                        </button>
                      </div>

                      {/* Payment Collection notice if COD */}
                      {assignedTrip.paymentMethod === 'CASH_ON_DELIVERY' && (
                        <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                          <span>Collect Cash on Drop:</span>
                          <span className="font-extrabold text-white text-sm">₹{assignedTrip.fare.totalFare}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 italic">Demo Tip: Valid Delivery OTP is {assignedTrip.shipment.deliveryOtp}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* When driver has no active trip */
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center text-xl">
                  {currentDriver.isOnline ? '📡' : '💤'}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {currentDriver.isOnline ? 'Searching for Nearby Bookings' : 'You are currently OFFLINE'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {currentDriver.isOnline
                      ? `Active in group: ${currentDriver.groupName || 'Central Fleet'}. Requests will pop up here.`
                      : 'Toggle to ONLINE to start receiving freight booking offers for your group.'}
                  </p>
                </div>

                {currentDriver.isOnline && availableGroupTrips.length === 0 && (
                  <div className="text-[11px] text-slate-500 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                    📡 Listening for new customer bookings nearest to {currentDriver.groupName || 'your zone'}...
                  </div>
                )}
              </div>
            )}

            {/* Available Orders For Your Group (Tasks offered to this group before cascading to next group) */}
            {availableGroupTrips.length > 0 && !assignedTrip && (
              <div className="bg-slate-950 rounded-2xl border border-amber-500/40 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Available Orders for Your Group ({currentDriver.groupName})
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {availableGroupTrips.length} Order(s)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Tasks not accepted immediately show here for your group before auto-cascading to the adjacent location group.
                </p>

                <div className="space-y-3">
                  {availableGroupTrips.map((order) => {
                    const payout = calculateDriverTaskPayout(
                      currentDriver.currentLocation,
                      order.pickup,
                      order.distanceKm,
                      order.customerType || 'regular',
                      customerSlabConfigs
                    );

                    return (
                      <div
                        key={order.id}
                        className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{order.bookingCode}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-400 font-black text-sm">
                              ₹{payout.netEarnings} (Net Payout)
                            </span>
                            <span className="text-[10px] bg-slate-800 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                              {order.dispatchCountdownSecs ?? 15}s left
                            </span>
                          </div>
                        </div>

                        {/* Driver Approach + Trip Distance Breakdown */}
                        <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/40 flex items-center justify-between text-[10px] text-emerald-300">
                          <span>
                            📍 {payout.driverDistanceToPickupKm} km from you to pickup + {payout.tripDistanceKm} km trip
                          </span>
                          <span className="font-mono font-bold">
                            = {payout.totalDistanceKm} km billable
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <div className="flex items-start space-x-2">
                            <span className="text-emerald-400 mt-0.5">●</span>
                            <div>
                              <span className="font-semibold text-slate-200">Pickup: {order.pickup.area}</span>
                              <div className="text-[11px] text-slate-400">{order.pickup.address}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 pt-1.5 border-t border-slate-800">
                            <span className="text-rose-400 mt-0.5">■</span>
                            <div>
                              <span className="font-semibold text-slate-200">Drop: {order.drop.area} ({order.distanceKm} km)</span>
                              <div className="text-[11px] text-slate-400">{order.drop.address}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span>Cargo: {order.shipment.goodsCategory} (~{order.shipment.approxWeightKg}kg)</span>
                          <span>Task Charge (Gross): ₹{payout.grossFare}</span>
                        </div>

                        <div className="flex items-center space-x-2 pt-1 border-t border-slate-800">
                          <button
                            onClick={() => passTripToNextGroup(order.id)}
                            className="flex-1 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            Pass to Next Group
                          </button>
                          <button
                            onClick={() => acceptTripByDriver(order.id, currentDriver.id)}
                            className="flex-1 py-2 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow transition-transform active:scale-95"
                          >
                            Accept Task (₹{payout.netEarnings})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Earnings & Overdraft Bar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Today's Earnings</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">₹{currentDriver.wallet.todayEarnings}</div>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Wallet Balance</div>
                  {currentDriver.wallet.balance < 0 && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">Overdraft</span>
                  )}
                </div>
                <div className={`text-lg font-black mt-0.5 ${currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-white'}`}>
                  {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                </div>
                {currentDriver.wallet.balance < 0 && (
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Limit: -₹{currentDriver.wallet.negativeBalanceLimit || 1500}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: WALLET, OVERDRAFT & EARNINGS ================= */}
        {activeDriverTab === 'earnings' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Wallet & Overdraft Hero Card */}
            <div className={`rounded-3xl p-5 border shadow-xl space-y-4 relative overflow-hidden ${
              currentDriver.wallet.balance < 0
                ? 'bg-gradient-to-br from-rose-950 via-slate-950 to-slate-900 border-rose-800/60'
                : 'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    currentDriver.wallet.balance < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 font-bold">Driver Partner Wallet</span>
                    <div className="text-[10px] text-slate-400">Overdraft Facility Active</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  currentDriver.wallet.balance < 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {currentDriver.wallet.balance < 0 ? 'OVERDRAFT IN USE' : 'GOOD STANDING'}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">Current Wallet Balance</div>
                <div className={`text-3xl sm:text-4xl font-black mt-0.5 tracking-tight flex items-baseline space-x-1 ${
                  currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-white'
                }`}>
                  <span>{currentDriver.wallet.balance < 0 ? '-₹' : '₹'}</span>
                  <span>{Math.abs(currentDriver.wallet.balance).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Overdraft Cushion Details Box */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Approved Negative Limit:</span>
                  <span className="font-extrabold text-white font-mono">-₹{currentDriver.wallet.negativeBalanceLimit || 1500}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Remaining Credit Buffer:</span>
                  <span className="font-extrabold text-emerald-400 font-mono">
                    ₹{Math.max(0, (currentDriver.wallet.negativeBalanceLimit || 1500) + currentDriver.wallet.balance).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-snug">
                  * Negative balances occur when platform commissions are deducted for Cash-on-Drop (COD) customer trips. Overdraft limit is pre-determined by Admin.
                </p>
              </div>

              {/* Actions: Top-up / Clear Dues & Payout */}
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDriverTopupModal(true)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{currentDriver.wallet.balance < 0 ? 'Clear Dues / Top Up' : 'Add Wallet Balance'}</span>
                </button>

                {currentDriver.wallet.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>Request Payout</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Wallet Transaction Ledger */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Wallet Activity Ledger</h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentDriver.wallet.transactions?.length || 0} Transactions
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentDriver.wallet.transactions && currentDriver.wallet.transactions.length > 0 ? (
                  currentDriver.wallet.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 leading-tight">{tx.description}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
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
                            tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </span>
                        <div className="text-[9px] text-slate-500">Bal: ₹{tx.balanceAfter}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No wallet transactions recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Bank details preview */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Registered Payout Account</div>
              <div className="flex justify-between text-slate-400">
                <span>Account Name</span>
                <span className="text-white font-medium">{currentDriver.bankDetails.accountName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bank / IFSC</span>
                <span className="text-white font-medium">{currentDriver.bankDetails.ifscCode}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Direct UPI ID</span>
                <span className="text-emerald-400 font-mono font-medium">{currentDriver.bankDetails.upiId}</span>
              </div>
            </div>

            {/* Trip Earnings History */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Completed Trips & Payouts</h4>
              {completedDriverTrips.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No completed trips today yet.</p>
              ) : (
                completedDriverTrips.map((tr) => (
                  <div key={tr.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{tr.bookingCode}</div>
                      <div className="text-[11px] text-slate-400">{tr.pickup.area} ➔ {tr.drop.area} ({tr.distanceKm}km)</div>
                      <div className="text-[10px] text-slate-500">{new Date(tr.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400 text-sm">+₹{tr.fare.driverEarnings}</div>
                      <div className="text-[10px] text-slate-500">Gross: ₹{tr.fare.totalFare}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: REFER & EARN (DRIVER PROGRAM) ================= */}
        {activeDriverTab === 'referrals' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Refer & Earn Hero */}
            <div className="bg-gradient-to-br from-amber-950 via-slate-950 to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-amber-800/40 relative overflow-hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  🎁
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Driver Partner Refer & Earn</h3>
                  <p className="text-[11px] text-amber-200">Earn direct wallet cash for expanding Coimbatore's fleet</p>
                </div>
              </div>

              {/* Unique Code Card */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Your Driver Referral Code</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-white tracking-widest">
                    {currentDriver.referralCode || 'SWIF-DRV01-44'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentDriver.referralCode || 'SWIF-DRV01-44');
                      setDriverReferralCopied(true);
                      showToast('Driver referral code copied to clipboard!');
                      setTimeout(() => setDriverReferralCopied(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow"
                  >
                    {driverReferralCopied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{driverReferralCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Two Tracks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Track 1: Driver referring Driver */}
                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Track 1: Refer a Driver</div>
                  <div className="text-xl font-black text-emerald-400">
                    ₹{referralConfig?.driverToDriverBonus || 500}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Refer tempo, pickup, or mini-truck drivers. Auto-credited to your wallet when their KYC is verified by Admin.
                  </p>
                </div>

                {/* Track 2: Driver referring Customer */}
                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Track 2: Refer a Customer</div>
                  <div className="text-xl font-black text-emerald-400">
                    ₹{referralConfig?.driverToCustomerBonus || 100}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Tell shops, factories, and merchants to book via SwifLoad. Auto-credited when they complete their first trip.
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Referral Activity Ledger */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Your Referral Rewards</h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {referrals.filter((r) => r.referrerId === currentDriver.id).length} invites
                </span>
              </div>

              <div className="space-y-2">
                {referrals.filter((r) => r.referrerId === currentDriver.id).length > 0 ? (
                  referrals
                    .filter((r) => r.referrerId === currentDriver.id)
                    .map((ref) => (
                      <div key={ref.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{ref.refereeName} ({ref.refereePhone})</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ref.notes}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-400 text-xs">+₹{ref.bonusAmount}</span>
                          <div>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                              {ref.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Share your driver referral code to start earning ₹500/driver and ₹100/customer!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: KYC & VEHICLE DOCUMENTS ================= */}
        {activeDriverTab === 'kyc' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">KYC Onboarding & Verification</h3>
                  <p className="text-xs text-slate-400">Government compliance documents for commercial transport</p>
                </div>
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    currentDriver.kycStatus === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {currentDriver.kycStatus}
                </span>
              </div>

              {/* Document checklist */}
              <div className="space-y-2.5 pt-2 text-xs">
                {currentDriver.kycDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        {doc.verified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{doc.docType.replace('_', ' ')}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.docNumber}</div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline"
                    >
                      View Doc
                    </a>
                  </div>
                ))}
              </div>

              {/* Onboard Another Partner Action */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Want to onboard another driver partner or vehicle?</span>
                <button
                  onClick={() => setShowDriverRegModal(true)}
                  className="w-full sm:w-auto text-xs px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-1 shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New Driver Partner</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPPORT ================= */}
        {activeDriverTab === 'support' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-white">Driver Partner SOS & Support</h3>
              <p className="text-slate-400">
                In case of accident, dispute, fuel breakdown, or customer no-show:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="tel:+918023456780"
                  className="p-3 bg-rose-900/30 border border-rose-800 rounded-xl text-rose-300 flex flex-col items-center text-center font-bold space-y-1"
                >
                  <Phone className="w-5 h-5 text-rose-400" />
                  <span>24/7 Driver SOS</span>
                </a>
                <a
                  href="https://wa.me/919845012345?text=Driver%20Partner%20Help%20Request"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-teal-900/30 border border-teal-800 rounded-xl text-teal-300 flex flex-col items-center text-center font-bold space-y-1"
                >
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                  <span>WhatsApp Helpdesk</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-between z-30 shadow-2xl">
        <button
          onClick={() => setActiveDriverTab('trips')}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'trips' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">Dispatch</span>
        </button>

        <button
          onClick={() => setActiveDriverTab('earnings')}
          className={`flex flex-col items-center space-y-0.5 relative ${
            activeDriverTab === 'earnings' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Wallet</span>
          {currentDriver.wallet.balance < 0 && (
            <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveDriverTab('referrals')}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'referrals' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px]">Refer</span>
        </button>

        <button
          onClick={() => setActiveDriverTab('kyc')}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'kyc' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">KYC Docs</span>
        </button>

        <button
          onClick={() => setActiveDriverTab('support')}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'support' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">SOS Support</span>
        </button>
      </div>

      {/* ================= MODAL: PAYOUT REQUEST ================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl">
            <h3 className="font-bold text-sm">Instant Bank IMPS Payout</h3>
            <p className="text-xs text-slate-400">
              Transfer your balance directly to your bank account ({currentDriver.bankDetails.accountName}):
            </p>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold">Amount to Withdraw (₹)</label>
              <input
                type="number"
                value={payoutAmount}
                max={currentDriver.wallet.balance}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-black text-lg"
              />
              <div className="text-[10px] text-slate-500 mt-1">Available balance: ₹{currentDriver.wallet.balance}</div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  requestDriverPayout(currentDriver.id, payoutAmount);
                  setShowPayoutModal(false);
                }}
                className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REAL-TIME CASCADING DISPATCH POPUP ================= */}
      {(activeIncomingTrip || showIncomingTripModal) && (
        (() => {
          const tripToOffer = activeIncomingTrip || trips.find((t) => t.status === 'SEARCHING') || null;
          if (!tripToOffer) return null;

          const payout = calculateDriverTaskPayout(
            currentDriver.currentLocation,
            tripToOffer.pickup,
            tripToOffer.distanceKm,
            tripToOffer.customerType || 'regular',
            customerSlabConfigs
          );

          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      ⚡ Incoming Task ({currentDriver.groupName})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                    {tripToOffer.dispatchCountdownSecs ?? 15}s Left
                  </span>
                </div>

                {/* Driver task charges based on distance to pickup + drop based on slab rates */}
                <div className="text-center py-2.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Distance Slab Task Charge
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    ₹{payout.grossFare}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    Net Take-Home Payout: <span className="text-emerald-400 font-bold">₹{payout.netEarnings}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 px-2">
                    {payout.driverDistanceToPickupKm} km (you to pickup) + {payout.tripDistanceKm} km (trip) = <strong className="text-slate-200">{payout.totalDistanceKm} km billable</strong>
                  </div>
                </div>

                {/* Slabs breakdown pills */}
                <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[10px]">
                  <div className="flex justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1">
                    <span>Configured Distance Slabs</span>
                    <span className="text-emerald-400">Total ₹{payout.grossFare}</span>
                  </div>
                  <div className="space-y-1 pt-0.5">
                    {payout.slabBreakdown.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{s.slabLabel} ({s.kmInSlab} km):</span>
                        <span className="font-mono font-bold text-emerald-400">₹{s.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200">Pickup: {tripToOffer.pickup.area}</div>
                      <div className="text-[11px] text-slate-400">{tripToOffer.pickup.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200">Drop: {tripToOffer.drop.area}</div>
                      <div className="text-[11px] text-slate-400">{tripToOffer.drop.address}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                  <span>📍 Cascades to adjacent group if unaccepted</span>
                  <span className="font-mono font-bold">{tripToOffer.dispatchCountdownSecs ?? 15}s</span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => {
                      passTripToNextGroup(tripToOffer.id);
                      setDismissedTripIds((prev) => [...prev, tripToOffer.id]);
                      setShowIncomingTripModal(false);
                    }}
                    className="flex-1 py-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  >
                    Pass to Next Group
                  </button>
                  <button
                    onClick={() => {
                      const res = acceptTripByDriver(tripToOffer.id, currentDriver.id);
                      if (res.success) {
                        setShowIncomingTripModal(false);
                      }
                    }}
                    className="flex-1 py-3 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    ACCEPT TASK
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* ================= MODAL: DRIVER ONBOARDING & REGISTRATION ================= */}
      {showDriverRegModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <span>⚡ Join SwifLoad Driver Fleet</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Coimbatore Hub (TN-37/38/66)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Register your vehicle and submit KYC documents for fast platform activation in Coimbatore
                </p>
              </div>
              <button onClick={() => setShowDriverRegModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!driverName.trim() || !driverPhone.trim() || !driverVehNumber.trim()) {
                  showToast('Please enter your name, mobile phone, and vehicle registration number.');
                  return;
                }

                registerDriver({
                  name: driverName.trim(),
                  phone: driverPhone.trim().startsWith('+91') ? driverPhone.trim() : `+91 ${driverPhone.trim()}`,
                  email: driverEmail.trim() || `${driverName.toLowerCase().replace(/\s+/g, '.')}@swifload.test`,
                  vehicleCategory: driverVehCat,
                  vehicleModel: driverVehModel.trim() || 'Commercial Carrier',
                  vehicleNumber: driverVehNumber.trim().toUpperCase(),
                  licenseNumber: driverDL.trim() || 'TN3820230099881',
                  rcNumber: driverRC.trim() || driverVehNumber.trim().toUpperCase(),
                  insuranceNumber: driverInsurance.trim() || 'POL-ICICI-882194',
                  aadhaarNumber: driverAadhaar.trim() || 'XXXX-XXXX-9912',
                  accountName: bankAccName.trim() || driverName.trim(),
                  accountNumber: bankAccNum.trim() || '50100982341098',
                  ifscCode: (bankIFSC.trim() || 'HDFC0000240').toUpperCase(),
                  upiId: driverUpi.trim() || `${driverName.toLowerCase().replace(/\s+/g, '')}@okaxis`,
                  referredByCode: referredByDriverCode.trim().toUpperCase() || undefined,
                });

                setShowDriverRegModal(false);
                setActiveDriverTab('kyc');
              }}
              className="space-y-4 text-xs"
            >
              {/* 1. Personal Details */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  1. Personal & Contact Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Driver Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Murugan K"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98422 12345"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. murugan.k@example.com"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Vehicle Details */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  2. Vehicle Selection & Registration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Vehicle Category *</label>
                    <select
                      value={driverVehCat}
                      onChange={(e) => setDriverVehCat(e.target.value as VehicleCategory)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="2wheeler">2-Wheeler (Bike - 20kg)</option>
                      <option value="3wheeler">3-Wheeler (Auto - 500kg)</option>
                      <option value="tata_ace">Tata Ace (Chota Hathi - 1000kg)</option>
                      <option value="pickup_8ft">8ft Pickup (Bolero - 1700kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Vehicle Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Ace Gold / Piaggio Ape"
                      value={driverVehModel}
                      onChange={(e) => setDriverVehModel(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Vehicle Number Plate (TN...) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN-38-AX-4821"
                    value={driverVehNumber}
                    onChange={(e) => setDriverVehNumber(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. KYC Document Numbers */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  3. Commercial KYC Verification Info
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Commercial Driving Licence No</label>
                    <input
                      type="text"
                      placeholder="e.g. TN3820230099881"
                      value={driverDL}
                      onChange={(e) => setDriverDL(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Vehicle RC Certificate No</label>
                    <input
                      type="text"
                      placeholder="e.g. TN38AX4821"
                      value={driverRC}
                      onChange={(e) => setDriverRC(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Insurance Policy No</label>
                    <input
                      type="text"
                      placeholder="e.g. ICICI-LOMB-7741"
                      value={driverInsurance}
                      onChange={(e) => setDriverInsurance(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Aadhaar Number (Last 4 digits)</label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-9023"
                      value={driverAadhaar}
                      onChange={(e) => setDriverAadhaar(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Bank & Payout Details */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  4. Bank Account & UPI for Daily Payouts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand Kumar V"
                      value={bankAccName}
                      onChange={(e) => setBankAccName(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50100982341098"
                      value={bankAccNum}
                      onChange={(e) => setBankAccNum(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0000240"
                      value={bankIFSC}
                      onChange={(e) => setBankIFSC(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">UPI ID for Instant Payout</label>
                    <input
                      type="text"
                      placeholder="e.g. anandkv@okaxis"
                      value={driverUpi}
                      onChange={(e) => setDriverUpi(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Referral Code (Optional) */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  5. Referral Code (Optional)
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Referred by Driver Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SWIF-DRV01-44"
                    value={referredByDriverCode}
                    onChange={(e) => setReferredByDriverCode(e.target.value.toUpperCase())}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    If another driver partner referred you, enter their code here so they receive their ₹{referralConfig?.driverToDriverBonus || 500} bonus!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <span>🛡️</span>
                <span>
                  After submitting, your profile will be sent to the Operations Admin for review and KYC activation.
                </span>
              </div>

              <button
                type="submit"
                onClick={() => {}}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-xl transition-transform active:scale-95"
              >
                Submit Driver Onboarding Application ➔
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DRIVER WALLET RECHARGE / CLEAR DUES ================= */}
      {showDriverTopupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Recharge Driver Wallet</h3>
                  <p className="text-[11px] text-slate-400">
                    Current:{' '}
                    <span className={currentDriver.wallet.balance < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                    </span>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDriverTopupModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Top-Up Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-emerald-400">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={driverTopupAmt}
                    onChange={(e) => setDriverTopupAmt(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-lg text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDriverTopupAmt(amt)}
                    className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 border border-slate-800"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved Negative Limit:</span>
                  <span className="font-bold text-white">-₹{currentDriver.wallet.negativeBalanceLimit || 1500}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  Top-ups clear negative commission dues or deposit credit for future trips.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDriverTopupModal(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  topUpDriverWallet(currentDriver.id, driverTopupAmt, 'Driver wallet self-recharge');
                  setShowDriverTopupModal(false);
                  showToast(`Recharged ₹${driverTopupAmt} to ${currentDriver.name}'s wallet!`);
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
              >
                Recharge ₹{driverTopupAmt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
