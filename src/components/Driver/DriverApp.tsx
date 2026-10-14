'use client';

import React, { useState, useEffect } from 'react';
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
  Menu,
  Bell,
  QrCode,
  FileText,
  Pin,
  User,
  Share2,
  Layers,
  CheckCircle,
  Sun,
  Moon,
  Home,
  Tag,
  GraduationCap,
  Settings,
  Truck,
  FileCheck,
  Upload,
  Globe,
  Languages,
  Receipt,
  CreditCard,
  CheckCheck,
  Star,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { VehicleCategory, TripStop, DriverNotification, DriverCancellationReason, DriverDocKey, DriverUploadedDoc, DriverPartner } from '@/types/logistics';
import { calculateDriverTaskPayout, calculateDriverIncentives, calculateDistanceKm } from '@/lib/pricing';
import FlowerShowerSplash from '@/components/Customer/FlowerShowerSplash';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

/**
 * Sponsored Ads for Driver App displayed horizontally one below the other (Changes Required Item 15)
 */
const DRIVER_SPONSORED_ADS = [
  {
    id: 'ad_apollo',
    brand: 'Apollo Tyres Commercial',
    title: 'EnduMaxx LT Radial Truck Tyres - 20% Special Discount',
    desc: 'Authorized Fleet Dealer at Singanallur. Free wheel balancing & nitrogen fill for registered fleet drivers.',
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

/**
  Company Offers prominently displayed for Drivers (Requirement 31)
 */
const DRIVER_COMPANY_OFFERS = [
  {
    id: 'off_fuel_subsidy',
    badge: 'FESTIVE OFFER',
    title: 'Festive Fuel Surcharge Bonus',
    desc: 'Flat 10% extra bonus on every completed delivery in Coimbatore',
    code: 'FUEL-BONUS-10',
    validity: 'Valid till 31 Oct',
    icon: '⛽',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
  },
  {
    id: 'off_ev_loader',
    badge: 'EV INCENTIVE',
    title: 'EV Loader Charging Cashback',
    desc: 'Flat ₹500 weekly battery charging reimbursement for EV 2W, 3W & 4W partners',
    code: 'GREEN-EV-500',
    validity: 'Active all month',
    icon: '⚡',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
  },
  {
    id: 'off_peak_rush',
    badge: 'RUSH HOURS',
    title: 'Peak Evening Dispatch Boost',
    desc: '₹40 extra per trip between 5:00 PM – 9:00 PM in Peelamedu, Gandhipuram & RS Puram',
    code: 'RUSH-CBE-40',
    validity: 'Every weekday',
    icon: '🔥',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
  },
];

/**
  Driver Partner FAQs & Solutions (Requirement 28)
 */
const DRIVER_HELP_TOPICS = [
  {
    id: 'customer_no_otp',
    title: 'Customer not sharing OTP at pickup or delivery location',
    category: 'Handover & Security',
    steps: [
      'Politely inform the customer that Two-Way OTP is mandatory for verified transit insurance and immediate payout credit.',
      'Pickup OTP is available on the shipper customer\'s screen. Delivery OTP is on the receiver\'s phone.',
      'If the customer cannot locate the OTP, tap the Call button in your task screen to connect with customer care.',
      'Never leave the pickup or release cargo without completing the 4-digit OTP handshake.',
    ],
  },
  {
    id: 'negative_balance_unblock',
    title: 'Negative wallet balance - How do I unblock dispatch calls?',
    category: 'Wallet & Top-up',
    steps: [
      'The platform allows overdraft up to your pre-configured negative limit. Beyond the overdraft limit, dispatch calls are temporarily paused.',
      'Tap "Wallet" in the side menu or bottom bar to see your exact negative balance and minimum recharge amount.',
      'Recharge the minimum amount using UPI, Google Pay, or PhonePe.',
      'Your account unblocks automatically within 5 seconds of payment confirmation.',
    ],
  },
  {
    id: 'order_cancelled_en_route',
    title: 'Order was cancelled by customer after I reached pickup',
    category: 'Cancellations & Payouts',
    steps: [
      'If you already navigated to the pickup premises and the shipper cancels, you are protected.',
      'A ₹50 dry-run cancellation reimbursement is instantly credited to your partner wallet.',
      'You will be immediately put back at the top of the queue for the next available dispatch call.',
    ],
  },
  {
    id: 'vehicle_breakdown',
    title: 'Vehicle breakdown or flat tyre during active transit with cargo',
    category: 'Emergency Assistance',
    steps: [
      'Park safely on the road shoulder with hazard lights turned on.',
      'Tap "Cancel Order" on your live duty terminal and select "Vehicle Breakdown" as the reason.',
      'Our central fleet control room will immediately dispatch the nearest standby loader to transfer the cargo.',
      'You will receive assistance and our fleet breakdown helpline will assist you.',
    ],
  },
  {
    id: 'incentives_payout',
    title: 'How are milestone incentives and slab bonuses credited?',
    category: 'Earnings & Incentives',
    steps: [
      'Milestone incentives are calculated automatically based on the number of completed deliveries today.',
      'Targets and rewards (e.g., 3 trips = ₹100, 6 trips = ₹250, 10 trips = ₹500) are configured by the admin portal.',
      'All incentive bonuses are credited to your withdrawable wallet balance every midnight at 11:59 PM.',
      'You can request payout to your registered bank account or UPI ID at any time.',
    ],
  },
  {
    id: 'kyc_document_update',
    title: 'How do I update expired Driving License or Insurance RC book?',
    category: 'Profile & Documents',
    steps: [
      'Open the side navigation menu and tap "Profile".',
      'Under Vehicle Credentials and KYC Documents, review your current validity dates.',
      'To update renewed documents, submit photo proof to the admin portal or WhatsApp support desk at +91 98422 00000.',
      'Admin operations approve document renewals within 2 to 4 business hours.',
    ],
  },
];

/**
 * 13 Driver Partner Mandatory Documents (Changes Required Line 22)
 */
const DRIVER_13_DOCS: { key: DriverDocKey; label: string; desc: string; category: string }[] = [
  { key: 'VEHICLE_FRONT', label: '1. Vehicle Photo (Front)', desc: 'Clear front view of vehicle showing number plate', category: 'Vehicle' },
  { key: 'VEHICLE_BACK', label: '2. Vehicle Photo (Back)', desc: 'Clear rear view of vehicle showing cargo hold and number plate', category: 'Vehicle' },
  { key: 'VEHICLE_LEFT', label: '3. Vehicle Photo (Left Side)', desc: 'Full profile photo of the left side of the vehicle', category: 'Vehicle' },
  { key: 'VEHICLE_RIGHT', label: '4. Vehicle Photo (Right Side)', desc: 'Full profile photo of the right side of the vehicle', category: 'Vehicle' },
  { key: 'DL_FRONT', label: '5. Driving License (Front)', desc: 'Valid Commercial / LMV Driving License front side', category: 'License' },
  { key: 'DL_BACK', label: '6. Driving License (Back)', desc: 'Driving License reverse side with endorsements', category: 'License' },
  { key: 'RC_FRONT', label: '7. Vehicle RC Book (Front)', desc: 'Registration Certificate front showing vehicle ownership & class', category: 'Vehicle' },
  { key: 'RC_BACK', label: '8. Vehicle RC Book (Back)', desc: 'Registration Certificate reverse side showing vehicle specifications', category: 'Vehicle' },
  { key: 'INSURANCE', label: '9. Vehicle Commercial Insurance', desc: 'Active third-party or comprehensive policy document', category: 'Vehicle' },
  { key: 'AADHAR_FRONT', label: '10. Aadhaar Card (Front)', desc: 'UIDAI Aadhaar card photo side with name & DOB', category: 'Identity' },
  { key: 'AADHAR_BACK', label: '11. Aadhaar Card (Back)', desc: 'Aadhaar card address side with QR code', category: 'Identity' },
  { key: 'PAN_CARD', label: '12. PAN Card', desc: 'Permanent Account Number card for TDS compliance', category: 'Finance' },
  { key: 'CANCELLED_CHEQUE', label: '13. Bank Passbook / Cheque', desc: 'Bank statement or cancelled cheque showing account & IFSC', category: 'Finance' },
];

/**
 * Multilingual FAQ Knowledge Base (Changes Required Lines 17-21)
 */
const SUPPORT_FAQ_DATA: Record<
  'Tamil' | 'English' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Kannada',
  { category: string; icon: string; items: { q: string; a: string }[] }[]
> = {
  Tamil: [
    {
      category: 'பயண ஆதரவு (Trips)',
      icon: '🚛',
      items: [
        { q: 'வாடிக்கையாளர் பிக்கப் பாயிண்டில் இல்லை என்றால் என்ன செய்வது?', a: 'பயன்பாட்டில் உள்ள "Call Customer" பட்டனை தட்டவும். 3 நிமிடம் காத்திருந்த பிறகு தானியங்கி காத்திருப்பு கட்டணம் தொடங்கும்.' },
        { q: 'தவறான டெலிவரி முகவரி ஏற்பட்டால் எப்படி மாற்றுவது?', a: 'லைவ் ரூட் மேப்பில் வாடிக்கையாளரை அழைத்து புதிய இருப்பிடத்தை உறுதிசெய்து ஹெல்ப்லைனை தொடர்பு கொள்ளவும்.' },
      ],
    },
    {
      category: 'கட்டணம் மற்றும் செட்டில்மெண்ட் (Payment)',
      icon: '💵',
      items: [
        { q: 'ட்ரிப் முடிந்தவுடன் வருமானம் எப்போது வாலட்டில் சேரும்?', a: 'டெலிவரி OTP சரிபார்க்கப்பட்ட அடுத்த வினாடியே உங்கள் வருமானம் உடனடியாக வாலட்டில் வரவு வைக்கப்படும்.' },
        { q: 'காத்திருப்பு கட்டணம் எவ்வாறு கணக்கிடப்படுகிறது?', a: 'பிக்கப்பில் முதல் 3 நிமிடங்கள் இலவசம். அதற்கு மேல் நிமிடத்திற்கு ₹2 முதல் ₹6 வரை வாகன வகைக்கு ஏற்ப கணக்கிடப்படும்.' },
      ],
    },
    {
      category: 'வாலட் இருப்பு (Wallet Balance)',
      icon: '👛',
      items: [
        { q: 'வாலட் மைனஸ் -₹200 ஆனால் என்னவாகும்?', a: 'வாலட் கடன் -₹200 தாண்டினால் ஆர்டர்கள் தற்காலிகமாக நிறுத்தப்படும். குறைந்தது ₹200 ரீசார்ஜ் செய்து உடனடியாக மீண்டும் தொடங்கலாம்.' },
      ],
    },
    {
      category: 'பணம் எடுத்தல் (Withdrawals)',
      icon: '🏦',
      items: [
        { q: 'என் வங்கி கணக்கிற்கு பணத்தை எப்போது எடுக்கலாம்?', a: 'எந்த நேரத்திலும் குறைந்தபட்சம் ₹100 முதல் உடனடி UPI அல்லது IMPS மூலம் உடனடியாக வங்கி கணக்கில் பெற்றுக்கொள்ளலாம்.' },
      ],
    },
    {
      category: 'ரீசார்ஜ் கேள்விகள் (Recharge)',
      icon: '⚡',
      items: [
        { q: 'ரீசார்ஜ் செய்வது எப்படி?', a: 'வாலட்டில் "Recharge" பட்டனை அழுத்தி Google Pay, PhonePe, Paytm அல்லது நெட் பேங்கிங் மூலம் ரீசார்ஜ் செய்யலாம்.' },
      ],
    },
  ],
  English: [
    {
      category: 'Trips Support',
      icon: '🚛',
      items: [
        { q: 'What if the customer is not reachable at pickup point?', a: 'Tap "Call Customer" in the active trip card. After 3 minutes, free waiting window expires and automatic waiting charges accrue in real time.' },
        { q: 'How to handle multi-stop pickup and drops?', a: 'In the Active Order page, each stop has a dedicated status, touch-to-call button, and individual OTP verification.' },
      ],
    },
    {
      category: 'Payment Support',
      icon: '💵',
      items: [
        { q: 'When is trip earning credited to my driver wallet?', a: 'Immediately upon entering the recipient delivery OTP and completing the trip.' },
        { q: 'How does real-time waiting charges calculation work?', a: 'First 3 minutes are 100% free. Excess minutes accrue based on vehicle tier (2W: ₹2/min, 3W: ₹3/min, Tata Ace: ₹5/min, 8ft Pickup: ₹6/min).' },
      ],
    },
    {
      category: 'Wallet Amount',
      icon: '👛',
      items: [
        { q: 'What is the -₹200 negative balance blocking rule?', a: 'If unpaid platform dues exceed -₹200, order dispatch is locked until a minimum top-up of ₹200 is completed.' },
      ],
    },
    {
      category: 'Withdrawals',
      icon: '🏦',
      items: [
        { q: 'How fast are withdrawal payouts processed?', a: 'Instant payouts are processed 24x7 via UPI & IMPS directly into your registered bank account.' },
      ],
    },
    {
      category: 'Recharge Queries',
      icon: '⚡',
      items: [
        { q: 'Which payment methods are accepted for wallet top-up?', a: 'UPI (GPay, PhonePe, Paytm), RuPay debit cards, and Net Banking.' },
      ],
    },
  ],
  Hindi: [
    {
      category: 'ट्रिप सहायता (Trips)',
      icon: '🚛',
      items: [
        { q: 'यदि पिकअप पर ग्राहक फोन न उठाए तो क्या करें?', a: 'सक्रिय ऑर्डर में "कॉल कस्टमर" दबाएं। 3 मिनट के बाद रियल-टाइम वेटिंग शुल्क अपने आप जुड़ने लगता है।' },
      ],
    },
    {
      category: 'भुगतान और निपटान (Payment)',
      icon: '💵',
      items: [
        { q: 'ट्रिप की कमाई कब मिलती है?', a: 'डिलीवरी ओटीपी दर्ज होते ही ड्राइवर की कमाई तुरंत वॉलेट में जमा हो जाती है।' },
      ],
    },
    {
      category: 'वॉलेट राशि (Wallet Balance)',
      icon: '👛',
      items: [
        { q: 'माइनस ₹200 से अधिक बकाया होने पर क्या होगा?', a: 'ड्यूज -₹200 से अधिक होने पर ऑर्डर मिलना बंद हो जाता है। न्यूनतम ₹200 का रिचार्ज करके अनब्लॉक करें।' },
      ],
    },
    {
      category: 'निकासी (Withdrawals)',
      icon: '🏦',
      items: [
        { q: 'बैंक खाते में पैसे कैसे ट्रांसफर करें?', a: 'वॉलेट से विदड्रॉ सेक्शन में जाकर कभी भी सीधे UPI या बैंक ट्रांसफर कर सकते हैं।' },
      ],
    },
    {
      category: 'रिचार्ज संबंधी प्रश्न (Recharge)',
      icon: '⚡',
      items: [
        { q: 'वॉलेट रिचार्ज कैसे करें?', a: 'UPI (GPay, PhonePe) या नेट बैंकिंग के जरिए आसानी से रिचार्ज करें।' },
      ],
    },
  ],
  Telugu: [
    {
      category: 'ట్రిప్స్ సపోర్ట్ (Trips)',
      icon: '🚛',
      items: [
        { q: 'పికప్ వద్ద కస్టమర్ స్పందించకపోతే ఏమి చేయాలి?', a: '"కాల్ కస్టమర్" క్లిక్ చేయండి. 3 నిమిషాల ఉచిత సమయం తర్వాత వెయిటింగ్ ఛార్జీలు లైవ్‌గా లెక్కించబడతాయి.' },
      ],
    },
    {
      category: 'చెల్లింపులు (Payment)',
      icon: '💵',
      items: [
        { q: 'ట్రిప్ పూర్తయ్యాక డబ్బులు ఎప్పుడు వస్తాయి?', a: 'డెలివరీ OTP నమోదు చేసిన వెంటనే మీ వాలెట్‌కు నేరుగా జమ చేయబడుతుంది.' },
      ],
    },
    {
      category: 'వాలెట్ బ్యాలెన్స్ (Wallet Balance)',
      icon: '👛',
      items: [
        { q: '-₹200 బ్యాలెన్స్ రూల్ ఏమిటి?', a: 'బకాయి -₹200 దాటితే బుకింగ్‌లు ఆగిపోతాయి. కనిష్టంగా ₹200 రీఛార్జ్ చేసి పునరుద్ధరించండి.' },
      ],
    },
    {
      category: 'విత్‌డ్రాయల్స్ (Withdrawals)',
      icon: '🏦',
      items: [
        { q: 'బ్యాంకు ఖాతాకు డబ్బులు ఎలా విత్‌డ్రా చేయాలి?', a: 'UPI లేదా బ్యాంక్ ట్రాన్స్‌ఫర్ ద్వారా 24 గంటలూ తక్షణమే విత్‌డ్రా చేసుకోవచ్చు.' },
      ],
    },
    {
      category: 'రీఛార్జ్ (Recharge)',
      icon: '⚡',
      items: [
        { q: 'రీఛార్జ్ చేయడం ఎలా?', a: 'PhonePe, GPay, Paytm ద్వారా సులభంగా రీఛార్జ్ చేసుకోండి.' },
      ],
    },
  ],
  Malayalam: [
    {
      category: 'ട്രിപ്പ് സപ്പോർട്ട് (Trips)',
      icon: '🚛',
      items: [
        { q: 'പിക്കപ്പിൽ കസ്റ്റമറെ ബന്ധപ്പെടാൻ സാധിച്ചില്ലെങ്കിൽ?', a: '"Call Customer" ബട്ടൺ അമർത്തുക. 3 മിനിറ്റ് കഴിഞ്ഞാൽ വെയ്റ്റിംഗ് ചാർജ് ലൈവായി ആഡ് ചെയ്യപ്പെടും.' },
      ],
    },
    {
      category: 'പേയ്‌മെന്റ് (Payment)',
      icon: '💵',
      items: [
        { q: 'യാത്രാ വരുമാനം എപ്പോൾ ലഭിക്കും?', a: 'ഡെലിവറി OTP നൽകിയ ഉടൻ തന്നെ ഡ്രൈവർ വരുമാനം വാലറ്റിൽ ക്രെഡിറ്റ് ചെയ്യപ്പെടും.' },
      ],
    },
    {
      category: 'വാലറ്റ് ബാലൻസ് (Wallet Balance)',
      icon: '👛',
      items: [
        { q: '-₹200 നെഗറ്റീവ് ബാലൻസ് നിയമം എന്താണ്?', a: 'ബാധ്യത -₹200 കവിഞ്ഞാൽ ഓർഡറുകൾ ബ്ലോക്കാകും. കുറഞ്ഞത് ₹200 റീചാർജ് ചെയ്ത് വീണ്ടും ആരംഭിക്കുക.' },
      ],
    },
    {
      category: 'വിത്ത്ഡ്രോവൽ (Withdrawals)',
      icon: '🏦',
      items: [
        { q: 'ബാങ്ക് അക്കൗണ്ടിലേക്ക് എപ്പോൾ പണം മാറ്റാം?', a: 'UPI അല്ലെങ്കിൽ IMPS വഴി എപ്പോൾ വേണമെങ്കിലും നേരിട്ട് അക്കൗണ്ടിലേക്ക് മാറ്റാം.' },
      ],
    },
    {
      category: 'റീചാർജ് (Recharge)',
      icon: '⚡',
      items: [
        { q: 'വാലറ്റ് റീചാർജ് ചെയ്യുന്നത് എങ്ങനെ?', a: 'GPay, PhonePe അല്ലെങ്കിൽ ബാങ്കിംഗ് വഴി എളുപ്പത്തിൽ റീചാർജ് ചെയ്യാം.' },
      ],
    },
  ],
  Kannada: [
    {
      category: 'ಟ್ರಿಪ್ ಬೆಂಬಲ (Trips)',
      icon: '🚛',
      items: [
        { q: 'ಪಿಕಪ್ ಸ್ಥಳದಲ್ಲಿ ಗ್ರಾಹಕರು ಸಿಗದಿದ್ದರೆ ಏನು ಮಾಡಬೇಕು?', a: '"Call Customer" ಒತ್ತಿರಿ. 3 ನಿಮಿಷಗಳ ನಂತರ ಸ್ವಯಂಚಾಲಿತ ವೇಟಿಂಗ್ ಶುಲ್ಕ ಲೈವ್ ಆಗಿ ಸೇರ್ಪಡೆಯಾಗುತ್ತದೆ.' },
      ],
    },
    {
      category: 'ಪಾವತಿ ಮತ್ತು ಗಳಿಕೆ (Payment)',
      icon: '💵',
      items: [
        { q: 'ಟ್ರಿಪ್ ಮುಗಿದ ತಕ್ಷಣ ಗಳಿಕೆ ಯಾವಾಗ ಜಮೆಯಾಗುತ್ತದೆ?', a: 'ಡೆಲಿವರಿ ಒಟಿಪಿ ಪರಿಶೀಲಿಸಿದ ತಕ್ಷಣವೇ ಹಣ ನಿಮ್ಮ ವಾಲೆಟ್ ಸೇರುತ್ತದೆ.' },
      ],
    },
    {
      category: 'ವಾಲೆಟ್ ಮೊತ್ತ (Wallet Balance)',
      icon: '👛',
      items: [
        { q: '-₹200 ಮಿತಿ ನಿಯಮವೇನು?', a: 'ಬಾಕಿ -₹200 ಮೀರಿದರೆ ಆರ್ಡರ್‌ಗಳು ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತವೆ. ಕನಿಷ್ಠ ₹200 ರೀಚಾರ್ಜ್ ಮಾಡಿ ಪುನರಾರಂಭಿಸಿ.' },
      ],
    },
    {
      category: 'ಹಿಂಪಡೆಯುವಿಕೆ (Withdrawals)',
      icon: '🏦',
      items: [
        { q: 'ಖಾತೆಗೆ ಹಣ ಹೇಗೆ ವರ್ಗಾಯಿಸುವುದು?', a: 'ಯಾವುದೇ ಸಮಯದಲ್ಲಿ UPI ಅಥವಾ ಬ್ಯಾಂಕ್ ಮುಖಾಂತರ ತಕ್ಷಣವೇ ಹಿಂಪಡೆಯಬಹುದು.' },
      ],
    },
    {
      category: 'ರೀಚಾರ್ಜ್ (Recharge)',
      icon: '⚡',
      items: [
        { q: 'ವಾಲೆಟ್ ರೀಚಾರ್ಜ್ ಮಾಡುವುದು ಹೇಗೆ?', a: 'PhonePe, GPay ಮುಖಾಂತರ ಸರಳವಾಗಿ ರೀಚಾರ್ಜ್ ಮಾಡಬಹುದು.' },
      ],
    },
  ],
};

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
    driverNotifications,
    addDriverNotification,
    markDriverNotificationRead,
    clearDriverNotifications,
    startTripStop,
    completeTripStop,
    cancellationSlabConfigs,
    cancelTripByDriver,
    waiveDriverLockout,
    isDriverInLockout,
    driverLockouts,
    maxDocUploadSizeMb,
    updateMaxDocUploadSizeMb,
    markDriverReachedPickup,
    updateTripWaitingFare,
    submitDriverFeedbackForCustomer,
    updateDriverProfileDetails,
    uploadDriverDocument,
    brandConfig,
  } = useLogistics();

  // Driver Cancellation & Lockout States
  const [showCancelReasonModal, setShowCancelReasonModal] = useState<boolean>(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<DriverCancellationReason>('Illness');
  const [now, setNow] = useState<number>(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation: 'home' | 'live_calls' | 'available_orders' | 'duty' | 'active_order' | 'trips' | 'ledger' | 'support' | 'settings' (Changes Required)
  const [driverPage, setDriverPage] = useState<'home' | 'live_calls' | 'available_orders' | 'duty' | 'active_order' | 'trips' | 'ledger' | 'support' | 'settings'>('home');
  const [activeDriverTab, setActiveDriverTab] = useState<'trips' | 'earnings' | 'referrals' | 'kyc' | 'support'>('trips');
  const [pickupTransitStartTime, setPickupTransitStartTime] = useState<number | null>(null);
  const [dropTransitStartTime, setDropTransitStartTime] = useState<number | null>(null);
  const [dropTransitStoppedTime, setDropTransitStoppedTime] = useState<number | null>(null);
  const [isDropTransitActive, setIsDropTransitActive] = useState<boolean>(false);
  const [driverSimCoords, setDriverSimCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Support Language state (Changes Required Item 17)
  const [supportLanguage, setSupportLanguage] = useState<'English' | 'Tamil' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Kannada'>('Tamil');
  const [activeSupportQuery, setActiveSupportQuery] = useState<string | null>(null);

  // Settings active section (Changes Required Item 18)
  const [settingsSection, setSettingsSection] = useState<'profile' | 'documents' | 'communication' | 'payment' | 'language'>('profile');

  // Trips Tab filter (Changes Required Item 15)
  const [tripsHistoryFilter, setTripsHistoryFilter] = useState<'today' | 'last_week'>('today');

  // Duty sliding popup index & dismissal (Changes Required Item 8)
  const [dutySlidingIndex, setDutySlidingIndex] = useState<number>(0);
  const [dismissDutyPopups, setDismissDutyPopups] = useState<boolean>(false);

  // Active Order Live Tracking simulation & Waiting Time (Changes Required Item 9)
  const [isSimulatingGps, setIsSimulatingGps] = useState<boolean>(false);
  const [showCompanyQrPayModal, setShowCompanyQrPayModal] = useState<boolean>(false);
  const [showCustomerFeedbackModal, setShowCustomerFeedbackModal] = useState<boolean>(false);
  const [customerRatingScore, setCustomerRatingScore] = useState<number>(5);
  const [customerFeedbackText, setCustomerFeedbackText] = useState<string>('');
  const [customerFeedbackSelectedTags, setCustomerFeedbackSelectedTags] = useState<string[]>([]);

  // Trip execution inputs
  const [pickupOtpInput, setPickupOtpInput] = useState<string>('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<string>('');
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>('');

  // Modals & Drawers (Changes Required)
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [showIncomingTripModal, setShowIncomingTripModal] = useState<boolean>(false);
  const [dismissedTripIds, setDismissedTripIds] = useState<string[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showIncentivesModal, setShowIncentivesModal] = useState<boolean>(false);
  const [showDriverTopupModal, setShowDriverTopupModal] = useState<boolean>(false);
  const [walletModalTab, setWalletModalTab] = useState<'recharge' | 'withdraw'>('recharge');
  const [driverTopupAmt, setDriverTopupAmt] = useState<number>(200);

  // New Features States (Changes Required Items 1, 4, 5, 6, 9, 11, 12)
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [showNoticeboardModal, setShowNoticeboardModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showEarningsModal, setShowEarningsModal] = useState<boolean>(false);
  const [showReferModal, setShowReferModal] = useState<boolean>(false);
  const [showTrainingsModal, setShowTrainingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [selectedDriverHelpTopicId, setSelectedDriverHelpTopicId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Dark / Light Mode state for visual comfort (Changes Required Item 12)
  const [darkMode, setDarkMode] = useState<boolean>(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('swifload_driver_theme');
      if (saved) setDarkMode(saved === 'dark');
    } catch {}
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('swifload_driver_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Multi-stop Next Stop Popup (Changes Required Item 1 & 8)
  const [nextStopModalData, setNextStopModalData] = useState<{
    completedStop: TripStop;
    nextStop: TripStop;
    tripId: string;
  } | null>(null);

  // QR Payment Modal (Changes Required Item 4)
  const [activeQrModalStop, setActiveQrModalStop] = useState<{
    stop: TripStop;
    bookingCode: string;
  } | null>(null);

  // Stop OTP inputs (Changes Required Item 3)
  const [stopOtpInputs, setStopOtpInputs] = useState<{ [stopId: string]: string }>({});

  // Notifications filter tab (Changes Required Item 6)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

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

  // Settings Form States (Changes Required Lines 18-24)
  const [profileName, setProfileName] = useState<string>(currentDriver.name);
  const [profilePhone, setProfilePhone] = useState<string>(currentDriver.phone);
  const [profileEmail, setProfileEmail] = useState<string>(currentDriver.email);
  const [profileVehicleModel, setProfileVehicleModel] = useState<string>(currentDriver.vehicleModel);
  const [profileVehicleNumber, setProfileVehicleNumber] = useState<string>(currentDriver.vehicleNumber);

  const [commAddress, setCommAddress] = useState<string>(currentDriver.residentialAddress || 'No. 42, Cross Cut Road, Gandhipuram');
  const [commCity, setCommCity] = useState<string>(currentDriver.city || 'Coimbatore');
  const [commPincode, setCommPincode] = useState<string>(currentDriver.pincode || '641012');
  const [commEmergencyName, setCommEmergencyName] = useState<string>(currentDriver.emergencyContactName || 'Kavitha (Spouse)');
  const [commEmergencyPhone, setCommEmergencyPhone] = useState<string>(currentDriver.emergencyContactNumber || '+91 98422 99881');

  const [bankAccNameEdit, setBankAccNameEdit] = useState<string>(currentDriver.bankDetails.accountName);
  const [bankAccNumEdit, setBankAccNumEdit] = useState<string>(currentDriver.bankDetails.accountNumber);
  const [bankNameEdit, setBankNameEdit] = useState<string>(currentDriver.bankDetails.bankName || 'HDFC Bank');
  const [bankBranchEdit, setBankBranchEdit] = useState<string>(currentDriver.bankDetails.branchName || 'Gandhipuram Branch');
  const [bankIfscEdit, setBankIfscEdit] = useState<string>(currentDriver.bankDetails.ifscCode);
  const [bankUpiEdit, setBankUpiEdit] = useState<string>(currentDriver.bankDetails.upiId);

  const [nativeLanguagePref, setNativeLanguagePref] = useState<string>(currentDriver.nativeLanguage || 'Tamil');
  const [spokenLanguagesPref, setSpokenLanguagesPref] = useState<string[]>(currentDriver.spokenLanguages || ['Tamil', 'English']);

  useEffect(() => {
    setProfileName(currentDriver.name);
    setProfilePhone(currentDriver.phone);
    setProfileEmail(currentDriver.email);
    setProfileVehicleModel(currentDriver.vehicleModel);
    setProfileVehicleNumber(currentDriver.vehicleNumber);
    setCommAddress(currentDriver.residentialAddress || 'No. 42, Cross Cut Road, Gandhipuram');
    setCommCity(currentDriver.city || 'Coimbatore');
    setCommPincode(currentDriver.pincode || '641012');
    setCommEmergencyName(currentDriver.emergencyContactName || 'Kavitha (Spouse)');
    setCommEmergencyPhone(currentDriver.emergencyContactNumber || '+91 98422 99881');
    setBankAccNameEdit(currentDriver.bankDetails.accountName);
    setBankAccNumEdit(currentDriver.bankDetails.accountNumber);
    setBankNameEdit(currentDriver.bankDetails.bankName || 'HDFC Bank');
    setBankBranchEdit(currentDriver.bankDetails.branchName || 'Gandhipuram Branch');
    setBankIfscEdit(currentDriver.bankDetails.ifscCode);
    setBankUpiEdit(currentDriver.bankDetails.upiId);
    setNativeLanguagePref(currentDriver.nativeLanguage || 'Tamil');
    setSpokenLanguagesPref(currentDriver.spokenLanguages || ['Tamil', 'English']);
  }, [currentDriver]);

  // Negative balance rule (Changes Required Item 5 / 11):
  // If amount is more than minus Rs. 200 (i.e. balance <= -200), blocked from getting pickup calls.
  const isDriverBlocked = currentDriver.wallet.balance <= -200;

  // Cancellation Cooldown / Lockout Penalty (Illness: 1h, Breakdown: 2h, Personal: 4h, Emergency: 6h):
  const lockoutInfo = isDriverInLockout(currentDriver.id);
  const isDriverLockedOut = lockoutInfo.isLocked;

  // Active assigned trip for this driver
  const assignedTrip = trips.find(
    (t) =>
      t.driverId === currentDriver.id &&
      ['DRIVER_ASSIGNED', 'ARRIVING_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'ARRIVED_DESTINATION'].includes(t.status)
  );

  // Waiting Fare Accrual Effect when driver has reached pickup (Changes Required Item 14)
  useEffect(() => {
    if (!assignedTrip || assignedTrip.status !== 'AT_PICKUP' || !assignedTrip.driverReachedPickupAt) {
      return;
    }

    const interval = setInterval(() => {
      const arrivedTime = new Date(assignedTrip.driverReachedPickupAt!).getTime();
      const waitingTotalSecs = Math.max(0, Math.floor((Date.now() - arrivedTime) / 1000));
      // 3 minutes free waiting window (180 seconds)
      if (waitingTotalSecs > 180) {
        const excessSecs = waitingTotalSecs - 180;
        const excessMinutes = Math.ceil(excessSecs / 60);
        const ratePerMin =
          assignedTrip.vehicleCategory === '2wheeler' ? 2 :
          assignedTrip.vehicleCategory === '3wheeler' ? 3 :
          assignedTrip.vehicleCategory === 'pickup_8ft' ? 6 : 5;
        const newWaitingFare = excessMinutes * ratePerMin;

        if (assignedTrip.waitingMinutes !== excessMinutes || assignedTrip.waitingCharge !== newWaitingFare) {
          updateTripWaitingFare(assignedTrip.id, excessMinutes, newWaitingFare);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [assignedTrip?.id, assignedTrip?.status, assignedTrip?.driverReachedPickupAt, assignedTrip?.waitingMinutes, assignedTrip?.waitingCharge, assignedTrip?.vehicleCategory, updateTripWaitingFare]);

  // Drop Waiting Fare Accrual Effect when driver has reached drop destination (Changes Required Item 20)
  useEffect(() => {
    if (!assignedTrip || assignedTrip.status !== 'ARRIVED_DESTINATION' || !assignedTrip.driverReachedDropAt) {
      return;
    }

    const interval = setInterval(() => {
      const arrivedTime = new Date(assignedTrip.driverReachedDropAt!).getTime();
      const waitingTotalSecs = Math.max(0, Math.floor((Date.now() - arrivedTime) / 1000));
      // 3 minutes free waiting window (180 seconds)
      if (waitingTotalSecs > 180) {
        const excessSecs = waitingTotalSecs - 180;
        const excessMinutes = Math.ceil(excessSecs / 60);
        const ratePerMin =
          assignedTrip.vehicleCategory === '2wheeler' ? 2 :
          assignedTrip.vehicleCategory === '3wheeler' ? 3 :
          assignedTrip.vehicleCategory === 'pickup_8ft' ? 6 : 5;
        const newDropWaitingFare = excessMinutes * ratePerMin;
        const currentPickupWaiting = (assignedTrip.waitingMinutes || 0) * ratePerMin;
        const combinedWaitingFare = currentPickupWaiting + newDropWaitingFare;
        const combinedMinutes = (assignedTrip.waitingMinutes || 0) + excessMinutes;

        if (assignedTrip.dropWaitingMinutes !== excessMinutes || assignedTrip.dropWaitingCharge !== newDropWaitingFare) {
          updateTripWaitingFare(assignedTrip.id, combinedMinutes, combinedWaitingFare, excessMinutes, newDropWaitingFare);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [assignedTrip?.id, assignedTrip?.status, assignedTrip?.driverReachedDropAt, assignedTrip?.dropWaitingMinutes, assignedTrip?.waitingMinutes, assignedTrip?.vehicleCategory, updateTripWaitingFare]);

  // GPS Simulation Effect for active order (Changes Required Items 13 & 17)
  useEffect(() => {
    if (!isSimulatingGps || !assignedTrip) return;

    const interval = setInterval(() => {
      const target = assignedTrip.status === 'IN_TRANSIT' ? assignedTrip.drop : assignedTrip.pickup;
      const currentLoc = driverSimCoords || assignedTrip.driverLocation || currentDriver.currentLocation;
      
      const step = 0.0018;
      const latDiff = target.lat - currentLoc.lat;
      const lngDiff = target.lng - currentLoc.lng;
      const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (dist < 0.002) {
        setIsSimulatingGps(false);
        const arrivedLoc = { lat: target.lat, lng: target.lng };
        setDriverSimCoords(arrivedLoc);
        assignedTrip.driverLocation = arrivedLoc;
        currentDriver.currentLocation = arrivedLoc;
        showToast(`GPS Simulation: Driver reached ${assignedTrip.status === 'IN_TRANSIT' ? 'Destination' : 'Pickup'}!`);
      } else {
        const nextLat = currentLoc.lat + (latDiff / dist) * step;
        const nextLng = currentLoc.lng + (lngDiff / dist) * step;
        const nextLoc = { lat: nextLat, lng: nextLng };
        setDriverSimCoords(nextLoc);
        assignedTrip.driverLocation = nextLoc;
        currentDriver.currentLocation = nextLoc;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulatingGps, assignedTrip, currentDriver, driverSimCoords, showToast]);

  // Unaccepted trips currently offered to this driver's assigned group
  const availableGroupTrips = trips.filter(
    (t) =>
      t.status === 'SEARCHING' &&
      t.currentDispatchGroupId === currentDriver.groupId
  );

  // Active incoming task popup target (blocked drivers and drivers on cancellation lockout do NOT receive pickup calls)
  const activeIncomingTrip =
    !isDriverBlocked && !isDriverLockedOut && !assignedTrip && currentDriver.isOnline
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

    if (assignedTrip.status === 'DRIVER_ASSIGNED') {
      setPickupTransitStartTime(Date.now());
      setIsSimulatingGps(true);
      advanceTripStatus(assignedTrip.id);
      showToast('Started pickup navigation! Driving to pickup location.');
      return;
    }

    if (assignedTrip.status === 'ARRIVING_PICKUP') {
      setIsSimulatingGps(false);
      if (assignedTrip.pickup) setDriverSimCoords(assignedTrip.pickup);
      markDriverReachedPickup(assignedTrip.id);
      return;
    }

    if (assignedTrip.status === 'AT_PICKUP') {
      const res = advanceTripStatus(assignedTrip.id, pickupOtpInput);
      if (res.success) {
        setPickupOtpInput('');
        setDriverSimCoords(assignedTrip.pickup);
        showToast('Pickup completed! Location updated on map.');
      }
      return;
    }

    if (assignedTrip.status === 'IN_TRANSIT') {
      setIsSimulatingGps(false);
      setIsDropTransitActive(false);
      setDropTransitStoppedTime(Date.now());
      if (assignedTrip.drop) setDriverSimCoords(assignedTrip.drop);
      const res = advanceTripStatus(assignedTrip.id);
      if (res.success) {
        showToast('Reached drop location. 3-minute waiting timer started.');
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
        showToast('Delivery verified! Please collect payment via Company QR code.');
        setShowCompanyQrPayModal(true);
      }
      return;
    }

    advanceTripStatus(assignedTrip.id);
  };

  const handleStartDrop = () => {
    if (!assignedTrip) return;
    setDropTransitStartTime(Date.now());
    setDropTransitStoppedTime(null);
    setIsDropTransitActive(true);
    setIsSimulatingGps(true);
    if (assignedTrip.status !== 'IN_TRANSIT') {
      advanceTripStatus(assignedTrip.id);
    }
    showToast('Started drop navigation! Heading towards destination.');
  };

  return (
    <div className={`flex flex-col h-full pb-20 md:pb-6 transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* ================= FLOWER SHOWER SPLASH SCREEN ON LAUNCH ================= */}
      {showSplash && (
        <FlowerShowerSplash
          onDismiss={() => setShowSplash(false)}
          role="driver"
          userName={currentDriver.name}
        />
      )}

      {/* ================= TOP DRIVER RIBBON (MATCHES CUSTOMER APP) ================= */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-3 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-30">
        {/* Left: Side Menu Hamburger Button & Brand Name */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSideMenu(true)}
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
              {brandConfig.appName} Driver
            </h1>
          </div>
        </div>

        {/* Right Edge: Notifications, Help, Theme Toggle & Online Switch */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Notifications Button on Top Ribbon */}
          <button
            type="button"
            onClick={() => setShowNotificationsModal(true)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors relative border border-white/20"
            title="Driver Notifications"
          >
            <Bell className="w-4 h-4" />
            {driverNotifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                {driverNotifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* Help Button on Top Ribbon */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
            title="Driver Help & FAQs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          {/* Primary Online/Offline Switch */}
          <button
            type="button"
            onClick={() => toggleDriverOnline(currentDriver.id)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black shadow transition-all ${
              currentDriver.isOnline
                ? 'bg-white text-emerald-800 hover:bg-emerald-50 ring-1 ring-white/50'
                : 'bg-rose-900/80 text-rose-200 border border-rose-400/50 hover:bg-rose-800'
            }`}
            title="Toggle Duty Status"
          >
            <Power className="w-3 h-3" />
            <span className="whitespace-nowrap">{currentDriver.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Item 5 & 11: Negative Balance Noticeboard Warning Banner (Recharge within 5 days or mobile number blocked) */}
      {isDriverBlocked && (
        <div className="bg-rose-950/95 border-b-2 border-rose-600 px-4 py-2.5 flex items-center justify-between text-rose-200 text-xs shadow-lg">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div className="min-w-0 flex-1 text-[11px] leading-tight">
              <span className="font-extrabold text-white">⚠️ NEGATIVE BALANCE ACTION REQUIRED: </span>
              <span>
                Wallet is -₹{Math.abs(currentDriver.wallet.balance)} (≤ -₹200). Recharge within 5 days, failing which your mobile number ({currentDriver.phone}) will be blocked from receiving calls.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNoticeboardModal(true)}
            className="ml-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-[11px] whitespace-nowrap shrink-0 shadow transition-all hover:scale-105"
          >
            Open Noticeboard ➔
          </button>
        </div>
      )}

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
          {/* Driver Profile Identity Card (Transferred from top ribbon) */}
          <div className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between transition-colors ${
            darkMode
              ? 'bg-slate-950 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={currentDriver.avatar}
                  alt={currentDriver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                    darkMode ? 'border-slate-950' : 'border-white'
                  } ${currentDriver.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className={`font-black text-sm sm:text-base tracking-tight truncate ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {currentDriver.name}
                  </h2>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {currentDriver.id}
                  </span>
                  {isDriverBlocked && (
                    <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0 animate-pulse">
                      Blocked
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 truncate flex items-center space-x-2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className="font-semibold text-emerald-500">{currentDriver.vehicleNumber}</span>
                  <span>•</span>
                  <span>⭐ {currentDriver.rating || 4.9}</span>
                  <span>•</span>
                  <span className="truncate">{currentDriver.vehicleModel}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className={`shrink-0 ml-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                darkMode
                  ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              Profile ➔
            </button>
          </div>

          {/* ================= TOP METRIC BUTTON CARDS ================= */}
          {/* Requirements 1, 2, 3, 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Today's Earnings Card */}
            <div className={`rounded-2xl p-3.5 border shadow flex flex-col justify-between transition-colors ${
              darkMode
                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Today&apos;s Earnings
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-500 mt-1">
                  ₹{currentDriver.wallet.todayEarnings}
                </div>
              </div>

              {/* Requirement 2: 'History' moved under 'Today's earnings' */}
              <button
                type="button"
                onClick={() => {
                  setDriverPage('trips');
                  setShowHistoryModal(true);
                }}
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-bold text-emerald-500 hover:text-emerald-400 group cursor-pointer ${
                  darkMode ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <History className="w-3 h-3 text-emerald-500" />
                  <span>History</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* 2. Total Incentives Card */}
            <div className={`rounded-2xl p-3.5 border shadow flex flex-col justify-between transition-colors ${
              darkMode
                ? 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                : 'bg-white border-slate-200 shadow-sm hover:border-amber-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center space-x-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span>Total Incentives</span>
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                    Admin Slabs
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  ₹{incentiveResult.totalIncentive}
                </div>
              </div>

              {/* Requirement 3: Renamed as 'Incentives' and moved below Total Incentives */}
              <button
                type="button"
                onClick={() => setShowIncentivesModal(true)}
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-bold text-amber-500 hover:text-amber-400 group cursor-pointer ${
                  darkMode ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>Incentives</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* 3. Overall Wallet Balance Card */}
            <div className={`rounded-2xl p-3.5 border shadow flex flex-col justify-between transition-colors ${
              isDriverBlocked
                ? 'bg-rose-950/40 border-rose-700/80 hover:border-rose-500'
                : currentDriver.wallet.balance < 0
                ? darkMode
                  ? 'bg-amber-950/30 border-amber-800/60 hover:border-amber-500'
                  : 'bg-amber-50 border-amber-300 hover:border-amber-400'
                : darkMode
                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Wallet className="w-3 h-3 text-emerald-500" />
                    <span>Wallet Balance</span>
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isDriverBlocked
                        ? 'bg-rose-500/30 text-rose-300'
                        : currentDriver.wallet.balance < 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-500'
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
                      ? 'text-amber-500'
                      : darkMode
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {currentDriver.wallet.balance < 0
                    ? `-₹${Math.abs(currentDriver.wallet.balance)}`
                    : `₹${currentDriver.wallet.balance}`}
                </div>
              </div>

              {/* Requirement 4: Text below Wallet Balance removed, and 'Recharge / Withdraw' moved to there */}
              <button
                type="button"
                onClick={() => {
                  setWalletModalTab('recharge');
                  setShowDriverTopupModal(true);
                }}
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-bold text-emerald-500 hover:text-emerald-400 group cursor-pointer ${
                  darkMode ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <Plus className="w-3 h-3 text-emerald-500" />
                  <span>Recharge / Withdraw</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
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

          {/* ================= DRIVER CANCELLATION LOCKOUT / COOLDOWN BANNER ================= */}
          {isDriverLockedOut && (
            <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-rose-500/90 rounded-3xl p-4.5 space-y-3 shadow-2xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
                    {lockoutInfo.lockout?.reason === 'Illness'
                      ? '🤒'
                      : lockoutInfo.lockout?.reason === 'Vehicle breakdown'
                      ? '🚛'
                      : lockoutInfo.lockout?.reason === 'Priority personal work'
                      ? '💼'
                      : '🚨'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Order Taking Suspended
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        {lockoutInfo.lockout?.lockoutHours
                          ? lockoutInfo.lockout.lockoutHours < 1
                            ? `${Math.round(lockoutInfo.lockout.lockoutHours * 60)}m Admin Cooldown`
                            : `${lockoutInfo.lockout.lockoutHours}h Admin Cooldown`
                          : 'Admin Cooldown'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1">
                      Standby Active: {lockoutInfo.lockout?.reason}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Order #{lockoutInfo.lockout?.bookingCode || 'SWF-CBE'} was cancelled. Per safety & fulfillment policy, order dispatch is locked for the duration configured in the Admin Portal.
                    </p>
                    <div className="text-[11px] text-emerald-300/90 font-medium mt-1 flex items-center space-x-1">
                      <span>✓ Duty will automatically resume ONLINE when countdown finishes.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown Box */}
              <div className="bg-slate-950/90 border border-rose-800/60 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>Cooldown Remaining</span>
                  </div>
                  <div className="text-lg font-black text-amber-300 font-mono">
                    {lockoutInfo.remainingHours > 0
                      ? `${lockoutInfo.remainingHours}h ${lockoutInfo.remainingMinutes % 60}m ${lockoutInfo.remainingSeconds % 60}s`
                      : `${lockoutInfo.remainingMinutes}m ${lockoutInfo.remainingSeconds % 60}s`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Unlocks At</div>
                  <div className="text-xs font-bold text-white font-mono">
                    {lockoutInfo.lockout?.lockedUntil
                      ? new Date(lockoutInfo.lockout.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Soon'}
                  </div>
                </div>
              </div>

              {/* Testing / Admin Waive action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 italic">Duration configured in Admin Portal</span>
                <button
                  type="button"
                  onClick={() => waiveDriverLockout(currentDriver.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  Waive Lockout (Resume Online)
                </button>
              </div>
            </div>
          )}

          {/* ================= PROMINENT WELCOME CARD ================= */}
          {/* Clicking on it will take the driver to a dedicated page for live pickup calls */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 border-2 border-emerald-500/80 rounded-3xl p-4.5 shadow-2xl relative overflow-hidden space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live Dispatch Terminal
                </span>
                <h3 className="text-lg font-black text-white">
                  Welcome to Duty, {currentDriver.name}!
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                🚀
              </div>
            </div>

            {/* Active Order Card & Execution Link */}
            {assignedTrip && (
              <div className="space-y-2">
                <div className="p-3 bg-emerald-900/40 border border-emerald-600/50 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <div className="font-black text-white">Active Trip: {assignedTrip.bookingCode}</div>
                      <div className="text-[10px] text-emerald-300 font-mono capitalize">{assignedTrip.status.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <span className="text-emerald-300 font-black">₹{assignedTrip.fare.driverEarnings}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDriverPage('active_order')}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition-transform active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Active Order ➔</span>
                  </button>
                  {['DRIVER_ASSIGNED', 'ARRIVING_PICKUP', 'AT_PICKUP', 'IN_TRANSIT'].includes(assignedTrip.status) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCancelReason('Illness');
                        setShowCancelReasonModal(true);
                      }}
                      className="py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDriverPage('live_calls')}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-95 group"
            >
              <span>Welcome / Live Calls</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* ================= PROMINENT COMPANY OFFERS FOR DRIVERS ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  ⚡ {brandConfig.appName} Partner Offers & Incentives
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Active Today
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DRIVER_COMPANY_OFFERS.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 rounded-2xl border border-emerald-500/30 shadow space-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-lg">{offer.icon}</span>
                      <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                        {offer.badge}
                      </span>
                    </div>
                    <div className="font-extrabold text-white text-xs mt-1 leading-snug">{offer.title}</div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                    <span>{offer.validity}</span>
                    <span className="font-bold text-amber-300">{offer.code}</span>
                  </div>
                </div>
              ))}
            </div>
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

          {/* ================= SPONSORED ADS (Requirement 6: Rephrased to Sponsored, redundant ad badge removed) ================= */}
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sponsored
                </h4>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">2 Ads</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DRIVER_SPONSORED_ADS.slice(0, 2).map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-gradient-to-r ${ad.gradient} p-2.5 rounded-xl border shadow-sm flex items-center justify-between gap-2.5`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-base shrink-0 shadow">
                      {ad.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-black text-white truncate">{ad.brand}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-200 truncate mt-0.5">
                        {ad.title}
                      </h5>
                    </div>
                  </div>

                  <a
                    href={`tel:${ad.phone}`}
                    className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center space-x-1 transition-colors shadow"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    <span>{ad.cta}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 2: LIVE PICKUP DUTY RADAR TERMINAL =============== */}
      {/* ================= Changes Required Lines 26-31 =========================== */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ================= VIEW 2: LIVE CALLS TERMINAL (GPS MAP + AVAILABLE ORDERS) */}
      {/* ================= Changes Required Items 5-7 ============================= */}
      {/* ========================================================================= */}
      {(driverPage === 'live_calls' || driverPage === 'duty') && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header with Back to Dashboard Button */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Live GPS Radar
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* If driver is blocked due to negative balance (Dues > -200) */}
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

            {/* Lockout / Cooldown Banner */}
            {isDriverLockedOut && (
              <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-rose-500/90 rounded-3xl p-4.5 space-y-3 shadow-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
                    {lockoutInfo.lockout?.reason === 'Illness'
                      ? '🤒'
                      : lockoutInfo.lockout?.reason === 'Vehicle breakdown'
                      ? '🚛'
                      : lockoutInfo.lockout?.reason === 'Priority personal work'
                      ? '💼'
                      : '🚨'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Order Taking Suspended
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        {lockoutInfo.lockout?.lockoutHours
                          ? lockoutInfo.lockout.lockoutHours < 1
                            ? `${Math.round(lockoutInfo.lockout.lockoutHours * 60)}m Admin Standby`
                            : `${lockoutInfo.lockout.lockoutHours}h Admin Standby`
                          : 'Standby'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1">
                      Duty Cooldown: {lockoutInfo.lockout?.reason}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Dispatch is on hold for the time configured in Admin Portal. When this timer reaches 0, you will automatically be restored ONLINE to receive orders.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-rose-800/60 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                      <span>Remaining</span>
                    </div>
                    <div className="text-lg font-black text-amber-300 font-mono">
                      {lockoutInfo.remainingHours > 0
                        ? `${lockoutInfo.remainingHours}h ${lockoutInfo.remainingMinutes % 60}m ${lockoutInfo.remainingSeconds % 60}s`
                        : `${lockoutInfo.remainingMinutes}m ${lockoutInfo.remainingSeconds % 60}s`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Unlocks At</div>
                    <div className="text-xs font-bold text-white font-mono">
                      {lockoutInfo.lockout?.lockedUntil
                        ? new Date(lockoutInfo.lockout.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Soon'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 italic">Auto-resumes online when timer finishes</span>
                  <button
                    type="button"
                    onClick={() => waiveDriverLockout(currentDriver.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold border border-slate-700 transition-colors"
                  >
                    Waive Lockout (Resume Online)
                  </button>
                </div>
              </div>
            )}

            {/* Active Trip Banner if already assigned */}
            {assignedTrip && (
              <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Active Order #{assignedTrip.bookingCode}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-300 mt-0.5">
                    Stage: <strong className="capitalize">{assignedTrip.status.replace(/_/g, ' ')}</strong> • Net: ₹{assignedTrip.fare.driverEarnings}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDriverPage('active_order')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-transform active:scale-95"
                >
                  View Active Order ➔
                </button>
              </div>
            )}

            {/* Live GPS Map showing Driver Location in RED (Changes Required Items 6) */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 shadow-xl space-y-3">
              <div className="flex items-center justify-between px-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                  <Navigation className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Live Driver GPS Map (Coimbatore)</span>
                </div>
                <span className="text-[10px] text-red-400 font-mono bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-full font-bold">
                  ● Driver in Red
                </span>
              </div>

              <LeafletMap
                driver={{
                  lat: currentDriver.currentLocation.lat,
                  lng: currentDriver.currentLocation.lng,
                  label: `${currentDriver.name} (Current Location)`,
                  markerColor: 'red',
                }}
                className="h-80 w-full rounded-xl border border-slate-800"
              />

              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                <span>Coordinates: {currentDriver.currentLocation.lat.toFixed(4)}, {currentDriver.currentLocation.lng.toFixed(4)}</span>
                <span className="font-semibold text-emerald-400">Online & Active</span>
              </div>
            </div>

            {/* Prominent Button below Map: "Available Orders" (Changes Required Item 7) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDriverPage('available_orders')}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-95"
              >
                <span>Available Orders</span>
                <span className="bg-slate-950/20 text-slate-950 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                  {availableGroupTrips.length}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 2B: AVAILABLE ORDERS & SLIDING POPUP ============= */}
      {/* ================= Changes Required Items 8-12 ============================ */}
      {/* ========================================================================= */}
      {driverPage === 'available_orders' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header with Back to Live Calls Radar */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('live_calls')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back to Live GPS</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                Available Orders ({availableGroupTrips.length})
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* Active Trip Banner if already assigned */}
            {assignedTrip && (
              <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Active Order #{assignedTrip.bookingCode}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-300 mt-0.5">
                    Stage: <strong className="capitalize">{assignedTrip.status.replace(/_/g, ' ')}</strong> • Net: ₹{assignedTrip.fare.driverEarnings}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDriverPage('active_order')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-transform active:scale-95"
                >
                  View Active Order ➔
                </button>
              </div>
            )}

            {/* Lockout / Cooldown Banner in Available Orders */}
            {isDriverLockedOut && (
              <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-rose-500/90 rounded-3xl p-4 space-y-3 shadow-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-lg shrink-0">
                    {lockoutInfo.lockout?.reason === 'Illness'
                      ? '🤒'
                      : lockoutInfo.lockout?.reason === 'Vehicle breakdown'
                      ? '🚛'
                      : lockoutInfo.lockout?.reason === 'Priority personal work'
                      ? '💼'
                      : '🚨'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Duty Standby Active
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        {lockoutInfo.lockout?.lockoutHours
                          ? lockoutInfo.lockout.lockoutHours < 1
                            ? `${Math.round(lockoutInfo.lockout.lockoutHours * 60)}m Penalty`
                            : `${lockoutInfo.lockout.lockoutHours}h Penalty`
                          : 'Penalty'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1">
                      Reason: {lockoutInfo.lockout?.reason}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      You are paused from accepting orders for the admin-configured cooldown. Remaining time:
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-rose-800/60 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-amber-300 font-mono font-black text-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>
                      {lockoutInfo.remainingHours > 0
                        ? `${lockoutInfo.remainingHours}h ${lockoutInfo.remainingMinutes % 60}m ${lockoutInfo.remainingSeconds % 60}s`
                        : `${lockoutInfo.remainingMinutes}m ${lockoutInfo.remainingSeconds % 60}s`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Unlocks: {lockoutInfo.lockout?.lockedUntil ? new Date(lockoutInfo.lockout.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                  </div>
                  <button
                    type="button"
                    onClick={() => waiveDriverLockout(currentDriver.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors"
                  >
                    Waive Lockout
                  </button>
                </div>
              </div>
            )}

            {/* Available Orders List Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Available Orders Queue ({availableGroupTrips.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Timeout: 10s default
              </span>
            </div>

            {/* Available Orders List */}
            {availableGroupTrips.length === 0 ? (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                  📡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Orders in Queue</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Commercial freight bookings in Coimbatore fleet zone will appear here and in real-time sliding popups.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {availableGroupTrips.map((order) => {
                  const driverDistToPickup = calculateDistanceKm(
                    currentDriver.currentLocation,
                    order.pickup
                  );
                  const pickupDistToDrop = order.distanceKm || calculateDistanceKm(
                    order.pickup,
                    order.drop
                  );
                  const isMulti = (order.pickups?.length || 1) > 1 || (order.drops?.length || 1) > 1;

                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/60 transition-all flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-white">{order.bookingCode}</span>
                          {isMulti && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Multi-Stop
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ({driverDistToPickup} km to pickup)
                          </span>
                        </div>
                        <div className="text-xs text-slate-200 font-semibold truncate">
                          {order.pickup.area} ({driverDistToPickup} km) ➔ {order.drop.area} ({pickupDistToDrop} km)
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Cargo: {order.shipment.goodsCategory} (~{order.shipment.approxWeightKg}kg)
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-sm font-black text-emerald-400">₹{order.fare?.totalFare || order.fare?.driverEarnings}</div>
                        <button
                          type="button"
                          disabled={isDriverLockedOut}
                          onClick={() => {
                            if (isDriverLockedOut) {
                              const remLabel = lockoutInfo.remainingHours > 0
                                ? `${lockoutInfo.remainingHours}h ${lockoutInfo.remainingMinutes % 60}m`
                                : `${lockoutInfo.remainingMinutes}m ${lockoutInfo.remainingSeconds % 60}s`;
                              showToast(`Duty suspended (${lockoutInfo.lockout?.reason}). Order dispatch unlocks in ${remLabel}.`);
                              return;
                            }
                            const res = acceptTripByDriver(order.id, currentDriver.id);
                            if (res.success) {
                              showToast(`Accepted order ${order.bookingCode}! Opening Active Order...`);
                              setDriverPage('active_order');
                            }
                          }}
                          className={`px-3.5 py-1.5 font-black rounded-xl text-xs shadow transition-transform ${
                            isDriverLockedOut
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
                          }`}
                        >
                          {isDriverLockedOut ? 'Locked' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sliding Popup Overlay (Changes Required Items 9-12) */}
            {availableGroupTrips.length > 0 && !isDriverLockedOut && !dismissDutyPopups && (() => {
              const safeIndex = Math.min(dutySlidingIndex, availableGroupTrips.length - 1);
              const order = availableGroupTrips[safeIndex];
              if (!order) return null;

              // Distance from driver location to pickup in km
              const driverDistToPickup = calculateDistanceKm(
                currentDriver.currentLocation,
                order.pickup
              );

              // Distance from pickup to drop in km
              const pickupDistToDrop = order.distanceKm || calculateDistanceKm(
                order.pickup,
                order.drop
              );

              // Default 10 seconds countdown
              const countdown = order.dispatchCountdownSecs !== undefined ? Math.min(10, order.dispatchCountdownSecs) : 10;
              const progressPct = Math.max(0, Math.min(100, (countdown / 10) * 100));

              return (
                <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 z-30 animate-in slide-in-from-bottom duration-300">
                  <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl p-4.5 space-y-3.5 shadow-2xl ring-2 ring-emerald-500/20 backdrop-blur-xl">
                    {/* Header: Total Charge on Top (Item 10) */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Charge</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                          ₹{order.fare?.totalFare || order.fare?.driverEarnings}
                        </div>
                      </div>

                      {/* Timer clock with seconds countdown happening from 10 seconds (Item 11) */}
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="bg-amber-400 h-full transition-all duration-1000 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{countdown}s</span>
                        </span>
                      </div>
                    </div>

                    {/* Pickup locality with distance from driver in km (Item 10) */}
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-200">
                            Pickup: {order.pickup.area} <span className="text-emerald-400 font-mono font-black">({driverDistToPickup} km)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug">{order.pickup.address}</div>
                        </div>
                      </div>

                      {/* Drop locality and distance from pickup in km (Item 10) */}
                      <div className="flex items-start space-x-2 pt-2 border-t border-slate-800/80">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-200">
                            Drop: {order.drop.area} <span className="text-rose-400 font-mono font-black">({pickupDistToDrop} km)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug">{order.drop.address}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Skip (closes immediately) & Accept (Item 12 & 13) */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDismissDutyPopups(true);
                          showToast('Popup skipped');
                        }}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                      >
                        Skip
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const res = acceptTripByDriver(order.id, currentDriver.id);
                          if (res.success) {
                            showToast(`Order ${order.bookingCode} accepted! Opening Active Order...`);
                            setDriverPage('active_order');
                          }
                        }}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
                      >
                        <span>Accept Order (₹{order.fare?.totalFare || order.fare?.driverEarnings}) ➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* If popups dismissed, show button to restore them */}
            {availableGroupTrips.length > 0 && dismissDutyPopups && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setDismissDutyPopups(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold shadow"
                >
                  🔔 Show Order Alerts ({availableGroupTrips.length} Waiting)
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* ================= VIEW 3: DEDICATED ACTIVE ORDER EXECUTION PAGE ========= */}
      {/* ================= Changes Required Lines 33-45 =========================== */}
      {/* ========================================================================= */}
      {driverPage === 'active_order' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Dashboard</span>
            </button>

            <div className="flex items-center space-x-2">
              {assignedTrip && ['DRIVER_ASSIGNED', 'ARRIVING_PICKUP', 'AT_PICKUP', 'IN_TRANSIT'].includes(assignedTrip.status) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCancelReason('Vehicle breakdown');
                    setShowCancelReasonModal(true);
                  }}
                  className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Cancel Order</span>
                </button>
              )}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                {assignedTrip ? `Active Order: ${assignedTrip.bookingCode}` : 'Order Execution'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {!assignedTrip ? (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                  📦
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">No Active Order In Progress</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You currently have no active trip assigned. Head over to the Live Duty terminal to receive and accept bookings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDriverPage('duty')}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Go to Live Duty Radar ➔
                </button>
              </div>
            ) : (() => {
              const tripStops: TripStop[] = assignedTrip.stops && assignedTrip.stops.length > 0
                ? assignedTrip.stops
                : [
                    {
                      id: `stop_${assignedTrip.id}_p1`,
                      sequence: 1,
                      type: 'PICKUP',
                      label: 'Pickup 1',
                      area: assignedTrip.pickup.area,
                      address: assignedTrip.pickup.address,
                      lat: assignedTrip.pickup.lat,
                      lng: assignedTrip.pickup.lng,
                      contactName: assignedTrip.pickup.senderOrReceiverName || assignedTrip.customerName,
                      contactPhone: assignedTrip.pickup.senderOrReceiverPhone || assignedTrip.customerPhone,
                      associatedCharge: Math.round(assignedTrip.fare.totalFare * 0.4),
                      distanceCoveredKm: Math.round((assignedTrip.distanceKm * 0.4) * 10) / 10,
                      status: ['ARRIVING_PICKUP', 'AT_PICKUP'].includes(assignedTrip.status)
                        ? 'IN_PROGRESS'
                        : ['IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERED'].includes(assignedTrip.status)
                        ? 'COMPLETED'
                        : 'PENDING',
                      otp: assignedTrip.shipment.pickupOtp,
                    },
                    {
                      id: `stop_${assignedTrip.id}_d1`,
                      sequence: 2,
                      type: 'DROP',
                      label: 'Drop 1',
                      area: assignedTrip.drop.area,
                      address: assignedTrip.drop.address,
                      lat: assignedTrip.drop.lat,
                      lng: assignedTrip.drop.lng,
                      contactName: assignedTrip.drop.senderOrReceiverName || 'Receiver',
                      contactPhone: assignedTrip.drop.senderOrReceiverPhone || '9842211990',
                      associatedCharge: Math.round(assignedTrip.fare.totalFare * 0.6),
                      distanceCoveredKm: Math.round((assignedTrip.distanceKm * 0.6) * 10) / 10,
                      status: ['ARRIVED_DESTINATION'].includes(assignedTrip.status)
                        ? 'IN_PROGRESS'
                        : assignedTrip.status === 'DELIVERED'
                        ? 'COMPLETED'
                        : 'PENDING',
                      otp: assignedTrip.shipment.deliveryOtp,
                    },
                  ];

              const completedStopsCount = tripStops.filter((s) => s.status === 'COMPLETED').length;
              const isMultiStop = tripStops.length > 2 || (assignedTrip.pickups && assignedTrip.pickups.length > 1) || (assignedTrip.drops && assignedTrip.drops.length > 1);

              // Waiting Time & Accrual Calculation (Lines 37-39)
              const arrivedTime = assignedTrip.driverReachedPickupAt ? new Date(assignedTrip.driverReachedPickupAt).getTime() : 0;
              const waitingTotalSecs = arrivedTime > 0 ? Math.max(0, Math.floor((now - arrivedTime) / 1000)) : 0;
              const isWithinFreeWindow = waitingTotalSecs <= 180;
              const freeSecsLeft = Math.max(0, 180 - waitingTotalSecs);
              const excessSecs = Math.max(0, waitingTotalSecs - 180);
              const excessMins = Math.ceil(excessSecs / 60);
              const ratePerMin =
                assignedTrip.vehicleCategory === '2wheeler' ? 2 :
                assignedTrip.vehicleCategory === '3wheeler' ? 3 :
                assignedTrip.vehicleCategory === 'pickup_8ft' ? 6 : 5;
              const liveWaitingCharge = excessMins * ratePerMin;

              // Elapsed trip time & distance covered (Line 42)
              const tripElapsedMins = Math.max(1, Math.round((now - new Date(assignedTrip.createdAt).getTime()) / 60000));
              const distanceCoveredKm = assignedTrip.totalActualDistanceKm || assignedTrip.distanceKm;

              return (
                <div className="space-y-4">
                  {/* Live Map with Route & Live Tracking Simulation */}
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-2 shadow-xl space-y-2">
                    <div className="flex items-center justify-between px-2 pt-1 text-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-300">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live Route & Real-Time Tracking</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {assignedTrip.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <LeafletMap
                      pickup={{ lat: assignedTrip.pickup.lat, lng: assignedTrip.pickup.lng, label: 'Pickup' }}
                      drop={{ lat: assignedTrip.drop.lat, lng: assignedTrip.drop.lng, label: 'Drop' }}
                      driver={{
                        lat: driverSimCoords?.lat || assignedTrip.driverLocation?.lat || currentDriver.currentLocation.lat,
                        lng: driverSimCoords?.lng || assignedTrip.driverLocation?.lng || currentDriver.currentLocation.lng,
                        label: 'Driver (Live)',
                      }}
                      targetDestination={['IN_TRANSIT', 'ARRIVED_DESTINATION'].includes(assignedTrip.status) ? 'drop' : 'pickup'}
                      className="h-64 w-full rounded-2xl border border-slate-800"
                    />

                    {/* GPS Simulation Controls & Google Maps Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSimulatingGps((prev) => !prev);
                          showToast(isSimulatingGps ? 'GPS Simulation stopped' : 'GPS Simulation started (moving on route)...');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                          isSimulatingGps
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>📡</span>
                        <span>{isSimulatingGps ? 'Simulating GPS Live (Moving)' : 'Start GPS Simulation'}</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${
                          assignedTrip.status === 'AT_PICKUP' || assignedTrip.status === 'IN_TRANSIT'
                            ? `${assignedTrip.drop.lat},${assignedTrip.drop.lng}`
                            : `${assignedTrip.pickup.lat},${assignedTrip.pickup.lng}`
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Maps Turn-by-Turn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Booking Details Card with Dynamic Transit Timers & Distance Trackers (Items 13, 17, 19) */}
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-sm font-black text-white">{assignedTrip.bookingCode}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                          Vehicle: <strong className="text-white">{assignedTrip.vehicleCategory.replace(/_/g, ' ')}</strong> • Cargo: {assignedTrip.shipment.goodsCategory} (~{assignedTrip.shipment.approxWeightKg}kg)
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-3 py-1 rounded-xl">
                        Net: ₹{assignedTrip.fare.driverEarnings}
                      </span>
                    </div>

                    {/* Active Pickup Transit Tracker (Item 13: Time Elapsed & Distance Travelled) */}
                    {assignedTrip.status === 'ARRIVING_PICKUP' && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-600/60 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                            <span>En Route to Pickup Tracker</span>
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                            Live Moving
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Time Elapsed</div>
                            <div className="text-sm font-black text-white mt-0.5 font-mono">
                              {pickupTransitStartTime
                                ? `${Math.floor((now - pickupTransitStartTime) / 60000)}m ${Math.floor(((now - pickupTransitStartTime) % 60000) / 1000)}s`
                                : `${tripElapsedMins}m`}
                            </div>
                          </div>
                          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Distance Travelled</div>
                            <div className="text-sm font-black text-emerald-400 mt-0.5 font-mono">
                              {(() => {
                                const currentLoc = driverSimCoords || assignedTrip.driverLocation || currentDriver.currentLocation;
                                const originalDriverLoc = currentDriver.currentLocation;
                                const moved = calculateDistanceKm(originalDriverLoc, currentLoc);
                                return `${Math.max(0.1, moved)} km`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Drop Transit Tracker (Item 17 & 19: Time Elapsed & Distance Still Pending) */}
                    {(assignedTrip.status === 'IN_TRANSIT' || assignedTrip.status === 'ARRIVED_DESTINATION') && (
                      <div className={`p-3 rounded-2xl border space-y-2 ${
                        assignedTrip.status === 'ARRIVED_DESTINATION'
                          ? 'bg-slate-900/60 border-slate-700'
                          : 'bg-emerald-950/50 border-emerald-600/60'
                      }`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                            <Clock className={`w-3.5 h-3.5 text-emerald-400 ${assignedTrip.status === 'IN_TRANSIT' ? 'animate-spin' : ''}`} />
                            <span>{assignedTrip.status === 'ARRIVED_DESTINATION' ? 'Drop Transit Completed (Stopped)' : 'Drop Transit Tracker'}</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            assignedTrip.status === 'ARRIVED_DESTINATION'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {assignedTrip.status === 'ARRIVED_DESTINATION' ? 'Timer Stopped' : 'Live In Transit'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Time Elapsed</div>
                            <div className="text-sm font-black text-white mt-0.5 font-mono">
                              {(() => {
                                const start = dropTransitStartTime || (assignedTrip.driverReachedPickupAt ? new Date(assignedTrip.driverReachedPickupAt).getTime() : now);
                                const end = assignedTrip.status === 'ARRIVED_DESTINATION' && dropTransitStoppedTime ? dropTransitStoppedTime : now;
                                const diff = Math.max(0, end - start);
                                return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
                              })()}
                            </div>
                          </div>
                          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Distance Still Pending</div>
                            <div className="text-sm font-black text-amber-300 mt-0.5 font-mono">
                              {(() => {
                                if (assignedTrip.status === 'ARRIVED_DESTINATION') return '0.0 km';
                                const currentLoc = driverSimCoords || assignedTrip.driverLocation || currentDriver.currentLocation;
                                const pending = calculateDistanceKm(currentLoc, assignedTrip.drop);
                                return `${Math.max(0, pending)} km`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard Trip Info Summary */}
                    {['DRIVER_ASSIGNED', 'AT_PICKUP'].includes(assignedTrip.status) && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Total Route</div>
                          <div className="text-sm font-black text-white mt-0.5 font-mono">{assignedTrip.distanceKm} km</div>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Platform Charge</div>
                          <div className="text-sm font-black text-slate-300 mt-0.5 font-mono">₹{assignedTrip.fare?.platformCommission || 30}</div>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Total Fare</div>
                          <div className="text-sm font-black text-emerald-400 mt-0.5 font-mono">₹{assignedTrip.fare.totalFare}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pickup Address Card with Direct Call Button & Start Pickup Button (Items 13-16) */}
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Pickup Address & Sender Contact
                        </div>
                        <h4 className="font-bold text-white text-sm mt-0.5">{assignedTrip.pickup.area}</h4>
                        <p className="text-xs text-slate-400 leading-snug mt-0.5">{assignedTrip.pickup.address}</p>
                        <div className="text-xs text-slate-300 font-semibold mt-1">
                          Sender: {assignedTrip.pickup.senderOrReceiverName || assignedTrip.customerName} ({assignedTrip.pickup.senderOrReceiverPhone || assignedTrip.customerPhone})
                        </div>
                      </div>

                      {/* Direct Call Button */}
                      <a
                        href={`tel:${assignedTrip.pickup.senderOrReceiverPhone || assignedTrip.customerPhone}`}
                        className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-colors shadow"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-400" />
                        <span>Call Sender</span>
                      </a>
                    </div>

                    {/* "Start Pickup" Button (Item 13) */}
                    {assignedTrip.status === 'DRIVER_ASSIGNED' && (
                      <button
                        type="button"
                        onClick={handleAdvanceStatus}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Start Pickup ➔</span>
                      </button>
                    )}

                    {/* "Pickup point reached" Button (Item 14) */}
                    {assignedTrip.status === 'ARRIVING_PICKUP' && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = markDriverReachedPickup(assignedTrip.id);
                          if (res.success) {
                            showToast('Pickup point reached! 3-minute waiting timer started.');
                          }
                        }}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Pickup point reached ➔</span>
                      </button>
                    )}

                    {/* 3-Minute Free Waiting Window & Beyond 3 mins Waiting Charges (Item 14) */}
                    {assignedTrip.status === 'AT_PICKUP' && (
                      <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                            <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                              Pickup Waiting Timer (3 Min Free)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Rate: ₹{ratePerMin}/min ({assignedTrip.vehicleCategory})
                          </span>
                        </div>

                        {isWithinFreeWindow ? (
                          <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-300 font-bold">Standard 3-Minute Free Waiting Window Active</span>
                              <span className="font-mono font-black text-emerald-400 text-sm">
                                {Math.floor(freeSecsLeft / 60)}m {freeSecsLeft % 60}s
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              3-minute standard waiting countdown. No waiting charge billed during this window.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-950/50 border border-amber-600/70 rounded-xl space-y-1 animate-pulse">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-amber-200 font-black">Excess Waiting Time: {excessMins} mins</span>
                              <span className="font-mono font-black text-amber-300 text-sm">
                                +₹{assignedTrip.fare.waitingFare || liveWaitingCharge}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-300/90">
                              Exceeded 3 minutes. Extra waiting charge ₹{ratePerMin}/min is displaying on driver & customer screens simultaneously.
                            </p>
                          </div>
                        )}

                        {/* OTP Confirmation for Pickup (Item 15 & 16) */}
                        <div className="space-y-2 pt-1 border-t border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-bold">Customer 4-Digit Pickup OTP:</span>
                            <span className="text-[10px] text-slate-500 italic">
                              Demo Hint: {assignedTrip.shipment.pickupOtp}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="OTP"
                              value={pickupOtpInput}
                              onChange={(e) => setPickupOtpInput(e.target.value)}
                              className="w-28 bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAdvanceStatus}
                              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
                            >
                              Verify OTP & Complete Pickup ➔
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Stop Stop-by-Stop Leg Tracker */}
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          Stop Route Tracker ({completedStopsCount}/{tripStops.length} Closed)
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Verification & Drop Point
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {tripStops.map((stop, sIdx) => {
                        const isStopCompleted = stop.status === 'COMPLETED';
                        const isStopInProgress = stop.status === 'IN_PROGRESS';
                        const isStopPending = stop.status === 'PENDING';

                        return (
                          <div
                            key={stop.id || sIdx}
                            className={`p-3 rounded-2xl border transition-all ${
                              isStopInProgress
                                ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                                : isStopCompleted
                                ? 'bg-slate-900/50 border-slate-800 opacity-90'
                                : 'bg-slate-900/30 border-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/60 gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isStopCompleted
                                      ? 'bg-emerald-500 text-slate-950'
                                      : isStopInProgress
                                      ? 'bg-amber-400 text-slate-950 animate-pulse'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isStopCompleted ? '✓' : stop.sequence}
                                </span>
                                <span className="font-bold text-white truncate text-xs">
                                  {stop.label || `${stop.type} #${stop.sequence}`}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                    stop.type === 'PICKUP' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }`}
                                >
                                  {stop.type}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setShowCompanyQrPayModal(true)}
                                  className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                                >
                                  <QrCode className="w-3 h-3 text-blue-400" />
                                  <span>Company QR</span>
                                </button>
                                <span className="text-[10px] font-bold font-mono text-slate-400">{stop.status}</span>
                              </div>
                            </div>

                            <div className="pt-2 text-xs space-y-1">
                              <div className="font-semibold text-slate-200">{stop.area}</div>
                              <div className="text-[11px] text-slate-400">{stop.address}</div>
                              {stop.contactPhone && (
                                <a
                                  href={`tel:${stop.contactPhone}`}
                                  className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-bold pt-0.5"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{stop.contactPhone} ({stop.contactName || 'Contact'})</span>
                                </a>
                              )}
                            </div>

                            {/* Stop Closing Controls */}
                            <div className="pt-2">
                              {isStopPending && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    startTripStop(assignedTrip.id, stop.id);
                                    showToast(`Started ${stop.label}`);
                                  }}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                                >
                                  Start {stop.label} ➔
                                </button>
                              )}

                              {isStopInProgress && (
                                <div className="space-y-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-amber-300 font-semibold">Enter Stop OTP:</span>
                                    <span className="text-[10px] text-slate-500 italic">Hint: {stop.otp}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder="OTP"
                                      value={stopOtpInputs[stop.id] || ''}
                                      onChange={(e) => setStopOtpInputs((prev) => ({ ...prev, [stop.id]: e.target.value }))}
                                      className="w-20 bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-widest text-sm py-1.5 rounded-lg focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const otp = stopOtpInputs[stop.id] || stop.otp || '1234';
                                        const res = completeTripStop(assignedTrip.id, stop.id, otp);
                                        if (res.success) {
                                          showToast(`${stop.label} verified and closed!`);
                                          if (res.isCompleted) {
                                            setShowCustomerFeedbackModal(true);
                                          }
                                        }
                                      }}
                                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                                    >
                                      Verify & Close {stop.label} ✓
                                    </button>
                                  </div>
                                </div>
                              )}

                              {isStopCompleted && (
                                <div className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1 pt-0.5">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Closed successfully</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drop Navigation, 3-min Drop Waiting & Delivery OTP Confirmation (Items 17-21) */}
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Drop Destination Execution
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {assignedTrip.drop.area}
                      </span>
                    </div>

                    {/* "Start Drop" Button (Item 17) */}
                    {assignedTrip.status === 'IN_TRANSIT' && !isDropTransitActive && (
                      <button
                        type="button"
                        onClick={handleStartDrop}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Start Drop ➔</span>
                      </button>
                    )}

                    {/* "Reached drop location" / "Reached drop destination" Button (Item 18 & 19) */}
                    {assignedTrip.status === 'IN_TRANSIT' && isDropTransitActive && (() => {
                      const isMultiDrop = (assignedTrip.drops && assignedTrip.drops.length > 1) || (assignedTrip.stops && assignedTrip.stops.filter((s) => s.type === 'DROP').length > 1);
                      const remainingDropsCount = assignedTrip.stops ? assignedTrip.stops.filter((s) => s.type === 'DROP' && s.status !== 'COMPLETED').length : 1;
                      const buttonLabel = (isMultiDrop && remainingDropsCount > 1) ? 'Reached drop location' : 'Reached drop destination';

                      return (
                        <button
                          type="button"
                          onClick={handleAdvanceStatus}
                          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>{buttonLabel} ➔</span>
                        </button>
                      );
                    })()}

                    {/* Drop 3-Minute Waiting Timer & Excess Accrual (Item 20) */}
                    {assignedTrip.status === 'ARRIVED_DESTINATION' && (() => {
                      const dropArrivedTime = assignedTrip.driverReachedDropAt ? new Date(assignedTrip.driverReachedDropAt).getTime() : now;
                      const dropWaitingTotalSecs = dropArrivedTime > 0 ? Math.max(0, Math.floor((now - dropArrivedTime) / 1000)) : 0;
                      const isWithinDropFreeWindow = dropWaitingTotalSecs <= 180;
                      const dropFreeSecsLeft = Math.max(0, 180 - dropWaitingTotalSecs);
                      const dropExcessSecs = Math.max(0, dropWaitingTotalSecs - 180);
                      const dropExcessMins = Math.ceil(dropExcessSecs / 60);
                      const dropWaitingCharge = dropExcessMins * ratePerMin;

                      return (
                        <div className="space-y-3">
                          <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                                  Drop Waiting Timer (3 Min Free)
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Rate: ₹{ratePerMin}/min ({assignedTrip.vehicleCategory})
                              </span>
                            </div>

                            {isWithinDropFreeWindow ? (
                              <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-emerald-300 font-bold">Standard 3-Minute Free Window at Drop</span>
                                  <span className="font-mono font-black text-emerald-400 text-sm">
                                    {Math.floor(dropFreeSecsLeft / 60)}m {dropFreeSecsLeft % 60}s
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Free 3-minute unloading period. No extra fee is accrued during this window.
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-950/50 border border-amber-600/70 rounded-xl space-y-1 animate-pulse">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-amber-200 font-black">Excess Waiting at Drop: {dropExcessMins} mins</span>
                                  <span className="font-mono font-black text-amber-300 text-sm">
                                    +₹{assignedTrip.dropWaitingCharge || dropWaitingCharge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-300/90">
                                  Exceeded 3 minutes at drop. Charge is displaying synchronously on driver & customer screens.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* OTP Confirmation to complete drop (Item 21) */}
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-amber-300 font-bold">Collect Recipient Delivery 4-Digit OTP:</span>
                              <span className="text-[10px] text-slate-500 italic">Hint: {assignedTrip.shipment.deliveryOtp}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Drop OTP"
                                value={deliveryOtpInput}
                                onChange={(e) => setDeliveryOtpInput(e.target.value)}
                                className="w-28 bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAdvanceStatus}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
                              >
                                Confirm Delivery OTP ✓
                              </button>
                            </div>
                          </div>

                          {/* Company QR Code Button for Payment Collection (Item 22) */}
                          <button
                            type="button"
                            onClick={() => setShowCompanyQrPayModal(true)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Scan Company Payment QR Code (Collect ₹{assignedTrip.fare.totalFare})</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 4: TRIPS HISTORY PAGE ============================ */}
      {/* ================= Changes Required Line 15 =============================== */}
      {/* ========================================================================= */}
      {driverPage === 'trips' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back</span>
            </button>

            <h3 className="text-sm font-black text-white">Trips History</h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              {completedDriverTrips.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* Filter Toggle: Today's Trips vs Last Week Trip History (Line 15) */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTripsHistoryFilter('today')}
                className={`flex-1 py-2 rounded-xl font-black transition-all ${
                  tripsHistoryFilter === 'today'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today's Trips
              </button>
              <button
                type="button"
                onClick={() => setTripsHistoryFilter('last_week')}
                className={`flex-1 py-2 rounded-xl font-black transition-all ${
                  tripsHistoryFilter === 'last_week'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Last Week Trip History
              </button>
            </div>

            {/* List of trips based on filter */}
            {(() => {
              const filtered = reverseChronologicalTrips.filter((t) => {
                if (tripsHistoryFilter === 'today') {
                  const d = new Date(t.createdAt);
                  const nowD = new Date();
                  return d.getDate() === nowD.getDate() && d.getMonth() === nowD.getMonth() && d.getFullYear() === nowD.getFullYear();
                }
                const timeDiff = Date.now() - new Date(t.createdAt).getTime();
                return timeDiff <= 7 * 24 * 60 * 60 * 1000;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 text-center space-y-3 shadow-xl">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center text-2xl">
                      📭
                    </div>
                    <h4 className="text-sm font-bold text-white">No Trips in This Period</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      {tripsHistoryFilter === 'today'
                        ? 'No trips completed yet today. Go to Live Duty to accept orders.'
                        : 'No trips recorded in the past 7 days.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((tr) => (
                    <div
                      key={tr.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-mono text-xs font-black text-white">{tr.bookingCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(tr.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>{tr.pickup.area} ➔ {tr.drop.area}</span>
                          <span className="font-mono text-emerald-400 font-black">+₹{tr.fare.driverEarnings}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Distance: {tr.distanceKm} km • {tr.shipment.goodsCategory}</span>
                          <span>Fare: ₹{tr.fare.totalFare}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                        <span className="text-emerald-400 font-bold">Completed & Settled ✓</span>
                        <span>Vehicle: {tr.vehicleCategory.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 5: DRIVER LEDGER & COMPANY SETTLEMENTS =========== */}
      {/* ================= Changes Required Line 16 =============================== */}
      {/* ========================================================================= */}
      {driverPage === 'ledger' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back</span>
            </button>

            <h3 className="text-sm font-black text-white">Driver Ledger & Settlements</h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ₹{currentDriver.wallet.balance}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* Ledger Overview Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Earned</div>
                <div className="text-base font-black text-emerald-400 mt-1 font-mono">
                  ₹{completedDriverTrips.reduce((sum, t) => sum + t.fare.driverEarnings, 0)}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Company Fee</div>
                <div className="text-base font-black text-slate-300 mt-1 font-mono">
                  ₹{completedDriverTrips.reduce((sum, t) => sum + (t.fare.platformCommission || Math.round(t.fare.totalFare * 0.18)), 0)}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Wallet Bal</div>
                <div className={`text-base font-black mt-1 font-mono ${currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{currentDriver.wallet.balance}
                </div>
              </div>
            </div>

            {/* Trip-by-Trip Company Settlements (Line 16: amount earned by driver and payments made from company end for each trip) */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300 px-1">
                Trip Earnings & Company Settlements Record
              </div>

              {completedDriverTrips.length === 0 ? (
                <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 text-center space-y-2">
                  <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Ledger Entries Yet</h4>
                  <p className="text-xs text-slate-400">Completed deliveries and settlement credits will appear here.</p>
                </div>
              ) : (
                completedDriverTrips.map((trip) => {
                  const comm = trip.fare.platformCommission || Math.round(trip.fare.totalFare * 0.18);
                  return (
                    <div
                      key={trip.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2.5 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-xs font-black text-white">{trip.bookingCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Settlement Ref: #CMP-SETTLE-{trip.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-emerald-950/30 border border-emerald-900/60 p-2.5 rounded-xl">
                          <div className="text-[10px] uppercase font-bold text-emerald-400">Driver Earning (Take-Home)</div>
                          <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                            +₹{trip.fare.driverEarnings}
                          </div>
                          <div className="text-[10px] text-emerald-400/80 mt-0.5">Credited to wallet ✓</div>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Company Payment Settlement</div>
                          <div className="text-lg font-black text-white font-mono mt-0.5">
                            ₹{trip.fare.totalFare}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Fee: -₹{comm} • Status: Settled
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span>{trip.pickup.area} ➔ {trip.drop.area}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 6: MULTILINGUAL LIVE SUPPORT ===================== */}
      {/* ================= Changes Required Lines 17-21 =========================== */}
      {/* ========================================================================= */}
      {driverPage === 'support' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back</span>
            </button>

            <h3 className="text-sm font-black text-white">Live Driver Support</h3>
            <span className="text-xs text-emerald-400 font-bold">24x7 Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* Language Selection Bar (Tamil, English, Hindi, Telugu, Malayalam, Kannada) */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2 shadow-md">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Select Support Language:</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSupportLanguage(lang)}
                    className={`py-2 px-2 rounded-xl font-bold transition-all ${
                      supportLanguage === lang
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {lang === 'Tamil' ? 'தமிழ் (Tamil)' :
                     lang === 'English' ? 'English' :
                     lang === 'Hindi' ? 'हिन्दी (Hindi)' :
                     lang === 'Telugu' ? 'తెలుగు (Telugu)' :
                     lang === 'Malayalam' ? 'മലയാളം (Malayalam)' : 'ಕನ್ನಡ (Kannada)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Hotline Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:180079435623"
                className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-2xl flex flex-col items-center justify-center space-y-1 text-emerald-300 hover:bg-emerald-900/60 transition-colors shadow"
              >
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <span className="font-black text-white text-xs">{brandConfig.supportPhone}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Toll-Free Helpline</span>
              </a>

              <a
                href={`https://wa.me/919842200000?text=${encodeURIComponent(`${brandConfig.appName} Driver Support Request`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-teal-950/60 border border-teal-700 rounded-2xl flex flex-col items-center justify-center space-y-1 text-teal-300 hover:bg-teal-900/60 transition-colors shadow"
              >
                <MessageSquare className="w-5 h-5 text-teal-400" />
                <span className="font-black text-white text-xs">WhatsApp Support</span>
                <span className="text-[10px] text-teal-400 font-medium">+91 98422 00000</span>
              </a>
            </div>

            {/* Live Support Queries by Category (Lines 18-21: trips, payment, wallet amount, withdrawals, recharge) */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300 px-1">
                Frequently Asked Live Queries ({supportLanguage})
              </div>

              {(SUPPORT_FAQ_DATA[supportLanguage] || SUPPORT_FAQ_DATA['English']).map((cat, cIdx) => (
                <div key={cIdx} className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 shadow-md">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white border-b border-slate-800 pb-2">
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.category}</span>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map((item, iIdx) => (
                      <div key={iIdx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="font-bold text-slate-200">Q: {item.q}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed pt-0.5">A: {item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 7: SETTINGS & 13 UPLOAD DOCS ===================== */}
      {/* ================= Changes Required Lines 22-24 =========================== */}
      {/* ========================================================================= */}
      {driverPage === 'settings' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow z-10 shrink-0">
            <button
              type="button"
              onClick={() => setDriverPage('home')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back</span>
            </button>

            <h3 className="text-sm font-black text-white">Driver Partner Settings</h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ID: {currentDriver.id}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 max-w-2xl mx-auto w-full pb-28">
            {/* 5 Sub-Sections Navigation Tabs (Lines 22-24: Profile, Upload Docs, Communication details, Payment details, Language preferences) */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
              {[
                { id: 'profile' as const, label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'documents' as const, label: 'Upload Docs', icon: <Upload className="w-3.5 h-3.5" /> },
                { id: 'communication' as const, label: 'Communication', icon: <Phone className="w-3.5 h-3.5" /> },
                { id: 'payment' as const, label: 'Payment Details', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { id: 'language' as const, label: 'Languages', icon: <Languages className="w-3.5 h-3.5" /> },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSettingsSection(sec.id)}
                  className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all text-[11px] ${
                    settingsSection === sec.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>

            {/* 1. PROFILE SECTION */}
            {settingsSection === 'profile' && (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl text-xs">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <img
                    src={currentDriver.avatar}
                    alt={currentDriver.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-base font-black text-white">{currentDriver.name}</h4>
                    <div className="text-emerald-400 font-mono font-bold">{currentDriver.vehicleNumber}</div>
                    <div className="text-slate-400 text-[11px]">⭐ {currentDriver.rating || 4.9} • {currentDriver.vehicleModel}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Driver Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Email</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Vehicle Model</label>
                      <input
                        type="text"
                        value={profileVehicleModel}
                        onChange={(e) => setProfileVehicleModel(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Vehicle Number Plate</label>
                      <input
                        type="text"
                        value={profileVehicleNumber}
                        onChange={(e) => setProfileVehicleNumber(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateDriverProfileDetails(currentDriver.id, {
                      name: profileName,
                      phone: profilePhone,
                      email: profileEmail,
                      vehicleModel: profileVehicleModel,
                      vehicleNumber: profileVehicleNumber,
                    });
                    showToast('Profile details updated successfully!');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Save Profile Changes ✓
                </button>
              </div>
            )}

            {/* 2. UPLOAD DOCS SECTION (13 Docs with Configurable Limit) */}
            {settingsSection === 'documents' && (
              <div className="space-y-3 text-xs">
                {/* Admin-Configured Max File Size Banner (Line 24) */}
                <div className="p-3.5 bg-slate-950 border border-emerald-500/60 rounded-2xl flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">Standard Document Upload Limit</div>
                      <div className="text-[11px] text-slate-400">Configured via Admin Portal Dispatch Panel</div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
                    Max: {maxDocUploadSizeMb} MB
                  </span>
                </div>

                {/* 13 Required Driver Documents */}
                <div className="space-y-2.5">
                  {DRIVER_13_DOCS.map((docItem) => {
                    const uploaded = currentDriver.uploadedDocs?.find((d) => d.docKey === docItem.key);
                    const isVerified = uploaded?.status === 'VERIFIED';
                    const isUploaded = uploaded?.status === 'PENDING';

                    return (
                      <div
                        key={docItem.key}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-md hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-white text-xs">{docItem.label}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  isVerified
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isUploaded
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {isVerified ? 'Verified ✓' : isUploaded ? 'Under Review' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{docItem.desc}</p>
                          </div>
                        </div>

                        {uploaded && (
                          <div className="text-[10px] text-slate-400 flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="font-mono truncate max-w-[200px]">📄 {uploaded.fileName}</span>
                            <span>{uploaded.fileSizeMb} MB</span>
                          </div>
                        )}

                        {/* File Upload Input with size validation */}
                        <div>
                          <label className="block w-full cursor-pointer">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const maxBytes = maxDocUploadSizeMb * 1024 * 1024;
                                const fileMb = Number((file.size / (1024 * 1024)).toFixed(2));

                                if (file.size > maxBytes) {
                                  showToast(`❌ File size (${fileMb} MB) exceeds maximum limit of ${maxDocUploadSizeMb} MB!`);
                                  e.target.value = '';
                                  return;
                                }

                                const res = uploadDriverDocument(currentDriver.id, {
                                  docKey: docItem.key,
                                  title: docItem.label,
                                  fileName: file.name,
                                  fileSizeMb: fileMb,
                                  fileUrl: URL.createObjectURL(file),
                                  status: 'PENDING',
                                });

                                if (res.success) {
                                  showToast(`✓ Uploaded ${docItem.label} (${fileMb} MB)`);
                                }
                              }}
                            />
                            <div className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl text-center text-xs font-bold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{uploaded ? 'Re-upload / Replace Document' : 'Choose Document File'}</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. COMMUNICATION DETAILS SECTION */}
            {settingsSection === 'communication' && (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl text-xs">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                  Residential & Emergency Contact Details
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Residential Street Address</label>
                    <textarea
                      rows={2}
                      value={commAddress}
                      onChange={(e) => setCommAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">City / District</label>
                      <input
                        type="text"
                        value={commCity}
                        onChange={(e) => setCommCity(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        value={commPincode}
                        onChange={(e) => setCommPincode(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Emergency Contact Person</label>
                      <input
                        type="text"
                        value={commEmergencyName}
                        onChange={(e) => setCommEmergencyName(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Emergency Phone Number</label>
                      <input
                        type="tel"
                        value={commEmergencyPhone}
                        onChange={(e) => setCommEmergencyPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateDriverProfileDetails(currentDriver.id, {
                      residentialAddress: commAddress,
                      city: commCity,
                      pincode: commPincode,
                      emergencyContactName: commEmergencyName,
                      emergencyContactNumber: commEmergencyPhone,
                    });
                    showToast('Communication details saved successfully!');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Save Communication Details ✓
                </button>
              </div>
            )}

            {/* 4. PAYMENT DETAILS SECTION */}
            {settingsSection === 'payment' && (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl text-xs">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                  Bank Account & UPI Payout Credentials
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Bank Account Holder Name</label>
                    <input
                      type="text"
                      value={bankAccNameEdit}
                      onChange={(e) => setBankAccNameEdit(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={bankAccNumEdit}
                      onChange={(e) => setBankAccNumEdit(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankNameEdit}
                        onChange={(e) => setBankNameEdit(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Branch Name</label>
                      <input
                        type="text"
                        value={bankBranchEdit}
                        onChange={(e) => setBankBranchEdit(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={bankIfscEdit}
                        onChange={(e) => setBankIfscEdit(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Direct UPI ID</label>
                      <input
                        type="text"
                        value={bankUpiEdit}
                        onChange={(e) => setBankUpiEdit(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateDriverProfileDetails(currentDriver.id, {
                      bankDetails: {
                        ...currentDriver.bankDetails,
                        accountName: bankAccNameEdit,
                        accountNumber: bankAccNumEdit,
                        bankName: bankNameEdit,
                        branchName: bankBranchEdit,
                        ifscCode: bankIfscEdit.toUpperCase(),
                        upiId: bankUpiEdit,
                      },
                    });
                    showToast('Bank and UPI payout details updated successfully!');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Save Payment & Bank Details ✓
                </button>
              </div>
            )}

            {/* 5. LANGUAGE PREFERENCES SECTION */}
            {settingsSection === 'language' && (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-4 shadow-xl text-xs">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                  Driver Language Preferences
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-2">Native / Primary Language</label>
                  <select
                    value={nativeLanguagePref}
                    onChange={(e) => setNativeLanguagePref(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-2">Spoken Languages (Select all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'].map((lang) => {
                      const isChecked = spokenLanguagesPref.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSpokenLanguagesPref((prev) => prev.filter((l) => l !== lang));
                            } else {
                              setSpokenLanguagesPref((prev) => [...prev, lang]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all ${
                            isChecked
                              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                            {isChecked ? '✓' : ''}
                          </span>
                          <span>{lang}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateDriverProfileDetails(currentDriver.id, {
                      nativeLanguage: nativeLanguagePref,
                      spokenLanguages: spokenLanguagesPref,
                    });
                    showToast('Language preferences saved successfully!');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Save Language Preferences ✓
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DRIVER BOTTOM NAVIGATION BAR (Changes Required Lines 13-24) ================= */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto backdrop-blur-md border-t px-2 py-2 flex items-center justify-around z-30 shadow-lg ${
        darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        {/* 1. Home */}
        <button
          onClick={() => setDriverPage('home')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-colors ${
            driverPage === 'home' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Back to Dashboard"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* 2. Trips */}
        <button
          onClick={() => setDriverPage('trips')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-colors ${
            driverPage === 'trips' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Today & Last Week Trip History"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Trips</span>
        </button>

        {/* 3. Ledger */}
        <button
          onClick={() => setDriverPage('ledger')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-colors ${
            driverPage === 'ledger' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Driver Earnings & Company Payments"
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Ledger</span>
        </button>

        {/* 4. Support */}
        <button
          onClick={() => setDriverPage('support')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-colors ${
            driverPage === 'support' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Multilingual Live Support"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">Support</span>
        </button>

        {/* 5. Settings */}
        <button
          onClick={() => setDriverPage('settings')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-colors ${
            driverPage === 'settings' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Driver Profile & Document Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>

      {/* ================= COMPANY QR PAYMENT MODAL (Line 43) ================= */}
      {showCompanyQrPayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Company Payment QR Code</h3>
              </div>
              <button onClick={() => setShowCompanyQrPayModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
                {/* Visual QR Code Representation */}
                <div className="space-y-2 text-center text-slate-900">
                  <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
                  <div className="text-[9px] font-mono font-bold text-slate-600">UPI / BHIM / GPay</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">Total Customer Fare to Collect</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{assignedTrip?.fare.totalFare || 0}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
                UPI ID: <strong className="text-white">swifload.ops@hdfcbank</strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCompanyQrPayModal(false);
                  showToast('Payment verified via company QR code.');
                  setShowCustomerFeedbackModal(true);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
              >
                Done / Payment Received ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CUSTOMER FEEDBACK MODAL UPON DELIVERY (Lines 44-45) ================= */}
      {showCustomerFeedbackModal && assignedTrip && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto">
                🎉
              </div>
              <h3 className="font-black text-base text-white">Delivery Completed!</h3>
              <p className="text-xs text-slate-400">
                Trip #{assignedTrip.bookingCode} settled. Please rate customer {assignedTrip.customerName}.
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center space-x-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCustomerRatingScore(star)}
                  className="text-2xl transition-transform hover:scale-125"
                >
                  {star <= customerRatingScore ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            {/* Quick Feedback Tags */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quick Feedback:</div>
              <div className="flex flex-wrap gap-1.5">
                {['Polite Customer', 'Prompt Loading', 'Accurate Location', 'Immediate Unloading', 'Tipped Well'].map((tag) => {
                  const isSelected = customerFeedbackSelectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setCustomerFeedbackSelectedTags((prev) => prev.filter((t) => t !== tag));
                        } else {
                          setCustomerFeedbackSelectedTags((prev) => [...prev, tag]);
                        }
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments Textarea */}
            <div>
              <textarea
                rows={2}
                placeholder="Optional notes or feedback..."
                value={customerFeedbackText}
                onChange={(e) => setCustomerFeedbackText(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                submitDriverFeedbackForCustomer(
                  assignedTrip.id,
                  customerRatingScore,
                  customerFeedbackText,
                  customerFeedbackSelectedTags
                );
                setShowCustomerFeedbackModal(false);
                setDriverPage('available_orders');
                showToast(`Feedback submitted! ₹${assignedTrip.fare.driverEarnings} added to your today earnings.`);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
            >
              Submit Feedback & Return to Available Orders ➔
            </button>
          </div>
        </div>
      )}

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
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Current Driver Balance:</span>
                    <span className={`font-mono ${currentDriver.wallet.balance < 0 ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}`}>
                      {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                    </span>
                  </div>
                  {currentDriver.wallet.balance < 0 && (
                    <div className="p-2 bg-rose-950/60 border border-rose-600/50 rounded-lg text-rose-200">
                      <div className="font-black text-rose-300">Minimum Recharge Amount Required:</div>
                      <div className="text-base font-black text-white font-mono mt-0.5">
                        ₹{Math.max(200, Math.abs(currentDriver.wallet.balance))}
                      </div>
                      <div className="text-[10px] text-rose-300/80 mt-0.5">
                        Clear negative debt of ₹{Math.abs(currentDriver.wallet.balance)} to unblock orders dispatch.
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Selected Recharge:</span>
                    <span className="font-mono text-emerald-400 font-bold">+{driverTopupAmt}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                    <span>Resulting Balance:</span>
                    <span className="font-mono">
                      ₹{Math.min(200, currentDriver.wallet.balance + driverTopupAmt)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    * Maximum wallet balance cap is ₹200.
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

      {/* ================= CANCELLATION REASON MODAL ================= */}
      {showCancelReasonModal && assignedTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Cancel Accepted Order</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Trip #{assignedTrip.bookingCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelReasonModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-600/40 rounded-2xl text-xs text-amber-200 leading-relaxed">
              <strong>{brandConfig.appName} Operating Policy:</strong> Cancelling an order after acceptance disrupts customer operations. Selecting a reason below will temporarily suspend your order dispatch for the mandated safety cooldown period.
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Cancellation Reason:
              </div>

              {([
                {
                  reason: 'Illness' as const,
                  icon: '🤒',
                  title: 'Illness',
                  desc: 'Medical unfitness or rest needed before driving.',
                  defaultHours: 1,
                },
                {
                  reason: 'Vehicle breakdown' as const,
                  icon: '🚛',
                  title: 'Vehicle breakdown',
                  desc: 'Mechanical failure, flat tyre, or engine defect.',
                  defaultHours: 2,
                },
                {
                  reason: 'Priority personal work' as const,
                  icon: '💼',
                  title: 'Priority personal work',
                  desc: 'Urgent family matter or priority domestic commitment.',
                  defaultHours: 4,
                },
                {
                  reason: 'Emergency' as const,
                  icon: '🚨',
                  title: 'Emergency',
                  desc: 'Critical domestic or medical emergency.',
                  defaultHours: 6,
                },
              ]).map((item) => {
                const slabConfig = cancellationSlabConfigs.find((s) => s.reason === item.reason);
                const lockoutHours = slabConfig ? slabConfig.lockoutHours : item.defaultHours;
                const isSelected = selectedCancelReason === item.reason;

                return (
                  <button
                    key={item.reason}
                    type="button"
                    onClick={() => setSelectedCancelReason(item.reason)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 shadow-md ring-2 ring-rose-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-rose-200' : 'text-white'}`}>
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {lockoutHours < 1 ? `${Math.round(lockoutHours * 60)} Mins` : `${lockoutHours} Hour${lockoutHours !== 1 ? 's' : ''}`} Standby
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                      <div className="text-[10px] text-amber-400/90 font-medium mt-1">
                        ⏳ Standby rule: You will be paused from taking orders for {lockoutHours < 1 ? `${Math.round(lockoutHours * 60)} minutes` : `${lockoutHours} hr${lockoutHours !== 1 ? 's' : ''}`} as configured in Admin Portal.
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowCancelReasonModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Keep Trip & Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelTripByDriver(assignedTrip.id, currentDriver.id, selectedCancelReason);
                  setShowCancelReasonModal(false);
                  setDriverPage('home');
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
              >
                Confirm Cancellation
              </button>
            </div>
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
                  <span>⚡ Join {brandConfig.appName} Driver Fleet</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    {brandConfig.defaultCity} Hub
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
                  email: driverEmail.trim() || `${driverName.toLowerCase().replace(/\s+/g, '.')}@${brandConfig.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}.test`,
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

      {/* ========================================================================= */}
      {/* ================= ITEMS 9: LEFT-SIDE NAVIGATION DRAWER ================== */}
      {/* ========================================================================= */}
      {showSideMenu && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowSideMenu(false)}
          />
          <div
            className={`relative w-80 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 overflow-y-auto transition-colors duration-200 ${
              darkMode ? 'bg-slate-950 border-r border-slate-800 text-white' : 'bg-white border-r border-slate-200 text-slate-900'
            }`}
          >
            {/* Drawer Header: Brand Header & Driver Name with ID, Rating and link to proceed to view their wallet details */}
            <div className={`p-4 border-b space-y-3 ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
              {/* Brand Identity Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                    ⚡
                  </div>
                  <div>
                    <span className={`font-black text-xs tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {brandConfig.appName} Driver Partner
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      {brandConfig.defaultCity} Operations
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSideMenu(false)}
                  className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                    darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={currentDriver.avatar}
                      alt={currentDriver.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                        darkMode ? 'border-slate-950' : 'border-white'
                      } ${currentDriver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-black text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {currentDriver.name}
                    </div>
                    <div className="text-[11px] text-emerald-500 font-mono font-bold flex items-center space-x-1">
                      <span>ID: {currentDriver.id}</span>
                      <span>•</span>
                      <span>{currentDriver.vehicleNumber}</span>
                    </div>
                    <div className={`text-[10px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ⭐ {currentDriver.rating || 4.9} • {currentDriver.vehicleModel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to proceed to view their wallet details */}
              <button
                type="button"
                onClick={() => {
                  setShowSideMenu(false);
                  setWalletModalTab('recharge');
                  setShowDriverTopupModal(true);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  isDriverBlocked
                    ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/40'
                    : darkMode
                    ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    View Wallet Details ➔
                  </span>
                </div>
                <span
                  className={`font-black text-xs font-mono ${
                    currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-emerald-500'
                  }`}
                >
                  {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                </span>
              </button>

              {/* Driver Switcher */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Switch Driver:</span>
                <select
                  value={currentDriver.id}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none truncate max-w-[170px]"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Menu Links in exact requested order */}
            <div className="p-3 space-y-1 text-xs flex-1">
              {/* 1. Profile */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowProfileModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Profile</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              </button>

              {/* 2. Notifications */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowNotificationsModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">Notifications</span>
                </div>
                {driverNotifications.filter((n) => !n.read).length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {driverNotifications.filter((n) => !n.read).length}
                  </span>
                ) : (
                  <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                )}
              </button>

              {/* 3. Wallet */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setWalletModalTab('recharge');
                  setShowDriverTopupModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Wallet</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentDriver.wallet.balance < 0 ? `-₹${Math.abs(currentDriver.wallet.balance)}` : `₹${currentDriver.wallet.balance}`}
                </span>
              </button>

              {/* 4. Earnings */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowEarningsModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Earnings</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              </button>

              {/* 5. Referral */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowReferModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold">Referral</span>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded">
                  {currentDriver.successfulReferralsCount || 3} Ref
                </span>
              </button>

              {/* 6. Trainings */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowTrainingsModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">Trainings</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  (currentDriver.trainingsPending?.length || 0) > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {currentDriver.trainingsAttended || 4} Done
                </span>
              </button>

              {/* 7. Help */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowHelpModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span className="font-semibold">Help & FAQs</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              </button>

              {/* 8. Privacy Policy */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowPrivacyModal(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Privacy Policy</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              </button>

              {/* Replay Welcome Flower Splash */}
              <button
                onClick={() => {
                  setShowSideMenu(false);
                  setShowSplash(true);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Replay Welcome Splash</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">🌸 Flowers</span>
              </button>

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-slate-900 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span className="font-semibold">{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {darkMode ? '🌙 Dark' : '☀️ Light'}
                </span>
              </button>
            </div>

            {/* Bottom Footer Info */}
            <div className={`p-4 border-t text-[11px] space-y-1 ${
              darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
            }`}>
              <div className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{brandConfig.companyName}</div>
              <div>{brandConfig.defaultCity} Freight Hub v3.8.2</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>All driver partner operations secured</div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* ================= ITEM 11: REFER & EARN MODAL =========================== */}
      {/* ========================================================================= */}
      {showReferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col transition-colors ${
            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">Driver Partner Refer & Earn</h3>
              </div>
              <button
                onClick={() => setShowReferModal(false)}
                className={`p-1 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Referral Code Box */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-amber-50 border-amber-300'}`}>
                <div className="text-[10px] text-amber-500 uppercase font-extrabold tracking-wider">
                  Your Unique Referral Code
                </div>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <div className={`font-mono text-xl font-black tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {currentDriver.referralCode || 'SWIF-DRV01-44'}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentDriver.referralCode || 'SWIF-DRV01-44');
                      setDriverReferralCopied(true);
                      showToast('Driver referral code copied to clipboard!');
                      setTimeout(() => setDriverReferralCopied(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow shrink-0 transition-transform active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{driverReferralCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className={`text-[11px] mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Share your code with fellow commercial drivers or business shippers across Coimbatore.
                </p>
              </div>

              {/* Share via WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join ${brandConfig.appName} as a Driver Partner using my referral code: ${currentDriver.referralCode || `${brandConfig.codePrefix}-DRV01-44`} and get an instant onboarding bonus! Sign up here: ${brandConfig.websiteUrl}/driver`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              {/* How it Works */}
              {/* SUCCESSFUL REFERRALS SECTION */}
              <div className="space-y-2.5 p-3.5 bg-slate-900/90 rounded-2xl border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-white">
                      Successful Referrals ({currentDriver.successfulReferralsCount || currentDriver.successfulReferralsList?.length || 3})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Total Bonus: ₹{(currentDriver.successfulReferralsList || []).reduce((acc, r) => acc + (r.bonus || 200), 0) || 600}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verified driver partners onboarded and active in Coimbatore under your code:
                </p>
                <div className="space-y-2">
                  {(currentDriver.successfulReferralsList || []).map((ref) => (
                    <div key={ref.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{ref.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {ref.role} • Joined {ref.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400 font-mono">+₹{ref.bonus}</div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-500">
                  Referral Rewards Policy
                </h4>
                <div className={`p-3 rounded-2xl border space-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-500">🚚 Refer a Commercial Driver</span>
                    <span className="font-black text-amber-500 text-sm">+₹200</span>
                  </div>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Earn ₹200 credited directly to your {brandConfig.appName} wallet when your referred driver partner completes their first 5 trips in {brandConfig.defaultCity}.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border space-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-500">📦 Refer a Shipper Customer</span>
                    <span className="font-black text-amber-500 text-sm">+₹50</span>
                  </div>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Earn ₹50 wallet cash reward when a shopkeeper or enterprise books their first delivery with your code.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowReferModal(false)}
              className={`w-full py-2.5 font-bold rounded-xl text-xs transition-colors ${
                darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 5: NOTICEBOARD MODAL (NEGATIVE BALANCE) ========== */}
      {/* ========================================================================= */}
      {showNoticeboardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Pin className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Driver Partner Noticeboard</h3>
              </div>
              <button onClick={() => setShowNoticeboardModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {/* Item 5 Critical Notice: Warning when wallet is <= -200 asking to recharge within 5 days */}
              {isDriverBlocked ? (
                <div className="p-4 bg-rose-950/90 border-2 border-rose-600 rounded-2xl space-y-2.5 shadow-lg">
                  <div className="flex items-center space-x-2 text-rose-300 font-extrabold text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>Immediate Action: Negative Balance Warning</span>
                  </div>
                  <p className="text-rose-100 text-[11px] leading-relaxed">
                    Dear <strong>{currentDriver.name}</strong>, your wallet balance has fallen to{' '}
                    <span className="font-mono font-bold text-white underline">
                      -₹{Math.abs(currentDriver.wallet.balance)}
                    </span>{' '}
                    which exceeds the allowed negative limit (≤ -₹200).
                  </p>
                  <div className="p-2.5 bg-black/40 rounded-xl border border-rose-800 text-[11px] text-rose-200 space-y-1">
                    <div className="font-bold text-rose-300">⚠️ Mandatory Operational Rule:</div>
                    <div>
                      You must recharge your driver wallet within <strong>5 days</strong>.
                    </div>
                    <div className="text-[10px] text-rose-400">
                      Failing which, your registered mobile number (<strong>{currentDriver.phone}</strong>) and vehicle ({currentDriver.vehicleNumber}) will be temporarily blocked from receiving pickup calls.
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-rose-300 font-mono font-bold">
                      ⏳ Deadline: 5 Days Remaining
                    </span>
                    <button
                      onClick={() => {
                        setShowNoticeboardModal(false);
                        setDriverTopupAmt(200);
                        setWalletModalTab('recharge');
                        setShowDriverTopupModal(true);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] shadow transition-transform active:scale-95"
                    >
                      Recharge Wallet (Min ₹200) ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl flex items-center justify-between text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">Wallet Standing: Good</span>
                  </div>
                  <span className="font-mono font-bold">₹{currentDriver.wallet.balance}</span>
                </div>
              )}

              {/* Circular 1 */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Circular #2026-08 • Operations
                  </span>
                  <span className="text-[10px] text-slate-500">Active</span>
                </div>
                <div className="font-bold text-white text-xs">
                  Peak Industrial Hours Incentive Multiplier
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Earn an extra ₹150 milestone bonus for completing 5 trips originating from Peelamedu SIDCO & Ganapathy Foundry hubs between 9:00 AM and 1:00 PM.
                </p>
              </div>

              {/* Circular 2 */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Circular #2026-07 • Safety
                  </span>
                  <span className="text-[10px] text-slate-500">Mandatory</span>
                </div>
                <div className="font-bold text-white text-xs">
                  Monsoon Weather Protection Protocol
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Heavy showers are forecasted across Coimbatore region. Drivers carrying textiles or electronics must secure heavy waterproof tarpaulins before leaving pickup locations.
                </p>
              </div>

              {/* Circular 3 */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Circular #2026-06 • Payments
                  </span>
                  <span className="text-[10px] text-slate-500">Notice</span>
                </div>
                <div className="font-bold text-white text-xs">
                  Company Dynamic QR Code Payments
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Always use the {brandConfig.appName} Company QR code (<code className="text-emerald-300">swifload.ops@icici</code>) for customer digital payments to ensure automatic fare reconciliation and 0% delay in payouts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNoticeboardModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close Noticeboard
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 6: NOTIFICATIONS CENTER MODAL ==================== */}
      {/* ========================================================================= */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Driver Notifications Center</h3>
              </div>
              <button onClick={() => setShowNotificationsModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Filters */}
            <div className="flex items-center justify-between">
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    notifFilter === 'all' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({driverNotifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    notifFilter === 'unread' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unread ({driverNotifications.filter((n) => !n.read).length})
                </button>
              </div>

              {driverNotifications.length > 0 && (
                <button
                  onClick={() => clearDriverNotifications()}
                  className="text-[10px] text-slate-500 hover:text-rose-400 underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {/* Trip-Related & Admin-Configurable Suspension Policy Notice */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Suspension Rules:</span>
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    Configurable in Admin Portal
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                  {cancellationSlabConfigs.map((s) => (
                    <div key={s.reason} className="p-1.5 bg-slate-950 rounded border border-slate-800">
                      <span className="font-bold text-white block">{s.reason}:</span>
                      <span className="text-amber-400">
                        {s.lockoutHours < 1 ? `${Math.round(s.lockoutHours * 60)}m` : `${s.lockoutHours}h`} Standby Cooldown
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {driverNotifications
                .filter((n) => notifFilter === 'all' || !n.read)
                .map((notif) => {
                  const getIcon = () => {
                    switch (notif.type) {
                      case 'PICKUP':
                        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                      case 'DROP':
                        return <MapPin className="w-4 h-4 text-cyan-400" />;
                      case 'TRIP_UPDATE':
                        return <Navigation className="w-4 h-4 text-blue-400" />;
                      case 'CANCELLATION':
                        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
                      case 'WALLET':
                        return <Wallet className="w-4 h-4 text-amber-400" />;
                      default:
                        return <Bell className="w-4 h-4 text-purple-400" />;
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && markDriverNotificationRead(notif.id)}
                      className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                        notif.read
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                          : 'bg-slate-900 border-emerald-500/40 text-slate-200 shadow-md ring-1 ring-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                          {getIcon()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{notif.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {driverNotifications.filter((n) => notifFilter === 'all' || !n.read).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <div>No notifications in this filter</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 1: MULTI-STOP COMPLETION POPUP =================== */}
      {/* ========================================================================= */}
      {nextStopModalData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-black text-sm text-emerald-400 uppercase tracking-wider">
                  🎉 Stop Completed! Proceed to Next Leg
                </h3>
              </div>
              <button
                onClick={() => setNextStopModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Completed Stop Tag */}
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Just Finished:</span>
              <span className="font-bold text-white flex items-center space-x-1">
                <span>✓ {nextStopModalData.completedStop.label} ({nextStopModalData.completedStop.area})</span>
              </span>
            </div>

            {/* Next Stop Details Card (Item 1: contact number and address details of next pickup or drop) */}
            <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-emerald-500/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Next Stop #{nextStopModalData.nextStop.sequence} ({nextStopModalData.nextStop.type})
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  ₹{nextStopModalData.nextStop.associatedCharge || 200}
                </span>
              </div>

              {/* Locality & Exact Address */}
              <div>
                <div className="text-base font-extrabold text-white">
                  {nextStopModalData.nextStop.area}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {nextStopModalData.nextStop.address}
                </div>
              </div>

              {/* Contact details with tap-to-call (Item 1 & 8) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Contact Person</div>
                  <div className="font-bold text-white truncate">
                    {nextStopModalData.nextStop.contactName || 'Recipient / Sender'}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">
                    {nextStopModalData.nextStop.contactPhone || '+91 98422 19283'}
                  </div>
                </div>

                <a
                  href={`tel:${nextStopModalData.nextStop.contactPhone || '9842219283'}`}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow transition-transform active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                <span>Distance to leg: ~{nextStopModalData.nextStop.distanceCoveredKm || 3.2} km</span>
                {nextStopModalData.nextStop.otp && (
                  <span>Verification OTP: <strong>{nextStopModalData.nextStop.otp}</strong></span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nextStopModalData.nextStop.lat},${nextStopModalData.nextStop.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate GPS</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  startTripStop(nextStopModalData.tripId, nextStopModalData.nextStop.id);
                  setNextStopModalData(null);
                  showToast(`Started leg for ${nextStopModalData.nextStop.label}!`);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
              >
                Start Next Leg ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 4: DYNAMIC COMPANY QR CODE PAYMENT MODAL ========= */}
      {/* ========================================================================= */}
      {activeQrModalStop && (() => {
        const stop = activeQrModalStop.stop;
        const bookingCode = activeQrModalStop.bookingCode;
        const amount = stop.associatedCharge || 250;
        const upiUri = `upi://pay?pa=swifload.ops@icici&pn=${encodeURIComponent(brandConfig.companyName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(brandConfig.appName)}_${bookingCode}_Stop_${stop.sequence}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl text-center">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-left">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Company Payment QR</h3>
                    <p className="text-[10px] text-slate-400">Stop #{stop.sequence} • {stop.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveQrModalStop(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-xl border border-slate-200">
                <img
                  src={qrImgUrl}
                  alt="Company UPI Payment QR Code"
                  className="w-52 h-52 object-contain mx-auto"
                />
              </div>

              {/* Amount & Account Details */}
              <div className="space-y-1.5 text-xs">
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{amount}
                </div>
                <div className="text-[11px] font-bold text-white">
                  {brandConfig.companyName}
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiary:</span>
                    <span className="font-mono font-semibold">ops@{brandConfig.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span>ICICI Bank {brandConfig.defaultCity} Main</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ref Note:</span>
                    <span className="font-mono text-emerald-300">{brandConfig.appName}_{bookingCode}_S{stop.sequence}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Customer can scan using Google Pay, PhonePe, Paytm, BHIM, or any banking app.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('swifload.ops@icici');
                    showToast('Company UPI ID copied!');
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQrModalStop(null)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* ================= ITEM 9: DRIVER LEDGER & ACCOUNT STATEMENT ============= */}
      {/* ========================================================================= */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Driver Partner Ledger</h3>
                  <p className="text-[10px] text-slate-400">Account Statement • TN-38 Coimbatore Hub</p>
                </div>
              </div>
              <button onClick={() => setShowLedgerModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Balance</div>
                <div className={`text-base font-black mt-0.5 ${currentDriver.wallet.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{currentDriver.wallet.balance}
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Transactions</div>
                <div className="text-base font-black text-white mt-0.5">{reverseChronologicalTx.length}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Trips Logged</div>
                <div className="text-base font-black text-white mt-0.5">{currentDriver.totalTrips}</div>
              </div>
            </div>

            {/* Ledger List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {reverseChronologicalTx.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-start space-x-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
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
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-xs font-mono ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono">Bal: ₹{tx.balanceAfter}</div>
                  </div>
                </div>
              ))}

              {reverseChronologicalTx.length === 0 && (
                <div className="text-center py-6 text-slate-500">No ledger entries recorded yet.</div>
              )}
            </div>

            <button
              onClick={() => setShowLedgerModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close Statement
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 9: DRIVER EARNINGS MODAL ========================= */}
      {/* ========================================================================= */}
      {showEarningsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Earnings Breakdown</h3>
                  <p className="text-[10px] text-slate-400">{currentDriver.name} • Coimbatore Dispatch</p>
                </div>
              </div>
              <button onClick={() => setShowEarningsModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {/* Daily total card */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-2xl border border-emerald-500/40 space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Total Net Earnings (Platform)</div>
                <div className="text-3xl font-black text-white font-mono">
                  ₹{completedDriverTrips.reduce((acc, t) => acc + t.fare.driverEarnings, 0) + incentiveResult.totalIncentive}
                </div>
                <p className="text-[10px] text-slate-400">
                  {completedDriverTrips.length} Completed Trips • ₹{incentiveResult.totalIncentive} Incentive Bonus
                </p>
              </div>

              {/* Incentives progress card */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Milestone Incentives</span>
                  </span>
                  <span className="text-amber-400 font-mono">+₹{incentiveResult.totalIncentive}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {(incentiveSlabs || []).map((s) => {
                    const achieved = completedDriverTrips.length >= s.minCompletedTrips;
                    return (
                      <div key={s.id} className="flex items-center justify-between text-[11px] p-2 bg-slate-950 rounded-xl">
                        <span>{s.minCompletedTrips} Trips Target</span>
                        <span className={achieved ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {achieved ? `✓ ₹${s.incentiveAmount} Cleared` : `₹${s.incentiveAmount} (${s.minCompletedTrips - completedDriverTrips.length} to go)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Completed Trips */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Recent Delivered Trips ({completedDriverTrips.length})
                </div>
                {completedDriverTrips.slice(0, 5).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{t.bookingCode}</div>
                      <div className="text-[10px] text-slate-400">{t.pickup.area} ➔ {t.drop.area}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">+₹{t.fare.driverEarnings}</div>
                      <div className="text-[9px] text-slate-500">Gross: ₹{t.fare.totalFare}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowEarningsModal(false);
                  setShowHistoryModal(true);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-1.5"
              >
                <History className="w-4 h-4" />
                <span>View Full Trip History ➔</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEarningsModal(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 9: DRIVER PROFILE & KYC MODAL ==================== */}
      {/* ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Driver Profile & Documents</h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {/* Profile Card */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center space-x-3">
                <img
                  src={currentDriver.avatar}
                  alt={currentDriver.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm">{currentDriver.name}</div>
                  <div className="text-[11px] text-slate-400">{currentDriver.phone}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentDriver.email}</div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-[9px]">
                      {currentDriver.kycStatus}
                    </span>
                    <span className="text-[10px] text-slate-400">⭐ {currentDriver.rating} Rating</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Specs */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Credentials</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Vehicle Reg:</span>
                    <span className="font-bold text-white font-mono">{currentDriver.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vehicle Model:</span>
                    <span className="font-bold text-white">{currentDriver.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category:</span>
                    <span className="font-bold text-white capitalize">{currentDriver.vehicleCategory.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Driving License (DL):</span>
                    <span className="font-bold text-emerald-400 font-mono">{currentDriver.drivingLicenseNumber || 'TN-38-2022-0098412'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DL Validity End Date:</span>
                    <span className="font-bold text-white font-mono">{currentDriver.dlValidityEndDate || '2032-08-14'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth (DOB):</span>
                    <span className="font-bold text-white font-mono">{currentDriver.dateOfBirth || '1991-06-18'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Blood Group:</span>
                    <span className="font-bold text-rose-400">{currentDriver.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fleet Group:</span>
                    <span className="font-bold text-white">{currentDriver.groupName || 'Central'}</span>
                  </div>
                </div>
                <div className="pt-1 text-[11px] border-t border-slate-800">
                  <span className="text-slate-500 block">Residential Address:</span>
                  <span className="font-medium text-slate-300 leading-snug block mt-0.5">
                    {currentDriver.address || '42, Gandhipuram 4th Street, Coimbatore, Tamil Nadu - 641012'}
                  </span>
                </div>
              </div>

              {/* Bank & Payout Details */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank & Payout Setup</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-bold text-white">{currentDriver.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account No:</span>
                    <span className="font-mono text-white">{currentDriver.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono text-white">{currentDriver.bankDetails.ifscCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPI ID:</span>
                    <span className="font-mono text-emerald-300">{currentDriver.bankDetails.upiId}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= ITEM 9: COMPANY PRIVACY POLICY MODAL ================== */}
      {/* ========================================================================= */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Company Privacy Policy</h3>
                  <p className="text-[10px] text-slate-400">{brandConfig.companyName}</p>
                </div>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs text-slate-300 leading-relaxed">
              <p className="text-[11px] text-slate-400">
                This Driver Partner Privacy Policy explains how {brandConfig.companyName} collects, uses, and protects your personal and operational information while you are on the platform.
              </p>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">1. Location & Telematics Tracking</div>
                <p className="text-[11px] text-slate-400">
                  When you toggle your status to <strong>ONLINE</strong>, {brandConfig.appName} records real-time GPS coordinates to calculate proximity to nearby freight bookings, ensure driver en-route safety, and power live customer tracking. Location sharing ceases when you toggle <strong>OFFLINE</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">2. Contact Number Sharing on Active Orders</div>
                <p className="text-[11px] text-slate-400">
                  Once an order is accepted, your contact number and vehicle registration plate are shared with the customer/shipper solely for coordination during loading and delivery. Off-platform misuse or private fare solicitation is strictly prohibited.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">3. Financial Ledger & Digital Payments</div>
                <p className="text-[11px] text-slate-400">
                  Bank accounts and UPI handles submitted are encrypted and used solely for platform earnings disbursements and incentive crediting. Negative balance recovery terms apply as outlined in partner contracts.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">4. Compliance with DPDPA 2023</div>
                <p className="text-[11px] text-slate-400">
                  All personal data is processed strictly in accordance with the Indian Information Technology Act 2000 and Digital Personal Data Protection Act (DPDPA 2023). For grievances, contact our Data Protection Officer at <code className="text-emerald-300">privacy@swifload.in</code>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= DRIVER TRAININGS MODAL ================================= */}
      {/* ========================================================================= */}
      {showTrainingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Driver Partner Trainings</h3>
                  <p className="text-[10px] text-slate-400">Coimbatore Fleet Compliance</p>
                </div>
              </div>
              <button onClick={() => setShowTrainingsModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {/* Overview Card */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-blue-500/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Eligibility Standing</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {(currentDriver.trainingsPending?.length || 0) === 0 ? '✓ Eligible to Receive Orders' : '⚠️ Action Required'}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {currentDriver.trainingsAttended || 4} Mandatory Modules Completed
                  </div>
                </div>
                <span className="text-2xl">🎓</span>
              </div>

              {/* Mandatory Pending Trainings */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Mandatory Training Status
                </div>
                {(currentDriver.trainingsPending && currentDriver.trainingsPending.length > 0) ? (
                  currentDriver.trainingsPending.map((tp, idx) => (
                    <div key={idx} className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{tp}</span>
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                          Pending
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Complete this mandatory orientation module before Friday to maintain order dispatch eligibility.
                      </p>
                      <button
                        type="button"
                        onClick={() => showToast(`Started module: ${tp}`)}
                        className="mt-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-bold"
                      >
                        Start 10-Min Video Module ➔
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl flex items-center space-x-2.5 text-emerald-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">All Mandatory Trainings Cleared!</div>
                      <div className="text-[10px] text-emerald-200/80">No pending training restrictions. Your vehicle receives regular dispatch calls.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Completed Modules List */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Completed Certifications ({currentDriver.trainingsAttended || 4})
                </div>
                {[
                  'Intra-City Coimbatore Navigation & Safe Driving (v1.2)',
                  'Safe Loading & Heavy Cargo Strapping Standards',
                  'Customer Communication & OTP Custody Verification',
                  'Emergency Protocol & Accident First-Response'
                ].map((mod, i) => (
                  <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">✓ {mod}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">Passed</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTrainingsModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= DRIVER HELP & FAQS MODAL =============================== */}
      {/* ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Driver Partner Help & Support</h3>
                  <p className="text-[10px] text-slate-400">Coimbatore Operations Hub</p>
                </div>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {/* If a topic is selected, show its solution */}
              {selectedDriverHelpTopicId ? (() => {
                const topic = DRIVER_HELP_TOPICS.find((t) => t.id === selectedDriverHelpTopicId) || DRIVER_HELP_TOPICS[0];
                return (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => setSelectedDriverHelpTopicId(null)}
                      className="text-xs text-teal-400 hover:underline flex items-center space-x-1 font-bold"
                    >
                      <span>← Back to all questions</span>
                    </button>

                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-teal-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{topic.category}</span>
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">Step-by-Step Resolution</span>
                      </div>
                      <div className="text-sm font-black text-white">{topic.title}</div>
                      <div className="space-y-1.5 pt-1">
                        {topic.steps.map((st, i) => (
                          <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Recommended Action:</div>
                      {topic.id === 'negative_balance_unblock' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowHelpModal(false);
                            setWalletModalTab('recharge');
                            setShowDriverTopupModal(true);
                          }}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                        >
                          Open Wallet Recharge Modal ➔
                        </button>
                      )}
                      {topic.id === 'vehicle_breakdown' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowHelpModal(false);
                            setSelectedCancelReason('Vehicle breakdown');
                            setShowCancelReasonModal(true);
                          }}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
                        >
                          Report Breakdown to Dispatch ➔
                        </button>
                      )}
                      <a
                        href="tel:+918023456789"
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                        <span>Call Coimbatore Fleet Support Desk</span>
                      </a>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Frequently Asked Questions (Click to resolve)
                  </div>
                  {DRIVER_HELP_TOPICS.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedDriverHelpTopicId(topic.id)}
                      className="p-3 bg-slate-900 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-teal-400 block">{topic.category}</span>
                        <div className="font-bold text-white text-xs mt-0.5">{topic.title}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <a
                      href="tel:+918023456789"
                      className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-center font-bold flex flex-col items-center space-y-1"
                    >
                      <PhoneCall className="w-4 h-4 text-rose-400" />
                      <span>Direct Ops Desk</span>
                    </a>
                    <a
                      href="https://wa.me/919845012345?text=Driver%20Partner%20Urgent%20Assistance"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-teal-950/60 border border-teal-800 rounded-xl text-teal-300 text-center font-bold flex flex-col items-center space-y-1"
                    >
                      <MessageSquare className="w-4 h-4 text-teal-400" />
                      <span>WhatsApp Desk</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowHelpModal(false);
                setSelectedDriverHelpTopicId(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

            {/* ========================================================================= */}
      {/* ================= HOME VIEW FLOATING INCOMING TASK POPUP ================ */}
      {/* ========================================================================= */}
      {driverPage === 'home' && activeIncomingTrip && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider">
                  ⚡ New Freight Call: {activeIncomingTrip.bookingCode}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                ⏳ {activeIncomingTrip.dispatchCountdownSecs ?? dispatchTimeoutSecs}s
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-400 text-[10px]">Route</div>
                <div className="font-bold text-white">{activeIncomingTrip.pickup.area} ➔ {activeIncomingTrip.drop.area}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[10px]">Net Earnings</div>
                <div className="font-black text-emerald-400 text-sm">₹{activeIncomingTrip.fare.driverEarnings}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  passTripToNextGroup(activeIncomingTrip.id);
                  setDismissedTripIds((prev) => [...prev, activeIncomingTrip.id]);
                  showToast(`Skipped ${activeIncomingTrip.bookingCode}`);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  setDriverPage('duty');
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                View & Accept (₹{activeIncomingTrip.fare.driverEarnings}) ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
