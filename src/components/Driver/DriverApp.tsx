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
  ExternalLink,
  UserPlus,
  X,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory } from '@/types/logistics';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

export default function DriverApp() {
  const {
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    trips,
    advanceTripStatus,
    toggleDriverOnline,
    requestDriverPayout,
    registerDriver,
    showToast,
  } = useLogistics();

  const [activeDriverTab, setActiveDriverTab] = useState<'trips' | 'earnings' | 'kyc' | 'support'>('trips');
  const [pickupOtpInput, setPickupOtpInput] = useState<string>('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<string>('');
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [showIncomingTripModal, setShowIncomingTripModal] = useState<boolean>(false);

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

        {/* Row 2: Secondary Quick Bar (Register Driver & Switch Profile) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs gap-2">
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Switch:</span>
            <select
              value={currentDriver.id}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none truncate max-w-[180px]"
              title="Switch Driver Profile"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleNumber}) - {d.kycStatus}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowDriverRegModal(true)}
            className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            title="Register as New Driver Partner"
          >
            <UserPlus className="w-3 h-3" />
            <span className="whitespace-nowrap">+ Register Driver</span>
          </button>
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
                      ? 'Stay online to receive instant pickup requests in your vehicle category.'
                      : 'Toggle to ONLINE to start accepting freight bookings and earning.'}
                  </p>
                </div>

                {currentDriver.isOnline && (
                  <button
                    onClick={() => setShowIncomingTripModal(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
                  >
                    Simulate Incoming Trip Offer
                  </button>
                )}
              </div>
            )}

            {/* Quick Earnings Bar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Today's Earnings</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">₹{currentDriver.wallet.todayEarnings}</div>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Available Balance</div>
                <div className="text-lg font-black text-white mt-0.5">₹{currentDriver.wallet.balance}</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: EARNINGS & PAYOUTS ================= */}
        {activeDriverTab === 'earnings' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-950 rounded-2xl p-4 border border-emerald-700/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
                  <Wallet className="w-4 h-4" />
                  <span>SwifLoad Driver Wallet</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                  UPI Instant Transfer
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-300">Withdrawable Balance</div>
                <div className="text-3xl font-black text-white mt-0.5">₹{currentDriver.wallet.balance}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Pending IMPS Payout</div>
                  <div className="font-bold text-amber-300">₹{currentDriver.wallet.pendingPayout}</div>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1"
                >
                  <span>Request Payout</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
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
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-between z-30 shadow-2xl">
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
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'earnings' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Earnings</span>
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

      {/* ================= MODAL: INCOMING TRIP SIMULATOR ================= */}
      {showIncomingTripModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl animate-pulse">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">⚡ New Trip Request!</span>
              <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">25s Left</span>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-slate-400">Guaranteed Driver Payout</div>
              <div className="text-3xl font-black text-emerald-400">₹480</div>
              <div className="text-xs text-slate-400 mt-0.5">Est. Distance: 7.2 km (Tata Ace)</div>
            </div>

            <div className="space-y-2 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-200">Pickup: Koramangala 4th Block (1.2 km away)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="font-semibold text-slate-200">Drop: Indiranagar 100ft Road</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowIncomingTripModal(false)}
                className="flex-1 py-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  showToast('Trip offer accepted!');
                  setShowIncomingTripModal(false);
                }}
                className="flex-1 py-3 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg"
              >
                ACCEPT TRIP
              </button>
            </div>
          </div>
        </div>
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
                    Bengaluru Hub
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Register your vehicle and submit KYC documents for fast platform activation
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
                  licenseNumber: driverDL.trim() || 'KA0520230099881',
                  rcNumber: driverRC.trim() || driverVehNumber.trim().toUpperCase(),
                  insuranceNumber: driverInsurance.trim() || 'POL-ICICI-882194',
                  aadhaarNumber: driverAadhaar.trim() || 'XXXX-XXXX-9912',
                  accountName: bankAccName.trim() || driverName.trim(),
                  accountNumber: bankAccNum.trim() || '50100982341098',
                  ifscCode: (bankIFSC.trim() || 'HDFC0000240').toUpperCase(),
                  upiId: driverUpi.trim() || `${driverName.toLowerCase().replace(/\s+/g, '')}@okaxis`,
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
                      placeholder="e.g. Anand Kumar"
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
                      placeholder="e.g. 91081 22938"
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
                    placeholder="e.g. anand.kv@example.com"
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
                      placeholder="e.g. Tata Ace EV / Piaggio Ape"
                      value={driverVehModel}
                      onChange={(e) => setDriverVehModel(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Vehicle Number Plate (KA...) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-03-NA-1844"
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
                      placeholder="e.g. KA0320230099881"
                      value={driverDL}
                      onChange={(e) => setDriverDL(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Vehicle RC Certificate No</label>
                    <input
                      type="text"
                      placeholder="e.g. KA03NA1844"
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

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <span>🛡️</span>
                <span>
                  After submitting, your profile will be sent to the Operations Admin for review and KYC activation.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-xl transition-transform active:scale-95"
              >
                Submit Driver Onboarding Application ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
