'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Power,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  HelpCircle,
  Check,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  UserPlus,
  X,
  Gift,
  Copy,
  Plus,
  ArrowLeft,
  Sparkles,
  Trophy,
  History,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
  PhoneCall,
  Flame,
  Award,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory } from '@/types/logistics';
import { calculateDriverTaskPayout, calculateDriverIncentives } from '@/lib/pricing';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

/**
 * Helper to compute greeting of the day (Changes Required Item 8)
 */
function getGreetingOfDay(): { greeting: string; icon: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good Morning',
      icon: '☀️',
      subtitle: 'Ready to take on early morning freight runs across Coimbatore?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good Afternoon',
      icon: '🌤️',
      subtitle: 'Peak industrial freight hours are active. High demand in peelamedu & ganapathy!',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good Evening',
      icon: '🌆',
      subtitle: 'Evening dispatch runs are live. Wrap up your milestone incentives today!',
    };
  } else {
    return {
      greeting: 'Good Night',
      icon: '🌙',
      subtitle: 'Night dispatch active. Drive safely and keep emergency SOS on standby.',
    };
  }
}

/**
 * Sponsored Ads for Driver App displayed horizontally one below the other (Changes Required Item 15)
 */
const DRIVER_SPONSORED_ADS = [
  {
    id: 'ad_apollo',
    brand: 'Apollo Tyres Commercial',
    title: 'EnduMaxx LT Radial Truck Tyres - 20% Special Discount',
    desc: 'Authorized Coimbatore Fleet Dealer at Singanallur. Free wheel balancing & nitrogen fill for SwifLoad drivers.',
    cta: 'Call Dealer',
    phone: '+919842211223',
    badge: 'Sponsored • Fleet Tyres',
    icon: '🛞',
    gradient: 'from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/30 text-amber-300',
  },
  {
    id: 'ad_castrol',
    brand: 'Castrol VECTON Long Drain',
    title: 'Heavy Duty 15W-40 Synthetic Engine Oil (5L Pack)',
    desc: 'Up to 100,000 km oil drain intervals with System Pro Technology. Buy 5L and get a free fuel filter coupon.',
    cta: 'Locate Station',
    phone: '+919842244556',
    badge: 'Sponsored • Lubricants',
    icon: '🛢️',
    gradient: 'from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'ad_exide',
    brand: 'Exide Commercial Truck Batteries',
    title: 'Zero-Maintenance Commercial Battery with 36 Mo Warranty',
    desc: 'Exchange old scrap battery for instant ₹1,200 cashback at Gandhipuram & Ukkadam Exide Hubs.',
    cta: 'Claim Cashback',
    phone: '+919842277889',
    badge: 'Sponsored • Battery & Power',
    icon: '⚡',
    gradient: 'from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/30 text-blue-300',
  },
  {
    id: 'ad_fitness',
    brand: 'Coimbatore Driver Wellness Hub',
    title: 'Free Annual Driver Health & Eye Checkup Camp',
    desc: 'Organized at Singanallur Transport Nagar. Free optical consultation & fitness certification assistance.',
    cta: 'Book Checkup',
    phone: '+919842299001',
    badge: 'Sponsored • Welfare',
    icon: '🩺',
    gradient: 'from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/30 text-purple-300',
  },
];

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
    incentiveSlabs,
    dispatchTimeoutSecs,
  } = useLogistics();

  // Navigation: 'home' = Driver Home, 'duty' = Dedicated Live Pickup Duty Page (Changes Required Item 16 & 19)
  const [driverPage, setDriverPage] = useState<'home' | 'duty'>('home');
  const [activeDriverTab, setActiveDriverTab] = useState<'trips' | 'earnings' | 'referrals' | 'kyc' | 'support'>('trips');

  // Trip execution inputs
  const [pickupOtpInput, setPickupOtpInput] = useState<string>('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<string>('');
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>('');

  // Modals
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [showIncomingTripModal, setShowIncomingTripModal] = useState<boolean>(false);
  const [dismissedTripIds, setDismissedTripIds] = useState<string[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showIncentivesModal, setShowIncentivesModal] = useState<boolean>(false);
  const [showDriverTopupModal, setShowDriverTopupModal] = useState<boolean>(false);
  const [walletModalTab, setWalletModalTab] = useState<'recharge' | 'withdraw'>('recharge');
  const [driverTopupAmt, setDriverTopupAmt] = useState<number>(200);

  // Referrals & Onboarding
  const [driverReferralCopied, setDriverReferralCopied] = useState<boolean>(false);
  const [referredByDriverCode, setReferredByDriverCode] = useState<string>('');
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

  // Negative balance rule (Changes Required Item 11):
  // If amount is more than minus Rs. 200 (i.e. balance <= -200), blocked from getting pickup calls.
  const isDriverBlocked = currentDriver.wallet.balance <= -200;

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

  // Active incoming task popup target (blocked drivers do NOT receive pickup calls)
  const activeIncomingTrip =
    !isDriverBlocked && !assignedTrip && currentDriver.isOnline
      ? availableGroupTrips.find((t) => !dismissedTripIds.includes(t.id)) || null
      : null;

  // Completed trips by this driver
  const completedDriverTrips = trips.filter(
    (t) => t.driverId === currentDriver.id && t.status === 'DELIVERED'
  );

  // Incentives calculation based on completed calls and configured slabs (Changes Required Item 14)
  const incentiveResult = calculateDriverIncentives(
    completedDriverTrips.length,
    incentiveSlabs || []
  );

  const greetingInfo = getGreetingOfDay();

  // Reverse chronological transactions (Changes Required Item 13)
  const reverseChronologicalTx = [...(currentDriver.wallet.transactions || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Reverse chronological completed trips
  const reverseChronologicalTrips = [...completedDriverTrips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      {/* ================= TOP DRIVER BAR ================= */}
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
                {isDriverBlocked && (
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Blocked
                  </span>
                )}
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

        {/* Row 2: Secondary Quick Bar (Switch Driver, Quick Navigation & Register Partner) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Driver:</span>
            <select
              value={currentDriver.id}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none truncate max-w-[170px]"
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
            {/* Refer & Earn Shortcut */}
            <button
              onClick={() => {
                setDriverPage('home');
                setActiveDriverTab('referrals');
              }}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center space-x-1"
              title="Refer Drivers or Customers"
            >
              <Gift className="w-3 h-3" />
              <span className="hidden sm:inline">Refer & Earn</span>
            </button>

            {/* Register New Partner */}
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
            onClick={() => {
              setDriverPage('home');
              setActiveDriverTab('kyc');
            }}
            className="text-[11px] underline font-semibold text-amber-200"
          >
            View Docs
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================= VIEW 1: DRIVER HOME PAGE ====================== */}
      {/* ========================================================================= */}
      {driverPage === 'home' && (
        <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-xl mx-auto w-full">
          {/* Item 8: Greeting of the Day at the top of Home Page */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{greetingInfo.icon}</span>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {greetingInfo.greeting}, {currentDriver.name.split(' ')[0]}!
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {greetingInfo.subtitle}
                </p>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded-xl font-mono shrink-0">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* ================= TOP METRIC BUTTON CARDS ================= */}
          {/* Items 9, 10, 11, 12, 13, 14 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Today's Earnings Button (Item 12 & 13) */}
            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 shadow flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Today&apos;s Earnings
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{currentDriver.wallet.todayEarnings}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {completedDriverTrips.length} Trip(s) Completed
                </div>
              </div>

              {/* Item 13: View History option at bottom of today's earnings */}
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-400 hover:text-emerald-300 group"
              >
                <span className="flex items-center space-x-1">
                  <History className="w-3 h-3 text-emerald-400" />
                  <span>View History</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* 2. Total Incentives Button (Item 14 - Slabs configurable on Admin Portal) */}
            <button
              type="button"
              onClick={() => setShowIncentivesModal(true)}
              className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 shadow text-left flex flex-col justify-between hover:border-amber-500/50 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>Total Incentives</span>
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    Admin Slabs
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  ₹{incentiveResult.totalIncentive}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {incentiveResult.nextSlab ? (
                    <span>
                      {incentiveResult.tripsToNextSlab} more calls for{' '}
                      <strong className="text-amber-300">₹{incentiveResult.nextSlab.incentiveAmount}</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Top milestone achieved!</span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                <span>View Incentive Slabs</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            {/* 3. Overall Wallet Balance Button (Item 9, 10, 11 - Max Cap ₹200, Recharge & Withdraw) */}
            <button
              type="button"
              onClick={() => {
                setWalletModalTab('recharge');
                setShowDriverTopupModal(true);
              }}
              className={`rounded-2xl p-3.5 border shadow text-left flex flex-col justify-between transition-colors group ${
                isDriverBlocked
                  ? 'bg-rose-950/40 border-rose-700/80 hover:border-rose-500'
                  : currentDriver.wallet.balance < 0
                  ? 'bg-amber-950/30 border-amber-800/60 hover:border-amber-500'
                  : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    <span>Wallet Balance</span>
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isDriverBlocked
                        ? 'bg-rose-500/30 text-rose-300'
                        : currentDriver.wallet.balance < 0
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isDriverBlocked ? 'BLOCKED' : currentDriver.wallet.balance < 0 ? 'Dues' : 'Max Cap ₹200'}
                  </span>
                </div>

                <div
                  className={`text-2xl font-black mt-1 ${
                    isDriverBlocked
                      ? 'text-rose-400'
                      : currentDriver.wallet.balance < 0
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {currentDriver.wallet.balance < 0
                    ? `-₹${Math.abs(currentDriver.wallet.balance)}`
                    : `₹${currentDriver.wallet.balance}`}
                </div>

                <div className="text-[10px] text-slate-400 mt-0.5">
                  Max Cap: ₹200 • {isDriverBlocked ? 'Exceeds -₹200 limit' : 'Active'}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Recharge / Withdraw</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>

          {/* ================= ITEM 11: NEGATIVE BALANCE BLOCK BANNER ================= */}
          {isDriverBlocked && (
            <div className="bg-rose-950/80 border-2 border-rose-600 rounded-3xl p-4.5 space-y-3 shadow-2xl animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-rose-200 uppercase tracking-wide">
                    🚨 Pickup Calls Blocked: Debt Exceeds -₹200
                  </h4>
                  <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                    Your current wallet balance is{' '}
                    <strong className="text-white underline font-mono">
                      -₹{Math.abs(currentDriver.wallet.balance)}
                    </strong>
                    . Per platform rules, when dues exceed -₹200, pickup calls are blocked until you recharge.
                  </p>
                  <p className="text-[11px] text-rose-200/90 mt-1">
                    <strong>Rule:</strong> Minimal recharge is <strong>₹200</strong>. Example: If balance is -₹200 and you recharge ₹300, your new wallet value will be <strong>₹100</strong> (-200 + 300 = 100).
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDriverTopupAmt(200);
                    setWalletModalTab('recharge');
                    setShowDriverTopupModal(true);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Recharge Now (Min ₹200 to Unblock)</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= ITEM 16 & 19: PROMINENT WELCOME BUTTON ================= */}
          {/* Clicking on it will take the driver to a dedicated page for live pickup calls */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 border-2 border-emerald-500/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live Dispatch Terminal
                </span>
                <h3 className="text-lg font-black text-white">
                  Welcome to Duty, Partner!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm">
                  Access the live Coimbatore dispatch map, interactive 10-second pickup pop-ups, and active trip GPS navigation.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                🚀
              </div>
            </div>

            {assignedTrip && (
              <div className="p-3 bg-emerald-900/40 border border-emerald-600/50 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Active Trip in Progress: {assignedTrip.bookingCode}</span>
                </div>
                <span className="text-emerald-300 font-black">₹{assignedTrip.fare.driverEarnings}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDriverPage('duty')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-95 group"
            >
              <span>Welcome / Enter Live Pickup Calls Terminal</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Quick tab views (Referrals, KYC, Support) when selected from bottom nav */}
          {activeDriverTab === 'referrals' && (
            <div className="bg-slate-950 rounded-3xl p-5 border border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <span>🎁 Driver Partner Refer & Earn</span>
                </h4>
                <button
                  onClick={() => setActiveDriverTab('trips')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-300 uppercase font-bold">Your Referral Code</div>
                  <div className="font-mono text-lg font-black text-white">{currentDriver.referralCode || 'SWIF-DRV01-44'}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentDriver.referralCode || 'SWIF-DRV01-44');
                    setDriverReferralCopied(true);
                    showToast('Driver referral code copied!');
                    setTimeout(() => setDriverReferralCopied(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  {driverReferralCopied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          )}

          {activeDriverTab === 'kyc' && (
            <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">KYC & Vehicle Documents</h4>
                <button onClick={() => setActiveDriverTab('trips')} className="text-slate-400">✕ Close</button>
              </div>
              <div className="space-y-2">
                {currentDriver.kycDocuments.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                    <div>
                      <div className="font-semibold text-slate-200">{doc.docType.replace('_', ' ')}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{doc.docNumber}</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDriverTab === 'support' && (
            <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Driver Partner SOS</h4>
                <button onClick={() => setActiveDriverTab('trips')} className="text-slate-400">✕ Close</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+918023456780"
                  className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-center font-bold flex flex-col items-center space-y-1"
                >
                  <Phone className="w-5 h-5 text-rose-400" />
                  <span>24/7 SOS Call</span>
                </a>
                <a
                  href="https://wa.me/919845012345?text=Driver%20Partner%20Help%20Request"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-teal-950/60 border border-teal-800 rounded-xl text-teal-300 text-center font-bold flex flex-col items-center space-y-1"
                >
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                  <span>WhatsApp Help</span>
                </a>
              </div>
            </div>
          )}

          {/* ================= ITEM 15: SPONSORED ADS SECTION ================= */}
          {/* Similar to Customer App, displayed horizontally one below the other at the bottom */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Featured Partner Deals & Driver Benefits
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Sponsored</span>
            </div>

            <div className="space-y-2.5">
              {DRIVER_SPONSORED_ADS.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-gradient-to-r ${ad.gradient} p-4 rounded-2xl border shadow-md flex items-start justify-between gap-3`}
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-xl shrink-0 shadow">
                      {ad.icon}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                          {ad.badge}
                        </span>
                        <span className="text-xs font-black text-white truncate">{ad.brand}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 leading-snug">
                        {ad.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {ad.desc}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${ad.phone}`}
                    className="shrink-0 self-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition-colors shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="whitespace-nowrap">{ad.cta}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 2: DEDICATED LIVE PICKUP DUTY PAGE =============== */}
      {/* ================= Items 16, 19, 20, 21, 22, 23 ========================== */}
      {/* ========================================================================= */}
      {driverPage === 'duty' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Duty Top Header with Back to Home Button */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live Duty Terminal
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full">
            {/* If driver is blocked due to negative balance (Item 11) */}
            {isDriverBlocked && (
              <div className="bg-rose-950 border-2 border-rose-600 rounded-3xl p-5 space-y-3 shadow-2xl text-center">
                <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-base font-black text-rose-200 uppercase">
                  Terminal Blocked: Dues Exceed -₹200
                </h3>
                <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed">
                  Your wallet is currently{' '}
                  <strong className="text-white underline font-mono">
                    -₹{Math.abs(currentDriver.wallet.balance)}
                  </strong>
                  . Live pickup calls are suspended until you perform a minimal recharge of ₹200.
                </p>
                <div className="pt-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setDriverTopupAmt(200);
                      setWalletModalTab('recharge');
                      setShowDriverTopupModal(true);
                    }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                  >
                    Recharge ₹200 Now to Resume
                  </button>
                </div>
              </div>
            )}

            {/* Item 19: Maps moved from Home Page to this Duty Page */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-xl space-y-2">
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {assignedTrip ? `Route Navigation: ${assignedTrip.bookingCode}` : 'Coimbatore Live Dispatch Radar'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentDriver.groupName || 'Central Fleet'}
                </span>
              </div>

              {assignedTrip ? (
                <LeafletMap
                  pickup={{ lat: assignedTrip.pickup.lat, lng: assignedTrip.pickup.lng, label: 'Pickup' }}
                  drop={{ lat: assignedTrip.drop.lat, lng: assignedTrip.drop.lng, label: 'Drop' }}
                  driver={{
                    lat: assignedTrip.driverLocation?.lat || currentDriver.currentLocation.lat,
                    lng: assignedTrip.driverLocation?.lng || currentDriver.currentLocation.lng,
                    label: 'You (Driver)',
                  }}
                  targetDestination={assignedTrip.status === 'IN_TRANSIT' ? 'drop' : 'pickup'}
                  className="h-56 w-full rounded-xl border border-slate-800"
                />
              ) : (
                <LeafletMap
                  driver={{
                    lat: currentDriver.currentLocation.lat,
                    lng: currentDriver.currentLocation.lng,
                    label: `${currentDriver.name} (Live)`,
                  }}
                  className="h-56 w-full rounded-xl border border-slate-800"
                />
              )}
            </div>

            {/* ================= ACTIVE ASSIGNED TRIP WORKFLOW ================= */}
            {assignedTrip && (
              <div className="bg-slate-950 rounded-3xl border border-emerald-500/80 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Active Trip: {assignedTrip.bookingCode}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2.5 py-1 rounded-xl">
                    Net Earnings: ₹{assignedTrip.fare.driverEarnings}
                  </span>
                </div>

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
                    Open Google Maps GPS (
                    {assignedTrip.status === 'AT_PICKUP' || assignedTrip.status === 'IN_TRANSIT' ? 'To Drop' : 'To Pickup'}
                    )
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Multi-Pickup & Multi-Drop Locations (Items 17 & 21) */}
                <div className="space-y-2 text-xs bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  {/* Pickups */}
                  {assignedTrip.pickups && assignedTrip.pickups.length > 1 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        Multi-Pickup Stops ({assignedTrip.pickups.length})
                      </div>
                      {assignedTrip.pickups.map((p, idx) => (
                        <div key={idx} className="flex items-start space-x-2 pl-1 border-l-2 border-emerald-500">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-200">
                              Stop #{idx + 1}: {p.area}
                            </div>
                            <div className="text-[11px] text-slate-400">{p.address}</div>
                            {/* Item 21: Pickup contact number clickable */}
                            <a
                              href={`tel:${p.senderOrReceiverPhone || assignedTrip.customerPhone}`}
                              className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>Call Contact: {p.senderOrReceiverPhone || assignedTrip.customerPhone}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-200">Pickup ({assignedTrip.pickup.area})</div>
                        <div className="text-[11px] text-slate-400">{assignedTrip.pickup.address}</div>
                        {/* Item 21: Clickable contact number */}
                        <a
                          href={`tel:${assignedTrip.pickup.senderOrReceiverPhone || assignedTrip.customerPhone}`}
                          className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Call: {assignedTrip.pickup.senderOrReceiverPhone || assignedTrip.customerPhone} ({assignedTrip.pickup.senderOrReceiverName || assignedTrip.customerName})</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Drops */}
                  <div className="pt-2 border-t border-slate-800">
                    {assignedTrip.drops && assignedTrip.drops.length > 1 ? (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold text-rose-400">
                          Multi-Drop Stops ({assignedTrip.drops.length})
                        </div>
                        {assignedTrip.drops.map((d, idx) => (
                          <div key={idx} className="flex items-start space-x-2 pl-1 border-l-2 border-rose-500">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-200">
                                Drop #{idx + 1}: {d.area}
                              </div>
                              <div className="text-[11px] text-slate-400">{d.address}</div>
                              <a
                                href={`tel:${d.senderOrReceiverPhone || '9842211990'}`}
                                className="text-[11px] text-rose-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                              >
                                <Phone className="w-3 h-3 text-rose-400" />
                                <span>Call Drop Contact: {d.senderOrReceiverPhone || 'Receiver'}</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-200">Drop Destination ({assignedTrip.drop.area})</div>
                          <div className="text-[11px] text-slate-400">{assignedTrip.drop.address}</div>
                          <a
                            href={`tel:${assignedTrip.drop.senderOrReceiverPhone || '9842211990'}`}
                            className="text-[11px] text-rose-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                          >
                            <Phone className="w-3 h-3 text-rose-400" />
                            <span>Call Receiver: {assignedTrip.drop.senderOrReceiverPhone || 'Recipient'} ({assignedTrip.drop.senderOrReceiverName || 'Receiver'})</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TRIP EXECUTION ACTIONS BY STATUS */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Trip Stage</div>

                  {assignedTrip.status === 'DRIVER_ASSIGNED' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                    >
                      I Am En Route to Pickup Location ➔
                    </button>
                  )}

                  {assignedTrip.status === 'ARRIVING_PICKUP' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
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
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                    >
                      I Have Reached Drop Destination ➔
                    </button>
                  )}

                  {assignedTrip.status === 'ARRIVED_DESTINATION' && (
                    <div className="space-y-3">
                      <div className="text-xs text-amber-300 font-medium">
                        Collect Drop OTP from recipient & confirm delivery:
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
            )}

            {/* ================= ITEMS 20, 21, 22, 23: INCOMING ORDER POP-UPS ON DUTY PAGE ================= */}
            {!assignedTrip && !isDriverBlocked && availableGroupTrips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Live Pickup Calls For Your Fleet Group ({availableGroupTrips.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Timeframe: {dispatchTimeoutSecs}s
                  </span>
                </div>

                {availableGroupTrips.map((order) => {
                  const payout = calculateDriverTaskPayout(
                    currentDriver.currentLocation,
                    order.pickup,
                    order.distanceKm,
                    order.customerType || 'regular',
                    customerSlabConfigs
                  );

                  const countdown = order.dispatchCountdownSecs ?? dispatchTimeoutSecs;
                  const progressPct = Math.max(0, Math.min(100, (countdown / dispatchTimeoutSecs) * 100));

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-950 border-2 border-emerald-500/80 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
                    >
                      {/* Item 22: Clearly visible 10-second countdown timer header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            Order {order.bookingCode}
                          </span>
                        </div>

                        {/* Visible 10s Timer Badge */}
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-amber-400 h-full transition-all duration-1000 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                            ⏳ {countdown}s
                          </span>
                        </div>
                      </div>

                      {/* Item 20: Charges Applicable */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Total Task Fare</div>
                          <div className="text-xl font-black text-white mt-0.5">₹{payout.grossFare}</div>
                        </div>
                        <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/60">
                          <div className="text-[10px] uppercase font-bold text-emerald-300">Net Take-Home</div>
                          <div className="text-xl font-black text-emerald-400 mt-0.5">₹{payout.netEarnings}</div>
                        </div>
                      </div>

                      {/* Items 20 & 21: Pickup & Drop Locations with Touchable Contact Numbers */}
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                        {/* Pickup Stop(s) */}
                        {order.pickups && order.pickups.length > 1 ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-emerald-400">Multi-Pickup ({order.pickups.length} stops)</span>
                            {order.pickups.map((p, idx) => (
                              <div key={idx} className="pl-2 border-l-2 border-emerald-500 text-slate-300">
                                <div className="font-bold text-white">Stop #{idx + 1}: {p.area}</div>
                                <div className="text-[11px] text-slate-400">{p.address}</div>
                                {/* Touch to call customer (Item 21) */}
                                <a
                                  href={`tel:${p.senderOrReceiverPhone || order.customerPhone}`}
                                  className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>Tap to Call: {p.senderOrReceiverPhone || order.customerPhone}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-start space-x-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-200">Pickup: {order.pickup.area}</div>
                              <div className="text-[11px] text-slate-400">{order.pickup.address}</div>
                              {/* Item 21: Touch contact number to contact customer */}
                              <a
                                href={`tel:${order.pickup.senderOrReceiverPhone || order.customerPhone}`}
                                className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Tap to Call Sender: {order.pickup.senderOrReceiverPhone || order.customerPhone}</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Drop Stop(s) */}
                        <div className="pt-2 border-t border-slate-800">
                          {order.drops && order.drops.length > 1 ? (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase text-rose-400">Multi-Drop ({order.drops.length} stops)</span>
                              {order.drops.map((d, idx) => (
                                <div key={idx} className="pl-2 border-l-2 border-rose-500 text-slate-300">
                                  <div className="font-bold text-white">Drop #{idx + 1}: {d.area}</div>
                                  <div className="text-[11px] text-slate-400">{d.address}</div>
                                  <a
                                    href={`tel:${d.senderOrReceiverPhone || '9842211990'}`}
                                    className="text-[11px] text-rose-400 hover:underline flex items-center space-x-1 mt-0.5 font-bold"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>Tap to Call Recipient: {d.senderOrReceiverPhone || 'Receiver'}</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-start space-x-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-200">Drop: {order.drop.area} ({order.distanceKm} km)</div>
                                <div className="text-[11px] text-slate-400">{order.drop.address}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cargo info */}
                      <div className="text-[11px] text-slate-400 px-1 flex items-center justify-between">
                        <span>Cargo: {order.shipment.goodsCategory} (~{order.shipment.approxWeightKg}kg)</span>
                        <span>Approach: {payout.driverDistanceToPickupKm}km to pickup</span>
                      </div>

                      {/* Items 22 & 23: Skip Task & Accept Task Buttons */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-800">
                        {/* Item 23: Option to skip tasks */}
                        <button
                          type="button"
                          onClick={() => {
                            passTripToNextGroup(order.id);
                            setDismissedTripIds((prev) => [...prev, order.id]);
                            showToast(`Skipped task ${order.bookingCode}`);
                          }}
                          className="flex-1 py-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                        >
                          Skip Task
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const res = acceptTripByDriver(order.id, currentDriver.id);
                            if (res.success) {
                              showToast(`Accepted task ${order.bookingCode}! Drive to pickup.`);
                            }
                          }}
                          className="flex-1 py-3 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                          Accept Task (₹{payout.netEarnings})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* When driver is online and idle with no orders */}
            {!assignedTrip && !isDriverBlocked && availableGroupTrips.length === 0 && (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                  {currentDriver.isOnline ? '📡' : '💤'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {currentDriver.isOnline ? 'Radar Active & Listening for Bookings' : 'Duty Terminal Offline'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {currentDriver.isOnline
                      ? `Your vehicle is active in fleet zone ${currentDriver.groupName || 'Central Hub'}. Customer bookings in Coimbatore will pop up here with a ${dispatchTimeoutSecs}s countdown.`
                      : 'Toggle your status to ONLINE at top right to start receiving freight calls.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DRIVER BOTTOM NAVIGATION ================= */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-between z-30 shadow-2xl">
        <button
          onClick={() => setDriverPage('home')}
          className={`flex flex-col items-center space-y-0.5 ${
            driverPage === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setDriverPage('duty')}
          className={`flex flex-col items-center space-y-0.5 relative ${
            driverPage === 'duty' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">Live Duty</span>
          {availableGroupTrips.length > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            setDriverPage('home');
            setWalletModalTab('recharge');
            setShowDriverTopupModal(true);
          }}
          className="flex flex-col items-center space-y-0.5 relative text-slate-500 font-medium hover:text-emerald-400"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Wallet</span>
          {isDriverBlocked && (
            <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => {
            setDriverPage('home');
            setActiveDriverTab('referrals');
          }}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'referrals' && driverPage === 'home'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-500 font-medium'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px]">Refer</span>
        </button>

        <button
          onClick={() => {
            setDriverPage('home');
            setActiveDriverTab('support');
          }}
          className={`flex flex-col items-center space-y-0.5 ${
            activeDriverTab === 'support' && driverPage === 'home'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-500 font-medium'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">SOS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ========================= MODALS & OVERLAYS ============================= */}
      {/* ========================================================================= */}

      {/* Item 13: Reverse Chronological Transaction History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Transaction History (Reverse Chronological)</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Wallet Ledger Entries ({reverseChronologicalTx.length})
              </div>

              {reverseChronologicalTx.length > 0 ? (
                reverseChronologicalTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                          tx.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-xs ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                      </span>
                      <div className="text-[9px] text-slate-500">Bal: ₹{tx.balanceAfter}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">No transactions recorded yet.</div>
              )}

              {/* Completed Trips in reverse chronological order */}
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-3 border-t border-slate-800">
                Completed Trips History ({reverseChronologicalTrips.length})
              </div>

              {reverseChronologicalTrips.length > 0 ? (
                reverseChronologicalTrips.map((tr) => (
                  <div key={tr.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{tr.bookingCode}</div>
                      <div className="text-[11px] text-slate-400">
                        {tr.pickup.area} ➔ {tr.drop.area} ({tr.distanceKm} km)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tr.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400 text-sm">+₹{tr.fare.driverEarnings}</div>
                      <div className="text-[10px] text-slate-500">Fare: ₹{tr.fare.totalFare}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-slate-500 text-[11px]">No completed trips yet.</div>
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* Item 14: Incentive Slabs Modal (Configurable on Admin Portal) */}
      {showIncentivesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Daily Incentive Slabs</h3>
              </div>
              <button onClick={() => setShowIncentivesModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                Incentives are configured dynamically by the Operations Admin. Reach trip milestones today to unlock direct wallet cash:
              </p>

              <div className="space-y-2">
                {(incentiveSlabs || []).map((slab) => {
                  const isAchieved = completedDriverTrips.length >= slab.minCompletedTrips;
                  return (
                    <div
                      key={slab.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isAchieved
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{isAchieved ? '🏆' : '🎯'}</span>
                        <div>
                          <div className="font-bold text-white">
                            {slab.minCompletedTrips} Calls / Trips
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isAchieved ? 'Milestone Cleared' : `Need ${Math.max(0, slab.minCompletedTrips - completedDriverTrips.length)} more calls`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-amber-400">
                          ₹{slab.incentiveAmount}
                        </span>
                        <div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isAchieved ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isAchieved ? 'Earned' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Progress Today:</span>
                <span className="font-bold text-white">
                  {completedDriverTrips.length} Calls Completed • ₹{incentiveResult.totalIncentive} Earned
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIncentivesModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Items 9, 10, 11: Driver Wallet Modal (Recharge & Withdraw, Max Cap ₹200, Minimal ₹200 Rule) */}
      {showDriverTopupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Driver Partner Wallet</h3>
                  <p className="text-[11px] text-slate-400">
                    Balance:{' '}
                    <span className={currentDriver.wallet.balance < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                    </span>{' '}
                    (Max Cap: ₹200)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDriverTopupModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Tab: Recharge vs Withdraw (Item 10) */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setWalletModalTab('recharge')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  walletModalTab === 'recharge' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                + Recharge
              </button>
              <button
                type="button"
                onClick={() => setWalletModalTab('withdraw')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  walletModalTab === 'withdraw' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Withdraw Amount
              </button>
            </div>

            {/* RECHARGE TAB */}
            {walletModalTab === 'recharge' && (
              <div className="space-y-3 text-xs">
                {isDriverBlocked && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-700/80 rounded-xl text-[11px] text-rose-300">
                    ⚠️ Account is blocked from receiving calls. Minimal recharge required is <strong>₹200</strong>.
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Recharge Amount (₹) {isDriverBlocked && <span className="text-rose-400">*Min ₹200</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-emerald-400">₹</span>
                    <input
                      type="number"
                      min={isDriverBlocked ? 200 : 50}
                      step="50"
                      value={driverTopupAmt}
                      onChange={(e) => setDriverTopupAmt(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-lg text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[200, 300, 500, 1000].map((amt) => (
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

                {/* Example math explanation (Item 11) */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-white">Wallet Calculation Preview:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Current Wallet:</span>
                    <span className="font-mono">{currentDriver.wallet.balance}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Recharge Amount:</span>
                    <span className="font-mono">+{driverTopupAmt}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                    <span>Resulting Balance:</span>
                    <span className="font-mono">
                      ₹{Math.min(200, currentDriver.wallet.balance + driverTopupAmt)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">
                    * Maximum wallet balance cap is ₹200. Example: -₹200 + ₹300 = ₹100.
                  </p>
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
                      if (isDriverBlocked && driverTopupAmt < 200) {
                        showToast('Minimal recharge must be at least ₹200 when blocked.');
                        return;
                      }
                      topUpDriverWallet(currentDriver.id, driverTopupAmt, 'Driver wallet self-recharge');
                      setShowDriverTopupModal(false);
                      showToast(`Recharged ₹${driverTopupAmt} to ${currentDriver.name}'s wallet!`);
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                  >
                    Confirm Recharge ₹{driverTopupAmt}
                  </button>
                </div>
              </div>
            )}

            {/* WITHDRAW TAB (Item 10) */}
            {walletModalTab === 'withdraw' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Withdraw your available wallet balance directly to your bank account ({currentDriver.bankDetails.accountName}):
                </p>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Amount to Withdraw (₹)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    min={10}
                    max={Math.max(0, currentDriver.wallet.balance)}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-black text-lg focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Available balance: ₹{Math.max(0, currentDriver.wallet.balance)}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Direct UPI:</span>
                    <span className="text-white font-mono">{currentDriver.bankDetails.upiId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IFSC Code:</span>
                    <span className="text-white font-mono">{currentDriver.bankDetails.ifscCode}</span>
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
                    disabled={currentDriver.wallet.balance <= 0 || payoutAmount > currentDriver.wallet.balance}
                    onClick={() => {
                      requestDriverPayout(currentDriver.id, payoutAmount);
                      setShowDriverTopupModal(false);
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Registration Modal */}
      {showDriverRegModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <span>⚡ Join SwifLoad Driver Fleet</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Coimbatore Hub
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
                setDriverPage('home');
                setActiveDriverTab('kyc');
              }}
              className="space-y-4 text-xs"
            >
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
              </div>

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
                      placeholder="e.g. Tata Ace Gold"
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
