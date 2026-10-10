'use client';

import React, { useState, useEffect } from 'react';
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
  Sun,
  Moon,
  Megaphone,
  Receipt,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Zap,
  Menu,
  Bell,
  CheckCheck,
  Home,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory, GoodsCategory, PaymentMethod, LocationPoint, CustomerType, WalletTransaction } from '@/types/logistics';
import { calculateDistanceKm, calculateCustomerQuotedSlabFare, estimateDurationMins, calculateMultiStopDistanceKm } from '@/lib/pricing';
import FlowerShowerSplash from './FlowerShowerSplash';
import CustomerSideMenu from './CustomerSideMenu';

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
    advanceTripStatus,
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
    updateCustomerProfile,
  } = useLogistics();

  // Active sub-tab in Customer App: 'book' | 'tracking' | 'history' | 'transactions' | 'wallet' | 'referrals' | 'profile' | 'support'
  const [activeTab, setActiveTab] = useState<'book' | 'tracking' | 'history' | 'transactions' | 'wallet' | 'referrals' | 'profile' | 'support'>('book');

  // Dark / Light Mode state for visual comfort (Requirement 4)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('swifload_customer_theme');
      if (saved) setDarkMode(saved === 'dark');
    } catch {}
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('swifload_customer_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Flower Shower Splash Greeting state (Changes Required Item 6)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Side Menu Bar Drawer state (Changes Required Item 10 & 18)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Top Ribbon Notifications Modal & Data (Changes Required Item 15)
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: '🎉 Welcome Offer: Flat 25% OFF',
      message: 'Use coupon code SWIF25 for up to ₹150 off your intra-city trip in Coimbatore.',
      time: 'Just now',
      read: false,
    },
    {
      id: 'notif_2',
      title: '⚡ Instant ₹50 UPI Cashback',
      message: 'Pay via Google Pay or UPI to get flat ₹50 cashback credited to your SwifLoad wallet.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 'notif_3',
      title: '🛡️ Two-Way OTP Handshake Required',
      message: 'Always share 4-digit Pickup and Drop OTP with driver partners for verified custody.',
      time: '2 hours ago',
      read: false,
    },
  ]);

  // Company Promo Code & Coupon States (Changes Required Item 17 & 35)
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [selectedOfferModal, setSelectedOfferModal] = useState<any | null>(null);

  // Earmarked Ad Space state (Requirement 3)
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [selectedAdModal, setSelectedAdModal] = useState<any | null>(null);

  // Transactions ledger filter (Requirement 9)
  const [txFilter, setTxFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT' | 'REWARD_POINTS'>('ALL');

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
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('4wheeler_lmv');
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategory>('Industrial Equipment');
  const [weightKg, setWeightKg] = useState<number>(180);
  const [hasHelper, setHasHelper] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Machined engineering components, handle carefully');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_PAYMENT');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduleTime, setScheduleTime] = useState<string>('Tomorrow, 10:00 AM');
  const [senderName, setSenderName] = useState<string>(currentCustomer?.name || 'Kavitha Sundaram');
  const [senderPhone, setSenderPhone] = useState<string>(currentCustomer?.phone || '+91 98422 19283');
  const [receiverName, setReceiverName] = useState<string>('Venkatesh Babu');
  const [receiverPhone, setReceiverPhone] = useState<string>('+91 98422 88712');
  const [showShipmentModal, setShowShipmentModal] = useState<boolean>(false);

  // Vehicle Category & Subtype Selection (Changes Required.txt - Items 12 to 19)
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<'2wheeler' | '3wheeler' | '4wheeler' | 'ev'>('4wheeler');
  const [twoWheelerSubtype, setTwoWheelerSubtype] = useState<'moto_bike' | 'scooter'>('moto_bike');
  const [threeWheelerSubtype, setThreeWheelerSubtype] = useState<'open_body' | 'closed_body'>('open_body');
  const [fourWheelerSubtype, setFourWheelerSubtype] = useState<'open_body' | 'closed_body'>('open_body');
  const [evSubtype, setEvSubtype] = useState<'ev_2wheeler' | 'ev_3wheeler' | 'ev_4wheeler'>('ev_3wheeler');

  // Popup modal state for vehicle sub-selection (3wheeler, 4wheeler, ev, 2wheeler)
  const [vehicleModalCategory, setVehicleModalCategory] = useState<'2wheeler' | '3wheeler' | '4wheeler' | 'ev' | null>(null);

  // Dedicated Booking Page Screen state (Moves booking & map away from home screen)
  const [bookingScreenActive, setBookingScreenActive] = useState<boolean>(false);

  const getVehicleSubtypeDisplay = () => {
    if (selectedVehicleCategory === '2wheeler') {
      return twoWheelerSubtype === 'moto_bike' ? 'Two Wheeler (Moto Bike)' : 'Two Wheeler (Scooter Type)';
    }
    if (selectedVehicleCategory === '3wheeler') {
      return threeWheelerSubtype === 'open_body' ? 'Three Wheeler (Open Body)' : 'Three Wheeler (Closed Body)';
    }
    if (selectedVehicleCategory === '4wheeler') {
      return fourWheelerSubtype === 'open_body' ? 'Four Wheeler (Open Body / Tata Ace)' : 'Four Wheeler (Closed Body Container)';
    }
    if (selectedVehicleCategory === 'ev') {
      return evSubtype === 'ev_2wheeler'
        ? 'EV 2-Wheeler (Electric Bike)'
        : evSubtype === 'ev_3wheeler'
        ? 'EV 3-Wheeler (Electric Cargo Auto)'
        : 'EV 4-Wheeler (Tata Ace EV)';
    }
    return 'Four Wheeler';
  };

  const handleProceedToBooking = (category: '2wheeler' | '3wheeler' | '4wheeler' | 'ev') => {
    setSelectedVehicleCategory(category);
    if (category === '2wheeler') {
      setSelectedVehicle('2wheeler');
    } else if (category === '3wheeler') {
      setSelectedVehicle(threeWheelerSubtype === 'open_body' ? '3wheeler' : 'closed_container');
    } else if (category === '4wheeler') {
      setSelectedVehicle(fourWheelerSubtype === 'open_body' ? '4wheeler_lmv' : 'closed_container');
    } else if (category === 'ev') {
      if (evSubtype === 'ev_2wheeler') setSelectedVehicle('2wheeler');
      else if (evSubtype === 'ev_3wheeler') setSelectedVehicle('3wheeler');
      else setSelectedVehicle('4wheeler_lmv');
    }
    setBookingScreenActive(true);
  };

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

  // Multi-pickup or Multi-drop stop support (Changes Required Item 17)
  const [stopMode, setStopMode] = useState<'standard' | 'multi_pickup' | 'multi_drop'>('standard');
  const [extraPickups, setExtraPickups] = useState<LocationPoint[]>([]);
  const [extraDrops, setExtraDrops] = useState<LocationPoint[]>([]);

  // Distance and slab pricing calculation (multi-stop route aware)
  const allRouteStops = stopMode === 'multi_pickup'
    ? [pickupPoint, ...extraPickups, dropPoint]
    : stopMode === 'multi_drop'
    ? [pickupPoint, dropPoint, ...extraDrops]
    : [pickupPoint, dropPoint];

  const distanceKm = calculateMultiStopDistanceKm(allRouteStops);
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

  // SwifLoad Coimbatore Company Offers (Changes Required Item 17 & 35)
  const COMPANY_OFFERS = [
    {
      code: 'SWIF25',
      tickerText: 'Flat 25% OFF',
      title: 'Flat 25% Off (Save up to ₹150)',
      sub: 'Valid across all goods vehicles in Coimbatore hub',
      description: 'Get flat 25% discount on intra-city freight trips across Coimbatore. Maximum discount capped at ₹150 per trip. Applicable on 2-Wheeler, 3-Wheeler cargo auto, Tata Ace, and EV fleet.',
      discountType: 'percentage',
      value: 25,
      maxDiscount: 150,
      badge: 'PROMO CODE',
      icon: '🎉',
    },
    {
      code: 'UPI50',
      tickerText: 'Flat ₹50 Instant Cashback',
      title: 'Flat ₹50 Instant Cashback',
      sub: 'Pay online via UPI or SwifLoad Wallet',
      description: 'Pay freight charges via Google Pay, PhonePe, Paytm, BHIM UPI or SwifLoad wallet balance to receive an instant ₹50 cashback credited directly to your SwifLoad passbook.',
      discountType: 'flat',
      value: 50,
      maxDiscount: 50,
      badge: 'CASHBACK',
      icon: '⚡',
    },
    {
      code: 'FREEHELP',
      tickerText: '100% Free Loading Helper',
      title: '100% Free Loading Helper',
      sub: 'Waive loading & unloading porter charge',
      description: 'Book with an assisted driver helper for zero extra cost! Save ₹150 - ₹250 porter fees on machinery, furniture, textile bales, and hardware shipments.',
      discountType: 'helper',
      value: 100,
      maxDiscount: 250,
      badge: 'FESTIVE SPECIAL',
      icon: '🚚',
    },
  ];

  // Coimbatore Commercial Partner Ads (Changes Required)
  const SPONSORED_PARTNERS = [
    {
      id: 'apollo_tyres',
      name: 'Apollo Commercial Tyres',
      hub: 'Coimbatore Central & Peelamedu',
      tickerTitle: 'Apollo Tyres: Flat 20% Off',
      headline: 'Flat 20% Off Commercial LMV/HMV Tyres',
      description: 'Exclusive partnership for SwifLoad shippers: Flat 20% discount on radial truck & pickup tyres. Includes free computer laser wheel alignment at 8 Coimbatore centers.',
      promoCode: 'APOLLO-SWIF20',
      badge: 'Verified Partner',
      benefit: 'Flat 20% Off + Free Alignment',
      icon: '🛞',
      locations: 'Gandhipuram, Peelamedu, Singanallur, SIDCO Kurichi',
    },
    {
      id: 'exide_batteries',
      name: 'Exide & Amaron Commercial Hub',
      hub: 'Trichy Road & Ganapathy Industrial Core',
      tickerTitle: 'Exide & Amaron: ₹800 Exchange Rebate',
      headline: '₹800 Heavy Commercial Battery Exchange Rebate',
      description: 'Heavy-duty commercial batteries with 36-month on-site replacement warranty across Coimbatore. Instant ₹800 exchange value on old truck or auto batteries.',
      promoCode: 'EXIDE-SWIF800',
      badge: 'Official Battery Partner',
      benefit: '₹800 Instant Battery Exchange Rebate',
      icon: '🔋',
      locations: 'Ramanathapuram, Ganapathy, Thudiyalur, Eachanari',
    },
    {
      id: 'castrol_lubricants',
      name: 'Castrol CRB Commercial Lubes',
      hub: 'SIDCO Industrial Estate Kurichi',
      tickerTitle: 'Castrol CRB: Flat 15% Engine Oil Rebate',
      headline: 'Flat 15% Off Fleet Engine Oil & Lubrication Service',
      description: 'Heavy diesel engine oil specially blended for Tata Ace, Bolero and multi-axle freight carriers. Free 21-point vehicle fluid health checkup across Coimbatore.',
      promoCode: 'CASTROL-CBE15',
      badge: 'Fleet Lubricant Partner',
      benefit: 'Flat 15% Discount + Free Fluid Check',
      icon: '🛢️',
      locations: 'Kurichi SIDCO, Saravanampatti IT Corridor, Ukkadam',
    },
  ];

  const handleApplyCoupon = (code: string) => {
    if (appliedCouponCode === code) {
      setAppliedCouponCode('');
      setCouponDiscount(0);
      showToast('Offer coupon removed');
      return;
    }
    const offer = COMPANY_OFFERS.find((o) => o.code === code);
    if (!offer) {
      showToast('Invalid coupon code');
      return;
    }
    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = Math.min(offer.maxDiscount, Math.round(fareBreakdown.totalFare * 0.25));
    } else if (offer.discountType === 'flat') {
      discount = offer.value;
    } else if (offer.discountType === 'helper') {
      discount = hasHelper ? (fareBreakdown.helperFee || 80) : 50;
    }
    setAppliedCouponCode(code);
    setCouponDiscount(discount);
    showToast(`🎉 Code ${code} applied! Saved ₹${discount}`);
  };

  const finalQuotedFare = Math.max(30, fareBreakdown.totalFare - couponDiscount);

  // Active Trip
  const currentTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleBookNow = () => {
    if (paymentMethod === 'WALLET' && (currentCustomer?.wallet?.balance || 0) < finalQuotedFare) {
      const shortage = Math.ceil(finalQuotedFare - (currentCustomer?.wallet?.balance || 0));
      showToast(`Shortage of ₹${shortage} in your wallet. Please recharge to book.`);
      return;
    }

    const allPickups = stopMode === 'multi_pickup'
      ? [
          { ...pickupPoint, senderOrReceiverName: senderName, contactPhone: senderPhone },
          ...extraPickups.map((p, idx) => ({
            ...p,
            senderOrReceiverName: p.senderOrReceiverName || `Pickup Point ${idx + 2}`,
            contactPhone: p.contactPhone || senderPhone,
          })),
        ]
      : [{ ...pickupPoint, senderOrReceiverName: senderName, contactPhone: senderPhone }];

    const allDrops = stopMode === 'multi_drop'
      ? [
          { ...dropPoint, senderOrReceiverName: receiverName, contactPhone: receiverPhone },
          ...extraDrops.map((d, idx) => ({
            ...d,
            senderOrReceiverName: d.senderOrReceiverName || `Drop Destination ${idx + 2}`,
            contactPhone: d.contactPhone || receiverPhone,
          })),
        ]
      : [{ ...dropPoint, senderOrReceiverName: receiverName, contactPhone: receiverPhone }];

    const newTripId = createBooking({
      pickup: allPickups[0],
      drop: allDrops[0],
      pickups: allPickups,
      drops: allDrops,
      stopType: stopMode === 'multi_pickup' ? 'multi_pickup' : stopMode === 'multi_drop' ? 'multi_drop' : 'single',
      vehicleCategory: selectedVehicle,
      goodsCategory,
      approxWeightKg: Number(weightKg) || 50,
      hasHelperRequired: hasHelper,
      notes: `${notes} [Vehicle: ${getVehicleSubtypeDisplay()}]${stopMode !== 'standard' ? ` [${stopMode === 'multi_pickup' ? `${allPickups.length} Pickups` : `${allDrops.length} Drops`}]` : ''}`,
      paymentMethod,
      customerType: custType,
      scheduledTime: isScheduled ? scheduleTime : 'Instant Now',
      customerName: senderName,
      customerPhone: senderPhone,
    });
    if (newTripId) {
      setBookingScreenActive(false);
      setActiveTab('tracking');
    }
  };

  // Requirement 1 Dashboard Metrics
  const customerTrips = trips.filter(
    (t) => t.customerId === currentCustomer?.id || t.customerPhone === currentCustomer?.phone || !t.customerId
  );
  const totalBookingsCount = customerTrips.length;
  const bookingsCompletedCount = customerTrips.filter((t) => t.status === 'DELIVERED').length;
  const bookingsCancelledCount = customerTrips.filter((t) => t.status === 'CANCELLED').length;
  const referralsMadeCount = referrals.filter(
    (r) => r.referrerId === currentCustomer?.id || r.referrerRole === 'customer'
  ).length;

  // Filtered transactions for Transactions History tab (Requirement 9)
  const allCustomerTransactions = currentCustomer?.wallet?.transactions || [];
  const filteredTransactions = allCustomerTransactions.filter((tx) => {
    if (txFilter === 'ALL') return true;
    if (txFilter === 'CREDIT') return tx.type === 'CREDIT';
    if (txFilter === 'DEBIT') return tx.type === 'DEBIT';
    if (txFilter === 'REWARD_POINTS') return tx.category === 'REWARD_POINTS' || tx.category === 'REFERRAL_BONUS';
    return true;
  });

  const getVehicleIcon = (iconName: string, vehicleId?: string) => {
    if (vehicleId === '2wheeler' || iconName === 'Bike') {
      return <Bike className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    }
    if (vehicleId === '3wheeler' || iconName === 'CarFront') {
      return <CarFront className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
    }
    if (vehicleId === '4wheeler_hmv') {
      return <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
    if (vehicleId === 'open_trailer') {
      return <Container className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
    }
    if (vehicleId === 'closed_container' || iconName === 'Container') {
      return <Container className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    }
    return <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <div className={`flex flex-col h-full pb-20 md:pb-6 transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Customer Header (Changes Required Items 7, 10, 11, 12, 15) */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-3 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-30">
        {/* Left: Side Menu Hamburger Button & SwiftLoad Coimbatore on ONE line */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center shrink-0 border border-white/20"
            title="Open Side Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              ⚡
            </div>
            <h1 className="font-bold text-sm sm:text-base tracking-tight whitespace-nowrap leading-none">
              SwiftLoad Coimbatore
            </h1>
          </div>
        </div>

        {/* Right Edge: Quick Wallet, Notifications, Help & Theme Toggle */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Quick Wallet Balance Badge */}
          <button
            onClick={() => {
              setActiveTab('wallet');
              setBookingScreenActive(false);
            }}
            className="px-2 py-1 text-xs bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg flex items-center space-x-1 transition-all border border-white/20"
            title="Customer Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-300" />
            <span>₹{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}</span>
          </button>

          {/* Notifications Button on Top Ribbon Right Edge */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors relative border border-white/20"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-xs">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* Help Button on Top Ribbon Right Edge */}
          <button
            onClick={() => {
              setActiveTab('support');
              setBookingScreenActive(false);
            }}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
            title="Customer Help & Support"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Main Content Area based on sub-tab */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4">
        {/* ================= TAB 1: BOOKING VIEW (HOME SCREEN OR DEDICATED BOOKING PAGE) ================= */}
        {activeTab === 'book' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {!bookingScreenActive ? (
              /* ========================================================================= */
              /* ======================= SCREEN A: HOME SCREEN =========================== */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* ================= DASHBOARD STATS BAR (COMPACT BUTTONS - ITEMS 14 & 16) ================= */}
                <div className={`rounded-2xl p-3 shadow-sm border space-y-2.5 transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Dashboard - Customer
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Coimbatore Hub
                    </span>
                  </div>

                  {/* 3 Compact Stat Buttons: Wallet value, Total referrals, Option to view transactions history */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Wallet Value */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('wallet')}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        darkMode
                          ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      }`}
                      title="Click to view Wallet Details & Top-up"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-bold uppercase tracking-wider truncate">Wallet Value</span>
                        <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                      </div>
                      <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        ₹{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}
                      </div>
                    </button>

                    {/* 2. Total Referrals */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('referrals')}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        darkMode
                          ? 'bg-slate-800/60 border-purple-500/30 text-purple-300'
                          : 'bg-purple-50/80 border-purple-200 text-purple-900'
                      }`}
                      title="Click to view Refer & Earn program"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-bold uppercase tracking-wider truncate">Total Referrals</span>
                        <Gift className="w-3.5 h-3.5 text-purple-500 shrink-0 ml-1" />
                      </div>
                      <div className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 mt-1">
                        {referralsMadeCount}
                      </div>
                    </button>

                    {/* 3. Option to View Transactions History */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        darkMode
                          ? 'bg-slate-800/60 border-blue-500/30 text-blue-300'
                          : 'bg-blue-50/80 border-blue-200 text-blue-900'
                      }`}
                      title="Click to view complete passbook and ledger"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-bold uppercase tracking-wider truncate">Transactions</span>
                        <Receipt className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 mt-1 flex items-center space-x-0.5">
                        <span>Passbook →</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ================= COMPACT SCROLLING OFFERS TICKER (MINIMAL SCREEN HEIGHT - CHANGES REQUIRED) ================= */}
                <div className={`rounded-xl p-2 shadow-xs border transition-colors overflow-hidden ${
                  darkMode
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/40'
                    : 'bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white border-amber-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 shrink-0 px-1.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>OFFERS</span>
                    </div>

                    {/* Scrolling Ticker Line */}
                    <div className="overflow-x-auto no-scrollbar flex-1 flex items-center space-x-2 py-0.5">
                      <div className="animate-marquee flex items-center space-x-2 shrink-0">
                        {[...COMPANY_OFFERS, ...COMPANY_OFFERS].map((offer, idx) => (
                          <button
                            key={`${offer.code}-${idx}`}
                            type="button"
                            onClick={() => setSelectedOfferModal(offer)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border transition-all flex items-center space-x-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                              appliedCouponCode === offer.code
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : darkMode
                                ? 'bg-slate-800/90 text-amber-300 border-amber-500/30 hover:bg-slate-750'
                                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50 shadow-2xs'
                            }`}
                            title="Click for offer details and coupon code"
                          >
                            <span>{offer.icon}</span>
                            <span className="font-extrabold">{offer.tickerText}</span>
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700">
                              {offer.code}
                            </span>
                            <span className="text-[10px] opacity-75">ℹ️</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= VEHICLE CATEGORY SELECTION: 2 BOXES PER ROW GRID ================= */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className={`text-sm font-extrabold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Select Vehicle Category
                      </h2>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Choose vehicle type and configuration to book now
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Coimbatore Fleet
                    </span>
                  </div>

                  {/* 2 BOXES PER ROW GRID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* ROW 1 - BOX 1: TWO WHEELER */}
                    <div
                      onClick={() => {
                        setSelectedVehicleCategory('2wheeler');
                        setVehicleModalCategory('2wheeler');
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                        selectedVehicleCategory === '2wheeler'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/60 shadow-sm'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Bike className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            ₹40+
                          </span>
                        </div>
                        <h3 className={`font-bold text-xs mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Two Wheeler
                        </h3>
                        <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Courier, parcels & food up to 20kg
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {twoWheelerSubtype === 'moto_bike' ? 'Moto Bike' : 'Scooter'}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Options ⚙️
                        </span>
                      </div>
                    </div>

                    {/* ROW 1 - BOX 2: THREE WHEELER */}
                    <div
                      onClick={() => {
                        setSelectedVehicleCategory('3wheeler');
                        setVehicleModalCategory('3wheeler');
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                        selectedVehicleCategory === '3wheeler'
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/60 shadow-sm'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                            <CarFront className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                            ₹130+
                          </span>
                        </div>
                        <h3 className={`font-bold text-xs mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Three Wheeler
                        </h3>
                        <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Cargo auto for boxes & textiles up to 500kg
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                          {threeWheelerSubtype === 'open_body' ? 'Open Body' : 'Closed Body'}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          Options ⚙️
                        </span>
                      </div>
                    </div>

                    {/* ROW 2 - BOX 1: FOUR WHEELER */}
                    <div
                      onClick={() => {
                        setSelectedVehicleCategory('4wheeler');
                        setVehicleModalCategory('4wheeler');
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                        selectedVehicleCategory === '4wheeler'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/60 shadow-sm'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            ₹260+
                          </span>
                        </div>
                        <h3 className={`font-bold text-xs mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Four Wheeler
                        </h3>
                        <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Tata Ace, Bolero Pickup up to 1000-1500kg
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {fourWheelerSubtype === 'open_body' ? 'Open Body' : 'Closed Body'}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          Options ⚙️
                        </span>
                      </div>
                    </div>

                    {/* ROW 2 - BOX 2: EV VEHICLES */}
                    <div
                      onClick={() => {
                        setSelectedVehicleCategory('ev');
                        setVehicleModalCategory('ev');
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                        selectedVehicleCategory === 'ev'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/60 shadow-sm'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 animate-pulse" />
                          </div>
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                            ECO EV
                          </span>
                        </div>
                        <h3 className={`font-bold text-xs mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          EV Vehicles
                        </h3>
                        <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          2W, 3W & 4W zero emission green fleet
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {evSubtype === 'ev_2wheeler' ? 'EV 2-Wheeler' : evSubtype === 'ev_3wheeler' ? 'EV 3-Wheeler' : 'EV 4-Wheeler'}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Options ⚙️
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= YOUR REFERRAL CODE BANNER (COMPACT - NO SCROLL) ================= */}
                <div className={`px-3 py-2 rounded-xl border transition-colors ${
                  darkMode ? 'bg-slate-900 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        🎁
                      </div>
                      <div className="text-xs font-bold leading-tight flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className={darkMode ? 'text-white' : 'text-slate-900'}>Your Referral Code:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs">
                          {currentCustomer?.referralCode || 'SWIF-KAVITHA-20'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentCustomer?.referralCode || 'SWIF-KAVITHA-20');
                          setReferralCopied(true);
                          showToast('Referral code copied to clipboard!');
                          setTimeout(() => setReferralCopied(false), 2000);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold border rounded-lg flex items-center space-x-1 transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {referralCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{referralCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const shareText = `Ship smart with SwifLoad Coimbatore on-demand city logistics! Use my referral code ${currentCustomer?.referralCode || 'SWIF-KAVITHA-20'} to get ₹100 welcome credit: https://swifload-cbe.azurewebsites.net/customer`;
                          if (navigator.share) {
                            navigator.share({ title: 'SwifLoad Referral Code', text: shareText }).catch(() => {});
                          } else {
                            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= COMPACT SCROLLING SPONSORED PARTNER ADS (WITHOUT HEADING) ================= */}
                <div className={`rounded-xl px-2 py-1.5 shadow-xs border transition-colors overflow-hidden ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 border-amber-200/80'
                }`}>
                  {/* Horizontal Scrolling Ticker of Ads */}
                  <div className="overflow-x-auto no-scrollbar flex items-center py-0.5">
                    <div className="animate-marquee flex items-center space-x-2 shrink-0">
                      {[...SPONSORED_PARTNERS, ...SPONSORED_PARTNERS].map((partner, pIdx) => (
                        <button
                          key={`${partner.id}-${pIdx}`}
                          type="button"
                          onClick={() => setSelectedAdModal(partner)}
                          className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                            darkMode
                              ? 'bg-slate-800/90 border-slate-700 text-white hover:border-amber-500/50'
                              : 'bg-white border-amber-200 text-slate-900 hover:border-amber-300 shadow-2xs'
                          }`}
                          title="Click to view full partner offer details"
                        >
                          <span className="text-base shrink-0">{partner.icon}</span>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center space-x-1">
                              <span className="text-[11px] font-extrabold truncate max-w-[140px]">
                                {partner.name}
                              </span>
                              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                Verified
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate max-w-[170px]">
                              {partner.headline}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 pl-1">ℹ️</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* ================ SCREEN B: DEDICATED ACTUAL BOOKING PAGE ================ */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* Back to Vehicle Selection Bar */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    type="button"
                    onClick={() => setBookingScreenActive(false)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← Back to Vehicle Selection</span>
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">Step 2: Trip & Route Details</span>
                </div>

                {/* Selected Vehicle Banner Card */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      {getVehicleIcon(vehicleConfigs.find((v) => v.id === selectedVehicle)?.icon || 'Truck', selectedVehicle)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {getVehicleSubtypeDisplay()}
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Selected
                        </span>
                      </div>
                      <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Payload: {vehicleConfigs.find((v) => v.id === selectedVehicle)?.capacityKg || 1000} kg • Base Fare: ₹{vehicleConfigs.find((v) => v.id === selectedVehicle)?.baseFare || 260}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingScreenActive(false)}
                    className="text-xs text-blue-500 font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Requirement 19: Interactive Coimbatore Route Map on Dedicated Booking Page */}
                <div className="relative">
                  <LeafletMap
                    pickup={{ lat: pickupPoint.lat, lng: pickupPoint.lng, label: 'Pickup' }}
                    drop={{ lat: dropPoint.lat, lng: dropPoint.lng, label: 'Drop' }}
                    className="h-48 md:h-56 w-full rounded-2xl shadow-sm border border-slate-200"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-1">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    <span>{distanceKm} km • ~{durationMins} mins</span>
                  </div>
                </div>

                {/* Requirement 19: Pickup and Drop Location Card with Multiple Pickup / Drop Support (Changes Required Item 17) */}
                <div className={`rounded-2xl p-4 shadow-sm border space-y-3 ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup & Drop Locations</span>
                    <button
                      type="button"
                      onClick={() => {
                        const temp = pickupPoint;
                        setPickupPoint(dropPoint);
                        setDropPoint(temp);
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Swap Points</span>
                    </button>
                  </div>

                  {/* Multi-stop Mode Selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setStopMode('standard');
                        setExtraPickups([]);
                        setExtraDrops([]);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                        stopMode === 'standard'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      1 Pick ➔ 1 Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStopMode('multi_pickup');
                        if (extraPickups.length === 0) {
                          setExtraPickups([landmarks[3] || landmarks[1]]);
                        }
                        setExtraDrops([]);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                        stopMode === 'multi_pickup'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      + Multi-Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStopMode('multi_drop');
                        if (extraDrops.length === 0) {
                          setExtraDrops([landmarks[4] || landmarks[2]]);
                        }
                        setExtraPickups([]);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                        stopMode === 'multi_drop'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      + Multi-Drop
                    </button>
                  </div>

                  {/* Pickup & Drop Selectors */}
                  <div className="space-y-3">
                    {/* Primary Pickup */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          <span>{stopMode === 'multi_pickup' ? 'Pickup Point 1 (Primary)' : 'Pickup Landmark / Area'}</span>
                        </label>
                      </div>
                      <select
                        value={pickupPoint.address}
                        onChange={(e) => {
                          const found = landmarks.find((l) => l.address === e.target.value);
                          if (found) setPickupPoint(found);
                        }}
                        className={`w-full text-xs font-semibold rounded-lg p-2 border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {landmarks.map((l, i) => (
                          <option key={i} value={l.address}>
                            {l.area}: {l.address}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Extra Pickups if in multi_pickup mode */}
                    {stopMode === 'multi_pickup' && (
                      <div className="space-y-2 pl-3 border-l-2 border-emerald-500/40">
                        {extraPickups.map((p, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-emerald-500 uppercase flex items-center space-x-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                <span>Pickup Point {idx + 2}</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setExtraPickups((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-[10px] text-rose-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <select
                              value={p.address}
                              onChange={(e) => {
                                const found = landmarks.find((l) => l.address === e.target.value);
                                if (found) {
                                  setExtraPickups((prev) =>
                                    prev.map((item, i) => (i === idx ? found : item))
                                  );
                                }
                              }}
                              className={`w-full text-xs font-semibold rounded-lg p-2 border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {landmarks.map((l, i) => (
                                <option key={i} value={l.address}>
                                  {l.area}: {l.address}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const nextL = landmarks[(pickupPoint.lat ? 3 : 0) + extraPickups.length] || landmarks[0];
                            setExtraPickups((prev) => [...prev, nextL]);
                          }}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 pt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Another Pickup Stop</span>
                        </button>
                      </div>
                    )}

                    {/* Primary Drop */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                          <span>{stopMode === 'multi_drop' ? 'Drop Destination 1 (Primary)' : 'Drop Landmark / Area'}</span>
                        </label>
                      </div>
                      <select
                        value={dropPoint.address}
                        onChange={(e) => {
                          const found = landmarks.find((l) => l.address === e.target.value);
                          if (found) setDropPoint(found);
                        }}
                        className={`w-full text-xs font-semibold rounded-lg p-2 border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {landmarks.map((l, i) => (
                          <option key={i} value={l.address}>
                            {l.area}: {l.address}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Extra Drops if in multi_drop mode */}
                    {stopMode === 'multi_drop' && (
                      <div className="space-y-2 pl-3 border-l-2 border-rose-500/40">
                        {extraDrops.map((d, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-rose-500 uppercase flex items-center space-x-1">
                                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                                <span>Drop Destination {idx + 2}</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setExtraDrops((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-[10px] text-rose-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <select
                              value={d.address}
                              onChange={(e) => {
                                const found = landmarks.find((l) => l.address === e.target.value);
                                if (found) {
                                  setExtraDrops((prev) =>
                                    prev.map((item, i) => (i === idx ? found : item))
                                  );
                                }
                              }}
                              className={`w-full text-xs font-semibold rounded-lg p-2 border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {landmarks.map((l, i) => (
                                <option key={i} value={l.address}>
                                  {l.area}: {l.address}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const nextL = landmarks[(dropPoint.lat ? 4 : 1) + extraDrops.length] || landmarks[1];
                            setExtraDrops((prev) => [...prev, nextL]);
                          }}
                          className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1 pt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Another Drop Stop</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirement 19: Shipment & Loading Info & Helper Card */}
                <div className={`rounded-2xl p-3.5 shadow-sm border space-y-3 transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                        📦
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Shipment & Loading Info</h3>
                        <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{goodsCategory} • ~{weightKg} kg</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowShipmentModal(true)}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Helper Checkbox */}
                  <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                    darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hasHelper}
                        onChange={(e) => setHasHelper(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Need Loading & Unloading Helper</div>
                        <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Driver/porter assist in moving cargo</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      +₹{vehicleConfigs.find((v) => v.id === selectedVehicle)?.helperFee || 0}
                    </span>
                  </label>

                  {/* Schedule Booking Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Schedule for later?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(!isScheduled)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                        isScheduled
                          ? 'bg-emerald-600 text-white'
                          : darkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isScheduled ? scheduleTime : 'Dispatch Now'}
                    </button>
                  </div>
                </div>

                {/* Requirement 19: Payment Mode Section on Dedicated Booking Page */}
                <div className={`rounded-2xl p-3.5 shadow-sm border space-y-3 transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Payment Mode
                    </span>
                    <span className={`text-[10px] font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Wallet Balance: ₹{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        id: 'PRE_PAYMENT',
                        name: 'Pre-Payment',
                        icon: '💳',
                        sub: 'Advance Pay before dispatch',
                      },
                      {
                        id: 'POST_PAYMENT',
                        name: 'Post-Payment',
                        icon: '💵',
                        sub: 'Pay upon delivery (Cash/QR)',
                      },
                      {
                        id: 'ONLINE_PAYMENT',
                        name: 'Online Payment',
                        icon: '⚡',
                        sub: 'Instant UPI / Cards / IMPS',
                      },
                      {
                        id: 'WALLET',
                        name: 'SwifLoad Wallet',
                        icon: '👛',
                        sub: `Bal: ₹${currentCustomer?.wallet?.balance || 0}`,
                      },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === pm.id
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 font-bold text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500'
                            : darkMode
                            ? 'border-slate-800 bg-slate-800/60 text-slate-200 hover:border-slate-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-base">{pm.icon}</div>
                        <div className="text-xs font-bold mt-0.5">{pm.name}</div>
                        <div className={`text-[9px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{pm.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* Wallet Shortage Handling */}
                  {paymentMethod === 'WALLET' && (
                    (() => {
                      const currentBalance = currentCustomer?.wallet?.balance || 0;
                      const shortage = Math.max(0, fareBreakdown.totalFare - currentBalance);

                      if (shortage > 0) {
                        return (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2.5">
                            <div className="flex items-start justify-between text-xs">
                              <div className="text-rose-700 dark:text-rose-300">
                                <span className="font-bold">Shortage in Wallet Balance: </span>
                                You need <strong className="text-rose-900 dark:text-rose-100 font-extrabold">₹{shortage}</strong> more to complete this booking (Available: ₹{currentBalance}, Total: ₹{fareBreakdown.totalFare}).
                              </div>
                            </div>

                            <div className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                              Recharge exact shortage or choose a quick top-up amount:
                            </div>

                            <div className="flex flex-wrap gap-1.5 items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  topUpCustomerWallet(shortage);
                                  showToast(`Added exact shortage of ₹${shortage} to your wallet!`);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-xs shadow-xs transition-transform active:scale-95"
                              >
                                + Recharge Exact ₹{shortage}
                              </button>
                              {[100, 250, 500, 1000].map((extra) => (
                                <button
                                  key={extra}
                                  type="button"
                                  onClick={() => {
                                    topUpCustomerWallet(shortage + extra);
                                    showToast(`Added ₹${shortage + extra} (Shortage + ₹${extra}) to wallet!`);
                                  }}
                                  className={`px-2.5 py-1.5 border font-bold rounded-lg text-[11px] transition-colors ${
                                    darkMode
                                      ? 'bg-slate-800 border-rose-800/80 text-slate-200 hover:bg-slate-700'
                                      : 'bg-white border-rose-300 text-slate-800 hover:bg-rose-100/50'
                                  }`}
                                >
                                  +₹{shortage + extra} (+₹{extra})
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Sufficient balance! <strong>₹{fareBreakdown.totalFare}</strong> will be debited seamlessly from your wallet.</span>
                          </div>
                          <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-300 shrink-0">
                            Remaining: ₹{currentBalance - fareBreakdown.totalFare}
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* ================= COMPANY OFFERS ON BOOKING PAGE (CHANGES REQUIRED ITEM 35) ================= */}
                <div className={`rounded-2xl p-3.5 shadow-sm border space-y-2.5 transition-colors ${
                  darkMode ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/40' : 'bg-gradient-to-r from-amber-50 via-orange-50/40 to-white border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-amber-300' : 'text-amber-950'}`}>
                        Apply Company Booking Offer
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                      Discount Coupons
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {COMPANY_OFFERS.map((offer) => (
                      <div
                        key={offer.code}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                          appliedCouponCode === offer.code
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/40'
                            : darkMode
                            ? 'bg-slate-800/80 border-slate-700'
                            : 'bg-white border-amber-200/80 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-base">{offer.icon}</span>
                            <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {offer.code}
                            </span>
                          </div>
                          <div className="font-bold text-xs mt-1 text-slate-900 dark:text-white leading-tight">
                            {offer.title}
                          </div>
                        </div>
                        <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(offer.code)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              appliedCouponCode === offer.code
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                            }`}
                          >
                            {appliedCouponCode === offer.code ? 'Applied ✓' : 'Apply Code'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= ROOM FOR SPONSORED ADS ON BOOKING PAGE (CHANGES REQUIRED ITEM 35) ================= */}
                <div className={`rounded-2xl p-3.5 shadow-sm border space-y-2.5 transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-slate-50 via-white to-amber-50/30 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-amber-500 text-slate-950 flex items-center space-x-1 shadow-2xs">
                      <Megaphone className="w-3 h-3" />
                      <span>SPONSORED COMMERCIAL ADS</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Coimbatore Hub Partners</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                      darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-200/60'
                    }`}>
                      <div className="text-xl">🛞</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">Apollo Commercial Tyres CBE</div>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">20% off fleet replacement</p>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                      darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-200/60'
                    }`}>
                      <div className="text-xl">⚡</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">Exide Commercial Batteries</div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Free doorstep installation</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Fare Breakdown & Confirm Booking Action */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg space-y-3">
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

                  {/* Toggle exact slab math */}
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
                  {appliedCouponCode && couponDiscount > 0 && (
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-emerald-400">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Promo Coupon Discount ({appliedCouponCode})</span>
                      </span>
                      <span className="font-bold">-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                    <span className="text-slate-400">GST (5% Logistics)</span>
                    <span>₹{fareBreakdown.taxGst}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[11px] text-slate-400">Total Fare (Quoted & Guaranteed)</div>
                      <div className="text-2xl font-black text-emerald-400">₹{finalQuotedFare}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBookNow}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center space-x-2"
                    >
                      <span>Confirm & Book Goods Vehicle</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
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

            {/* Interactive OTP Confirmation Handshake (Changes Required Item 30 & 33 & 34) */}
            {currentTrip.status === 'ARRIVING_PICKUP' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-500 font-black text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Driver Approaching Your Pickup Point</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      advanceTripStatus(currentTrip.id);
                      showToast('Fast-forward: Driver has reached your pickup location!');
                    }}
                    className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30"
                  >
                    Simulate Driver Arrival ⏩
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Driver partner <strong>{currentTrip.driverName || 'Partner'}</strong> ({currentTrip.driverVehicleNumber || 'Tata Ace'}) is en route. Watch live movement on the map above.
                </p>
              </div>
            )}

            {currentTrip.status === 'AT_PICKUP' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 space-y-3 shadow-md animate-in fade-in-50">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Driver Arrived at Pickup Location • Handover Verification</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  Please share your 4-digit Pickup OTP with driver partner <strong>{currentTrip.driverName}</strong> or click below to authenticate loading:
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Your Pickup OTP</span>
                    <div className="text-2xl font-mono font-black tracking-widest text-emerald-600 dark:text-emerald-400">
                      {currentTrip.shipment.pickupOtp}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = advanceTripStatus(currentTrip.id, currentTrip.shipment.pickupOtp);
                      if (res.success) {
                        showToast('Pickup OTP verified! Goods safely loaded. Trip in transit.');
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Confirm Pickup & Start Trip →</span>
                  </button>
                </div>
              </div>
            )}

            {currentTrip.status === 'IN_TRANSIT' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Cargo In Transit • Navigating to Destination</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      advanceTripStatus(currentTrip.id);
                      showToast('Fast-forward: Driver has reached drop destination!');
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30"
                  >
                    Simulate Destination Arrival ⏩
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Goods are loaded and moving smoothly across Coimbatore. Live location updates continuously on the map.
                </p>
              </div>
            )}

            {currentTrip.status === 'ARRIVED_DESTINATION' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/40 space-y-3 shadow-md animate-in fade-in-50">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Driver Reached Destination • Delivery Verification</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  Vehicle has arrived at the drop address. Share the 4-digit Delivery OTP with driver or confirm safe receipt below:
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Your Delivery OTP</span>
                    <div className="text-2xl font-mono font-black tracking-widest text-emerald-600 dark:text-emerald-400">
                      {currentTrip.shipment.deliveryOtp}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = advanceTripStatus(currentTrip.id, currentTrip.shipment.deliveryOtp);
                      if (res.success) {
                        showToast('Delivery OTP verified! Cargo successfully delivered.');
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Verify Delivery OTP & Finalize ✓</span>
                  </button>
                </div>
              </div>
            )}

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

            {/* ================= REQUIREMENT 8: RATING, FEEDBACK & REWARD POINTS ON DELIVERED ================= */}
            {currentTrip.status === 'DELIVERED' && (
              !hasRated ? (
                <div className={`rounded-2xl p-4.5 border space-y-3 shadow-md ${
                  darkMode
                    ? 'bg-slate-900 border-emerald-500/30'
                    : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      <Award className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                        Rate Delivery & Earn 50 Reward Points (₹50)
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Share your feedback to help us maintain top quality and claim instant ₹50 wallet credit!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={`${star} Star`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= ratingVal
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Leave detailed feedback for driver (e.g. on-time, courteous, careful handling)..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      submitRating(currentTrip.id, ratingVal, feedbackText || 'Great delivery service!');
                      setHasRated(true);
                      showToast('Review submitted! 50 Reward Points (₹50) credited to your wallet!');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <Gift className="w-4 h-4 text-emerald-200" />
                    <span>Submit Feedback & Claim 50 Reward Points</span>
                  </button>
                </div>
              ) : (
                <div className={`rounded-2xl p-4 border text-center space-y-2 ${
                  darkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    Thank You! 50 Reward Points Credited
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Your feedback was received and ₹50 has been credited to your SwifLoad Wallet balance.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 inline-flex items-center space-x-1"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View in Transactions Passbook →</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* ================= TAB: CUSTOMER TRANSACTIONS HISTORY & PASSBOOK (Requirement 9) ================= */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-base font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Transactions History & Passbook
                </h2>
                <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Complete ledger of wallet credits, debits, online payments & reward points
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('book');
                  setBookingScreenActive(false);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>← Book Freight</span>
              </button>
            </div>

            {/* Wallet Overview Hero Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              darkMode
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border-emerald-500/30 text-white'
                : 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white border-emerald-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white">
                    <Wallet className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Available Wallet Balance</span>
                    <div className="text-[10px] text-emerald-200">Zero Negative Balance Protected</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWalletTopupModal(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-white text-slate-950 hover:bg-emerald-100 rounded-xl shadow-sm flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Top Up</span>
                </button>
              </div>

              <div className="pt-1">
                <div className="text-3xl font-black text-white tracking-tight">
                  ₹{(currentCustomer?.wallet?.balance || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quick Add Presets */}
              <div className="pt-2 border-t border-white/20 flex gap-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      topUpCustomerWallet(amt);
                      showToast(`Added ₹${amt} to your wallet!`);
                    }}
                    className="flex-1 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Summary 3-Col Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="text-[10px] font-bold uppercase text-slate-400">Total Credited</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{allCustomerTransactions
                    .filter((t) => t.type === 'CREDIT')
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toLocaleString('en-IN')}
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="text-[10px] font-bold uppercase text-slate-400">Total Spent</div>
                <div className={`text-base font-black mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  ₹{allCustomerTransactions
                    .filter((t) => t.type === 'DEBIT')
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toLocaleString('en-IN')}
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900 border-purple-900/40 text-purple-300' : 'bg-purple-50/70 border-purple-200 text-purple-900'
              }`}>
                <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Rewards Earned</div>
                <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
                  ₹{allCustomerTransactions
                    .filter((t) => t.category === 'REWARD_POINTS' || t.category === 'REFERRAL_BONUS')
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className={`p-1 rounded-xl border flex gap-1 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {[
                { id: 'ALL', label: 'All Activity' },
                { id: 'CREDIT', label: 'Credits (+)' },
                { id: 'DEBIT', label: 'Debits (-)' },
                { id: 'REWARD_POINTS', label: 'Rewards (🎁)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTxFilter(tab.id as any)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    txFilter === tab.id
                      ? darkMode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : darkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Transaction Ledger List */}
            <div className={`rounded-2xl p-4 shadow-sm border space-y-2.5 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transaction Records ({filteredTransactions.length})
                </span>
                <span className="text-[10px] text-slate-400">Chronological</span>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            tx.category === 'REWARD_POINTS' || tx.category === 'REFERRAL_BONUS'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : tx.type === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                          }`}
                        >
                          {tx.category === 'REWARD_POINTS' || tx.category === 'REFERRAL_BONUS' ? (
                            <Award className="w-4 h-4" />
                          ) : tx.type === 'CREDIT' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-xs leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              {tx.description}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {tx.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(tx.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {tx.referenceId && ` • Ref: ${tx.referenceId.slice(0, 10)}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-sm ${
                            tx.type === 'CREDIT'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : darkMode
                              ? 'text-slate-300'
                              : 'text-slate-900'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </span>
                        <div className="text-[10px] text-slate-400">Bal: ₹{tx.balanceAfter}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <div className="text-2xl">🧾</div>
                  <p>No transactions match the selected filter.</p>
                </div>
              )}
            </div>
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
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto backdrop-blur-md border-t px-2 py-2 flex items-center justify-between z-30 shadow-lg ${
        darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <button
          onClick={() => {
            setActiveTab('book');
            setBookingScreenActive(false);
          }}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'book' && !bookingScreenActive ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
          title="Return to Home Dashboard"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center space-y-0.5 relative ${activeTab === 'tracking' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">Active</span>
          {currentTrip.status !== 'DELIVERED' && currentTrip.status !== 'CANCELLED' && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'transactions' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
          title="Customer Transactions History & Passbook"
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Passbook</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'wallet' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'referrals' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px]">Refer</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'history' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-0.5 ${activeTab === 'profile' ? 'text-emerald-500 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

      {/* ================= MODAL: VEHICLE SUB-OPTIONS POPUP (CHANGES REQUIRED) ================= */}
      {vehicleModalCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className={`rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  vehicleModalCategory === '2wheeler'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : vehicleModalCategory === '3wheeler'
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : vehicleModalCategory === '4wheeler'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {vehicleModalCategory === '2wheeler' && <Bike className="w-5 h-5" />}
                  {vehicleModalCategory === '3wheeler' && <CarFront className="w-5 h-5" />}
                  {vehicleModalCategory === '4wheeler' && <Truck className="w-5 h-5" />}
                  {vehicleModalCategory === 'ev' && <Zap className="w-5 h-5 animate-pulse" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {vehicleModalCategory === '2wheeler' && 'Two Wheeler Options'}
                    {vehicleModalCategory === '3wheeler' && 'Three Wheeler Body Options'}
                    {vehicleModalCategory === '4wheeler' && 'Four Wheeler Body Options'}
                    {vehicleModalCategory === 'ev' && 'Electric EV Fleet Options'}
                  </h3>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select configuration before booking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVehicleModalCategory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - TWO WHEELER */}
            {vehicleModalCategory === '2wheeler' && (
              <div className="space-y-3">
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Choose vehicle style for your courier, document or food parcel shipment:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTwoWheelerSubtype('moto_bike')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      twoWheelerSubtype === 'moto_bike'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Bike className="w-4 h-4 shrink-0" />
                      <span>Moto Bike</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${twoWheelerSubtype === 'moto_bike' ? 'text-emerald-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Standard motorcycle with rear carrier rack / bag.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTwoWheelerSubtype('scooter')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      twoWheelerSubtype === 'scooter'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Bike className="w-4 h-4 shrink-0" />
                      <span>Scooter Type</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${twoWheelerSubtype === 'scooter' ? 'text-emerald-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Wide flat floorboard for bakery boxes & fragile goods.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - THREE WHEELER: OPEN BODY VS CLOSED BODY */}
            {vehicleModalCategory === '3wheeler' && (
              <div className="space-y-3">
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Choose open or closed cargo auto container according to your goods:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setThreeWheelerSubtype('open_body')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      threeWheelerSubtype === 'open_body'
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <CarFront className="w-4 h-4 shrink-0" />
                      <span>Open Body</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${threeWheelerSubtype === 'open_body' ? 'text-teal-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Open bed cargo auto for quick top-loading & crates.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThreeWheelerSubtype('closed_body')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      threeWheelerSubtype === 'closed_body'
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Container className="w-4 h-4 shrink-0" />
                      <span>Closed Body</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${threeWheelerSubtype === 'closed_body' ? 'text-teal-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      All-weather closed box for cartons, fabric & retail goods.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - FOUR WHEELER: OPEN BODY VS CLOSED BODY */}
            {vehicleModalCategory === '4wheeler' && (
              <div className="space-y-3">
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Choose open bed (Tata Ace) or closed container truck:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFourWheelerSubtype('open_body')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      fourWheelerSubtype === 'open_body'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>Open Body</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${fourWheelerSubtype === 'open_body' ? 'text-blue-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tata Ace open bed / 8ft flatbed for motors, pumps & steel.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFourWheelerSubtype('closed_body')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      fourWheelerSubtype === 'closed_body'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Container className="w-4 h-4 shrink-0" />
                      <span>Closed Body</span>
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-snug ${fourWheelerSubtype === 'closed_body' ? 'text-blue-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Closed container box. Lockable & rainproof for pharma & garments.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - EV VEHICLES: 2-WHEELER EV, 3-WHEELER EV, 4-WHEELER EV */}
            {vehicleModalCategory === 'ev' && (
              <div className="space-y-3">
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Choose 100% electric zero-emission fleet size:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvSubtype('ev_2wheeler')}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      evSubtype === 'ev_2wheeler'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Bike className="w-4 h-4 mx-auto mb-1 text-inherit" />
                    <div className="font-bold text-[11px] leading-tight">2-Wheeler EV</div>
                    <p className={`text-[9px] mt-0.5 ${evSubtype === 'ev_2wheeler' ? 'text-emerald-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Up to 20kg
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvSubtype('ev_3wheeler')}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      evSubtype === 'ev_3wheeler'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <CarFront className="w-4 h-4 mx-auto mb-1 text-inherit" />
                    <div className="font-bold text-[11px] leading-tight">3-Wheeler EV</div>
                    <p className={`text-[9px] mt-0.5 ${evSubtype === 'ev_3wheeler' ? 'text-emerald-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Up to 450kg
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvSubtype('ev_4wheeler')}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      evSubtype === 'ev_4wheeler'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4 mx-auto mb-1 text-inherit" />
                    <div className="font-bold text-[11px] leading-tight">4-Wheeler EV</div>
                    <p className={`text-[9px] mt-0.5 ${evSubtype === 'ev_4wheeler' ? 'text-emerald-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Up to 900kg
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer with Book Now CTA */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setVehicleModalCategory(null)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cat = vehicleModalCategory;
                  setVehicleModalCategory(null);
                  handleProceedToBooking(cat);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Book Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: OFFER DETAILS POPUP (CHANGES REQUIRED) ================= */}
      {selectedOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className={`rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{selectedOfferModal.icon}</span>
                <div>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                    {selectedOfferModal.badge}
                  </span>
                  <h3 className="font-extrabold text-sm mt-0.5">{selectedOfferModal.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Coupon Code</span>
                  <div className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                    {selectedOfferModal.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOfferModal.code);
                    showToast(`Copied ${selectedOfferModal.code}!`);
                  }}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-bold rounded-xl flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Terms & Benefits</span>
                <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedOfferModal.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                📍 {selectedOfferModal.sub}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApplyCoupon(selectedOfferModal.code);
                  setSelectedOfferModal(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                  appliedCouponCode === selectedOfferModal.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                }`}
              >
                {appliedCouponCode === selectedOfferModal.code ? 'Applied ✓' : 'Apply Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SPONSORED PARTNER AD DETAILS POPUP (CHANGES REQUIRED) ================= */}
      {selectedAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className={`rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{selectedAdModal.icon}</span>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-extrabold text-sm">{selectedAdModal.name}</h3>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {selectedAdModal.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{selectedAdModal.hub}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                ⭐ {selectedAdModal.headline}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Offer Overview</span>
                <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedAdModal.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">Coimbatore Partner Hubs:</div>
                <div className="text-slate-500 dark:text-slate-400">{selectedAdModal.locations}</div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold">Partner Code</span>
                  <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedAdModal.promoCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAdModal.promoCode);
                    showToast(`Copied ${selectedAdModal.promoCode}!`);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg"
                >
                  Copy Code
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedAdModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Partner offer for ${selectedAdModal.name} redeemed!`);
                  setSelectedAdModal(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                Claim Offer
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ================= REQUIREMENT 3: SPONSORED AD PLACEMENT MODAL ================= */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500 font-bold text-sm">
                  <Megaphone className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-base">Advertise on SwifLoad Coimbatore</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Earmarked Home Screen Partner Spaces</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reach High-Intent Industrial & Commercial Shippers</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-snug">
                  Promote your brand, auto components, commercial tyres, warehousing, logistics services, or industrial equipment to thousands of verified business shippers in Coimbatore.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Available Ad Placements:</h4>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>1. Home Screen Top Banner</span>
                    <span className="text-emerald-600 font-bold">From ₹4,999/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Highest visibility directly above vehicle booking selector. Includes verified partner badge and promo code redemption.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>2. Post-Trip Tax Invoice Footer</span>
                    <span className="text-emerald-600 font-bold">From ₹2,499/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Delivered on every digital PDF receipt and email confirmation sent to corporate accounts.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/919845012345?text=Hi%20SwifLoad%20Team,%20I%20am%20interested%20in%20advertising%20on%20the%20Customer%20App"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Ad Desk</span>
                </a>
                <button
                  onClick={() => {
                    setShowAdModal(false);
                    showToast('Our commercial ad team will contact you shortly!');
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Request Call Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOWER SHOWER SPLASH SCREEN (CHANGES REQUIRED ITEM 6) ================= */}
      {showSplash && (
        <FlowerShowerSplash onDismiss={() => setShowSplash(false)} />
      )}

      {/* ================= SIDE MENU BAR DRAWER (CHANGES REQUIRED ITEM 10 & 18) ================= */}
      <CustomerSideMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        customer={currentCustomer}
        onUpdateCustomer={updateCustomerProfile}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setBookingScreenActive(false);
        }}
        onReplaySplash={() => setShowSplash(true)}
        darkMode={darkMode}
        showToast={showToast}
      />

      {/* ================= NOTIFICATIONS MODAL (CHANGES REQUIRED ITEM 15) ================= */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Notifications & Offers</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                setShowNotificationsModal(false);
                showToast('All notifications marked as read');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
