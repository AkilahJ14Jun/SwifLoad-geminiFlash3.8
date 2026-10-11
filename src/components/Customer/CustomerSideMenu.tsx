'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  CreditCard,
  Gift,
  Wallet,
  Headphones,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Share2,
  ChevronRight,
  Globe,
  Sparkles,
  Phone,
  Calendar,
  Building,
  Shield,
  Star,
  ExternalLink,
} from 'lucide-react';
import { CustomerUser } from '@/types/logistics';

interface CustomerSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  onUpdateCustomer: (updates: Partial<CustomerUser>) => void;
  onNavigateTab: (
    tab: 'book' | 'tracking' | 'history' | 'transactions' | 'wallet' | 'referrals' | 'profile' | 'support'
  ) => void;
  onReplaySplash: () => void;
  darkMode?: boolean;
  showToast: (msg: string) => void;
}

export default function CustomerSideMenu({
  isOpen,
  onClose,
  customer,
  onUpdateCustomer,
  onNavigateTab,
  onReplaySplash,
  darkMode = false,
  showToast,
}: CustomerSideMenuProps) {
  const [activeSection, setActiveSection] = useState<
    'menu' | 'profile' | 'address' | 'payment' | 'referral' | 'support' | 'feedback' | 'help'
  >('menu');

  const [selectedHelpTopicId, setSelectedHelpTopicId] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Editable Profile States
  const [editName, setEditName] = useState<string>(customer?.name || 'Kavitha Sundaram');
  const [editPhone, setEditPhone] = useState<string>(customer?.phone || '+91 98422 19283');
  const [editEmail, setEditEmail] = useState<string>(customer?.email || 'kavitha.sundaram@example.com');
  const [editGender, setEditGender] = useState<string>(customer?.gender || 'Female');
  const [editDob, setEditDob] = useState<string>(customer?.dateOfBirth || '22 May 1988');

  // Editable Default Address States
  const [editAddress, setEditAddress] = useState<string>(
    customer?.defaultPickupAddress?.address || 'Plot 42, Peelamedu Industrial Estate, Avinashi Road'
  );
  const [editArea, setEditArea] = useState<string>(
    customer?.defaultPickupAddress?.area || 'Peelamedu, Coimbatore - 641004'
  );
  const [editContactPhone, setEditContactPhone] = useState<string>(
    customer?.defaultPickupAddress?.contactPhone || '+91 98422 19283'
  );

  // Editable Payment Details States
  const [editAccNum, setEditAccNum] = useState<string>(
    customer?.bankDetails?.accountNumber || '918273645012'
  );
  const [editIfsc, setEditIfsc] = useState<string>(customer?.bankDetails?.ifscCode || 'HDFC0001824');
  const [editBankName, setEditBankName] = useState<string>(
    customer?.bankDetails?.bankName || 'HDFC Bank - Peelamedu Branch'
  );
  const [editUpi, setEditUpi] = useState<string>(
    customer?.bankDetails?.upiId || 'kavitha.sundaram@okhdfcbank'
  );

  // Language state
  const [selectedLang, setSelectedLang] = useState<string>(
    customer?.preferredLanguage || 'Tamil (தமிழ்)'
  );

  // Feedback States
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbCategory, setFbCategory] = useState<string>('Driver & Delivery Experience');
  const [fbRemarks, setFbRemarks] = useState<string>('');
  const [fbSubmitted, setFbSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customer?.referralCode || 'SWIF-KAVITHA-20');
    setCopiedCode(true);
    showToast('Referral code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `https://swifload-cbe.azurewebsites.net/customer?ref=${customer?.referralCode || 'SWIF-KAVITHA-20'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Book instant trucks & 3-wheelers in Coimbatore with SwifLoad! Use my referral code ${customer?.referralCode || 'SWIF-KAVITHA-20'} for ₹100 discount: https://swifload-cbe.azurewebsites.net/customer`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveProfile = () => {
    onUpdateCustomer({
      name: editName,
      phone: editPhone,
      email: editEmail,
      gender: editGender,
      dateOfBirth: editDob,
    });
    showToast('Customer profile saved successfully!');
    setActiveSection('menu');
  };

  const handleSaveAddress = () => {
    onUpdateCustomer({
      defaultPickupAddress: {
        address: editAddress,
        area: editArea,
        contactName: editName,
        contactPhone: editContactPhone,
      },
    });
    showToast('Default pickup address saved!');
    setActiveSection('menu');
  };

  const handleSavePayment = () => {
    onUpdateCustomer({
      bankDetails: {
        accountName: editName,
        accountNumber: editAccNum,
        ifscCode: editIfsc,
        bankName: editBankName,
        upiId: editUpi,
      },
    });
    showToast('Payment details saved!');
    setActiveSection('menu');
  };

  const handleSelectLanguage = (lang: string) => {
    setSelectedLang(lang);
    onUpdateCustomer({ preferredLanguage: lang });
    showToast(`Preferred language updated to ${lang}`);
  };

  const handleSubmitFeedback = () => {
    setFbSubmitted(true);
    showToast(`Thank you! Your ${fbRating}-star feedback has been recorded.`);
    setTimeout(() => {
      setFbSubmitted(false);
      setFbRemarks('');
      setActiveSection('menu');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full max-w-xs sm:max-w-sm h-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          darkMode ? 'bg-slate-900 text-slate-100 border-r border-slate-800' : 'bg-white text-slate-900 border-r border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg shadow-inner shrink-0">
              {customer?.name
                ? customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : 'KS'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-sm tracking-tight truncate">{customer?.name || 'Kavitha Sundaram'}</h3>
              <p className="text-[11px] text-emerald-100 font-mono flex items-center space-x-1">
                <span>ID: #{customer?.id || 'cust_01'}</span>
                <span>•</span>
                <span className="uppercase">{customer?.customerType || 'Regular'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Points & Wallet Ribbon inside Drawer */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${
          darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>₹{(customer?.wallet?.balance || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>250 Reward Pts</span>
          </div>
          <button
            onClick={() => {
              onNavigateTab('wallet');
              onClose();
            }}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Details →
          </button>
        </div>

        {/* Drawer Body with Sub-Screens or Primary Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ================= 1. PRIMARY MENU LIST ================= */}
          {activeSection === 'menu' && (
            <div className="space-y-1.5">
              {/* Profile */}
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">My Profile</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Name, ID, Gender, DOB & Special Dates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Default Pickup Address */}
              <button
                onClick={() => setActiveSection('address')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Default Pickup Address</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                      {customer?.defaultPickupAddress?.area || 'Peelamedu, Coimbatore'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Payment Details */}
              <button
                onClick={() => setActiveSection('payment')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Payment Details</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Account No, IFSC, UPI ID</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Referral Code & Link */}
              <button
                onClick={() => setActiveSection('referral')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Referral Code & Link</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{customer?.referralCode || 'SWIF-KAVITHA-20'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Wallet */}
              <button
                onClick={() => {
                  onNavigateTab('wallet');
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Wallet & Reward Points</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Points & Passbook Details</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Support with preferred language */}
              <button
                onClick={() => setActiveSection('support')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Customer Support</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Lang: {selectedLang}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Feedback */}
              <button
                onClick={() => setActiveSection('feedback')}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Feedback & Ratings</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Share your shipping experience</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Help (Frequently Asked Questions & Problem Solutions) */}
              <button
                onClick={() => {
                  setSelectedHelpTopicId(null);
                  setActiveSection('help');
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Help</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">FAQs & Solutions to Common Problems</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Replay Flower Shower Welcome */}
              <button
                onClick={() => {
                  onReplaySplash();
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  darkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌸</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">Flower Shower Splash</div>
                    <div className="text-[10px] opacity-80">Replay Coimbatore welcome greeting</div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          )}

          {/* ================= 2. PROFILE SUB-VIEW ================= */}
          {activeSection === 'profile' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-emerald-950 dark:text-emerald-200">Customer Profile</span>
                  <span className="font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    ID: #{customer?.id || 'cust_01'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Registered shipper details for SwifLoad intra-city dispatches.
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Customer Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Contact Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Corporate Entity">Corporate Entity</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Date of Birth</label>
                    <input
                      type="text"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      placeholder="e.g. 22 May 1988"
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Readonly info */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Since:</span>
                    <span className="font-bold">{customer?.registeredSince || '14 Jan 2024'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Firm / Company:</span>
                    <span className="font-bold">{customer?.companyName || 'Sundaram Engineering'}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 font-semibold block mb-1">Special Dates:</span>
                    {customer?.specialDates && customer.specialDates.length > 0 ? (
                      customer.specialDates.map((sd, i) => (
                        <div key={i} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>🎉 {sd.label}:</span>
                          <span className="font-bold">{sd.date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>🎉 Anniversary:</span>
                        <span className="font-bold">28 October</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs text-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. DEFAULT PICKUP ADDRESS SUB-VIEW ================= */}
          {activeSection === 'address' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
                <span className="font-black text-sm text-blue-950 dark:text-blue-200">Default Pickup Address</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Pre-filled automatically when starting express dispatches in Coimbatore.
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Premises / Street Address</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Locality & City Area</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Pickup Contact Number</label>
                  <input
                    type="text"
                    value={editContactPhone}
                    onChange={(e) => setEditContactPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs text-xs"
                >
                  Save Default Pickup Address
                </button>
              </div>
            </div>
          )}

          {/* ================= 4. PAYMENT DETAILS SUB-VIEW ================= */}
          {activeSection === 'payment' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1.5">
                <span className="font-black text-sm text-purple-950 dark:text-purple-200">Customer Payment Details</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Bank and UPI accounts for billing, refunds, and referral bonus credits.
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Bank Account Number</label>
                  <input
                    type="text"
                    value={editAccNum}
                    onChange={(e) => setEditAccNum(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Bank IFSC Code</label>
                  <input
                    type="text"
                    value={editIfsc}
                    onChange={(e) => setEditIfsc(e.target.value.toUpperCase())}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Bank & Branch Name</label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Primary UPI ID (Google Pay / PhonePe)</label>
                  <input
                    type="text"
                    value={editUpi}
                    onChange={(e) => setEditUpi(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs text-xs"
                >
                  Save Payment Details
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. REFERRAL SUB-VIEW ================= */}
          {activeSection === 'referral' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-black text-sm text-amber-950 dark:text-amber-200">Refer & Earn Program</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Earn ₹150 for customer referrals and ₹500 for driver referrals in Coimbatore!
                </p>
              </div>

              {/* Referral Code Card */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Your Unique Referral Code</span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                    {customer?.referralCode || 'SWIF-KAVITHA-20'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center space-x-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Referral Link Card */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Shareable Referral Link</span>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono break-all text-slate-600 dark:text-slate-300">
                  https://swifload-cbe.azurewebsites.net/customer?ref={customer?.referralCode || 'SWIF-KAVITHA-20'}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-bold text-xs flex items-center justify-center space-x-1 bg-white dark:bg-slate-900"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. SUPPORT SUB-VIEW ================= */}
          {activeSection === 'support' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="font-black text-sm text-rose-950 dark:text-rose-200">Preferred Support Language</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Choose your language for customer care interactions and notifications.
                </p>
              </div>

              {/* Language Selector Pills */}
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'Tamil (தமிழ்)', label: 'தமிழ் • Tamil (Default Coimbatore)' },
                  { id: 'English', label: 'English • Standard' },
                  { id: 'Hindi (हिंदी)', label: 'हिंदी • Hindi' },
                  { id: 'Malayalam (മലയാളം)', label: 'മലയാളം • Malayalam' },
                  { id: 'Kannada (ಕನ್ನಡ)', label: 'ಕನ್ನಡ • Kannada' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedLang === lang.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : darkMode
                        ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {selectedLang === lang.id && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>

              {/* Contact Channels */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Coimbatore Helpline Channels</span>
                <a
                  href="tel:18007943562"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-xs">24x7 Shipper Helpline</div>
                    <div className="text-[10px] text-slate-500">1800-SWIF-LOAD / +91 422 291 0000</div>
                  </div>
                </a>
                <a
                  href="https://wa.me/919842200000?text=Hi%20SwifLoad%20Support"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <div>
                    <div className="font-bold text-xs">Official WhatsApp Desk</div>
                    <div className="text-[10px] text-slate-500">+91 98422 00000 (Instant replies)</div>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* ================= 7. FEEDBACK SUB-VIEW ================= */}
          {activeSection === 'feedback' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <button
                onClick={() => setActiveSection('menu')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                <span className="font-black text-sm text-indigo-950 dark:text-indigo-200">Customer Feedback</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Help us improve SwifLoad freight operations across Coimbatore.
                </p>
              </div>

              {/* Star Rating */}
              <div className="space-y-1 text-center py-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Rate Your Overall Experience</span>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFbRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-amber-500 pt-0.5">
                  {fbRating === 5 ? 'Excellent ⭐⭐⭐⭐⭐' : fbRating === 4 ? 'Good ⭐⭐⭐⭐' : fbRating === 3 ? 'Average ⭐⭐⭐' : 'Needs Improvement'}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Feedback Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Driver & Delivery Experience">Driver & Delivery Experience</option>
                    <option value="Fare Transparency & Pricing">Fare Transparency & Pricing</option>
                    <option value="App Performance & UI">App Performance & UI</option>
                    <option value="OTP Verification & Safety">OTP Verification & Safety</option>
                    <option value="Other Suggestions">Other Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Your Feedback / Suggestion</label>
                  <textarea
                    rows={3}
                    value={fbRemarks}
                    onChange={(e) => setFbRemarks(e.target.value)}
                    placeholder="Tell us what you loved or how we can improve..."
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={fbSubmitted}
                  onClick={handleSubmitFeedback}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs text-xs"
                >
                  {fbSubmitted ? 'Feedback Submitted ✓' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          )}

          {/* ================= 8. HELP SUB-VIEW ================= */}
          {activeSection === 'help' && (
            <div className="space-y-3 animate-in fade-in-50 text-xs">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (selectedHelpTopicId) {
                      setSelectedHelpTopicId(null);
                    } else {
                      setActiveSection('menu');
                    }
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>{selectedHelpTopicId ? '← Back to Questions' : '← Back to Menu'}</span>
                </button>
                {selectedHelpTopicId && (
                  <button
                    onClick={() => setActiveSection('menu')}
                    className="text-[11px] text-slate-400 hover:underline"
                  >
                    Main Menu
                  </button>
                )}
              </div>

              {/* Sub-view Header */}
              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-black text-sm text-cyan-950 dark:text-cyan-200">
                    {selectedHelpTopicId ? 'Help & Resolution' : 'Frequently Asked Questions'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {selectedHelpTopicId
                    ? 'Recommended solution and troubleshooting steps for your selected issue.'
                    : 'Choose your issue below to get immediate step-by-step guidance.'}
                </p>
              </div>

              {/* VIEW A: DETAILED SOLUTION FOR SELECTED PROBLEM */}
              {selectedHelpTopicId ? (
                (() => {
                  const topics: { [key: string]: { title: string; category: string; steps: string[]; actionText?: string; actionTab?: any } } = {
                    cancel_booking: {
                      title: 'How do I cancel my order after booking is confirmed?',
                      category: 'Booking & Cancellation',
                      steps: [
                        'Once a booking is confirmed, the "Cancel Order" button becomes visible directly on your live tracking screen.',
                        'Tap "Cancel Order" and choose your reason from the prompt.',
                        'If the driver partner has not yet arrived at the pickup location, there are zero cancellation fees.',
                        'If you need immediate live agent assistance, you can also reach our dispatch desk at 1800-SWIF-LOAD.',
                      ],
                      actionText: 'View Active Tracking Screen',
                      actionTab: 'tracking',
                    },
                    driver_delayed: {
                      title: 'Driver partner is delayed or unable to find my pickup address',
                      category: 'Trip Assistance',
                      steps: [
                        'Open the active tracking screen to see the live GPS marker of your driver approaching.',
                        'Tap "Call Driver" to connect via our privacy-masked virtual phone bridge without exposing your personal phone number.',
                        'Provide prominent nearby landmarks (e.g., Cross Cut Road bus stand, PSG Tech, Tidel Park signal).',
                        'If the driver is unresponsive for more than 5 minutes, you can safely cancel or re-dispatch.',
                      ],
                      actionText: 'Open Active Tracking',
                      actionTab: 'tracking',
                    },
                    otp_protocol: {
                      title: 'Why is Two-Way OTP required and where do I find my OTP?',
                      category: 'Security & Custody',
                      steps: [
                        'SwifLoad uses two-way OTP custody verification for verified cargo protection in Coimbatore.',
                        'Pickup OTP (4 digits) is displayed on your tracking screen. Provide this to the driver when they physically load your goods.',
                        'Delivery OTP (4 digits) is shared with the receiver. The driver enters this at destination to verify safe delivery.',
                        'Never share OTPs over the phone prior to physical handover of cargo.',
                      ],
                      actionText: 'Check Active Trip OTPs',
                      actionTab: 'tracking',
                    },
                    tariff_calculation: {
                      title: 'How do distance slab charges and waiting fees work?',
                      category: 'Tariffs & Pricing',
                      steps: [
                        'Fares use tiered distance slabs (0-1 km base rate, 1-3 km rate, and 3-5 km incremental rate).',
                        'Rates are quoted transparently based on the farthest driver in range to protect you from surge surprises.',
                        'The first 15 minutes of loading and unloading time are 100% complimentary.',
                        'Subsequent waiting is charged nominal per-minute waiting fees based on the vehicle category.',
                      ],
                    },
                    wallet_issue: {
                      title: 'My wallet recharge or online payment was deducted but not reflected',
                      category: 'Payments & Refunds',
                      steps: [
                        'Check your Passbook / Transactions tab in the side menu or bottom bar to see real-time ledger entries.',
                        'If an online bank or UPI deduction failed to credit, our automated bank gateway reconciliation reconciles transactions within 15 minutes.',
                        'If the balance is still not reflected after 15 minutes, message our official WhatsApp desk with your UPI UTR reference number for instant manual crediting.',
                      ],
                      actionText: 'Open Wallet & Passbook',
                      actionTab: 'wallet',
                    },
                    multi_stop: {
                      title: 'Can I book multi-stop pickups and drops across Coimbatore?',
                      category: 'Dispatch Options',
                      steps: [
                        'Yes! On the booking screen, toggle from "1 Pick ➔ 1 Drop" to "Multi Pick" or "Multi Drop".',
                        'Add up to 5 individual pickup or drop stops across Coimbatore localities (e.g. Peelamedu ➔ Gandhipuram ➔ RS Puram).',
                        'Our route optimization calculates the optimal sequential route with accurate slab distance pricing.',
                      ],
                      actionText: 'Create a Multi-Stop Booking',
                      actionTab: 'book',
                    },
                    prohibited_goods: {
                      title: 'What goods and materials are prohibited from being transported?',
                      category: 'Safety & Compliance',
                      steps: [
                        'Prohibited items include: flammable chemicals, raw fuel, hazardous industrial acids, fireworks/crackers, illegal contraband, and uncontained toxic liquids.',
                        'Allowed items include: commercial textiles, machinery & pump parts, electronics, home decor, furniture, and packaged goods.',
                        'Drivers have the legal authority to inspect and reject unmanifested hazardous cargo.',
                      ],
                    },
                  };

                  const topic = topics[selectedHelpTopicId] || topics.cancel_booking;

                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                          {topic.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {topic.title}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Step-by-Step Resolution:
                        </span>
                        <div className="space-y-1.5">
                          {topic.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-start space-x-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {topic.actionText && topic.actionTab && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateTab(topic.actionTab);
                            onClose();
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        >
                          <span>{topic.actionText}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <a
                          href="tel:18007943562"
                          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-bold text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          📞 1800-SWIF-LOAD
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedHelpTopicId(null)}
                          className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-[11px] text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                        >
                          Other Questions
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* VIEW B: LIST OF FREQUENTLY ASKED QUESTIONS */
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select a Question to View Solution:
                  </span>
                  {[
                    {
                      id: 'cancel_booking',
                      q: 'How do I cancel my order after booking is confirmed?',
                      cat: 'Booking & Cancellation',
                    },
                    {
                      id: 'driver_delayed',
                      q: 'Driver partner is delayed or cannot find my pickup address',
                      cat: 'Trip Assistance',
                    },
                    {
                      id: 'otp_protocol',
                      q: 'Why is Two-Way OTP required and where do I find my OTP?',
                      cat: 'Security & Custody',
                    },
                    {
                      id: 'tariff_calculation',
                      q: 'How do distance slab charges and waiting fees work?',
                      cat: 'Tariffs & Pricing',
                    },
                    {
                      id: 'wallet_issue',
                      q: 'My wallet recharge or online payment failed or was delayed',
                      cat: 'Payments & Refunds',
                    },
                    {
                      id: 'multi_stop',
                      q: 'Can I book multi-stop pickups and drops across Coimbatore?',
                      cat: 'Dispatch Options',
                    },
                    {
                      id: 'prohibited_goods',
                      q: 'What goods and materials are prohibited from being transported?',
                      cat: 'Safety & Compliance',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedHelpTopicId(item.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {item.cat}
                        </span>
                        <div className="font-bold text-xs leading-snug">
                          {item.q}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className={`p-3 border-t text-center text-[10px] font-mono ${
          darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          SwifLoad v2.4 • Coimbatore Intra-City Freight Hub
        </div>
      </div>
    </div>
  );
}
