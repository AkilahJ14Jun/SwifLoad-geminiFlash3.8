'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart3,
  Users,
  Truck,
  MapPin,
  Settings,
  DollarSign,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Edit3,
  Navigation,
  MessageSquare,
  Plus,
  Layers,
  Sparkles,
  Calculator,
  Gift,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  Sliders,
  Share2,
  X,
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import {
  AdminRole,
  VehicleCategory,
  TripStatus,
  VehicleConfig,
  ServiceZone,
  CustomerType,
  DistanceSlab,
  CustomerTypeSlabConfig,
  ReferralRecord,
  WalletTransaction,
} from '@/types/logistics';
import { calculateSlabDistanceFare } from '@/lib/pricing';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { ssr: false });

export default function AdminPortal() {
  const {
    adminRole,
    setAdminRole,
    trips,
    drivers,
    vehicleConfigs,
    serviceZones,
    assignDriver,
    approveDriverKyc,
    rejectDriverKyc,
    updateVehicleConfig,
    updateServiceZone,
    addAdminNote,
    exportCsvData,
    resetToDemoData,
    showToast,
    customerSlabConfigs,
    updateCustomerSlabConfig,
    referralConfig,
    updateReferralConfig,
    referrals,
    claimReferralBonus,
    updateDriverNegativeLimit,
    topUpDriverWallet,
    adjustWalletBalance,
    currentCustomer,
    topUpCustomerWallet,
  } = useLogistics();

  // Admin Navigation Tab
  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'live-board'
    | 'fleet-map'
    | 'drivers-kyc'
    | 'slab-rates'
    | 'referrals'
    | 'wallets'
    | 'pricing-zones'
    | 'finance'
    | 'audit'
  >('dashboard');

  // Filters for Live Board
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected trip for details modal
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [reassignDriverId, setReassignDriverId] = useState<string>('');

  // Edit Vehicle Pricing / Zone Modal
  const [editingVehicle, setEditingVehicle] = useState<VehicleConfig | null>(null);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);

  // Slab Rates Management State
  const [selectedSlabCustType, setSelectedSlabCustType] = useState<CustomerType>('regular');
  const [editingSlabItem, setEditingSlabItem] = useState<{
    custType: CustomerType;
    slab: DistanceSlab;
  } | null>(null);
  const [showAddSlabModal, setShowAddSlabModal] = useState<boolean>(false);
  const [newSlabFrom, setNewSlabFrom] = useState<number>(0);
  const [newSlabTo, setNewSlabTo] = useState<number>(1);
  const [newSlabRate, setNewSlabRate] = useState<number>(50);
  const [newSlabType, setNewSlabType] = useState<'flat' | 'per_km'>('flat');
  const [newSlabLabel, setNewSlabLabel] = useState<string>('');

  // Interactive Live Slab Pricing Test Simulator State
  const [simTripKm, setSimTripKm] = useState<number>(3.0);
  const [simDriver1Dist, setSimDriver1Dist] = useState<number>(1.0);
  const [simDriver2Dist, setSimDriver2Dist] = useState<number>(2.0);

  // Referral Programs Config State
  const [refD2D, setRefD2D] = useState<number>(referralConfig?.driverToDriverBonus || 500);
  const [refD2C, setRefD2C] = useState<number>(referralConfig?.driverToCustomerBonus || 100);
  const [refC2CRef, setRefC2CRef] = useState<number>(referralConfig?.customerToCustomerReferrerBonus || 150);
  const [refC2CNew, setRefC2CNew] = useState<number>(referralConfig?.customerToCustomerRefereeBonus || 100);
  const [referralFilter, setReferralFilter] = useState<string>('ALL');

  // Wallet Management Modals State
  const [editingDriverLimit, setEditingDriverLimit] = useState<{
    driverId: string;
    driverName: string;
    currentLimit: number;
  } | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<number>(1500);

  const [topupTargetDriver, setTopupTargetDriver] = useState<{
    driverId: string;
    driverName: string;
  } | null>(null);
  const [driverTopupAmount, setDriverTopupAmount] = useState<number>(500);

  const [customerTopupAmount, setCustomerTopupAmount] = useState<number>(500);
  const [showCustomerTopupModal, setShowCustomerTopupModal] = useState<boolean>(false);

  const [inspectingTransactions, setInspectingTransactions] = useState<{
    title: string;
    balance: number;
    negativeLimit?: number;
    transactions: WalletTransaction[];
  } | null>(null);

  // Metrics Calculations
  const totalBookings = trips.length;
  const completedTrips = trips.filter((t) => t.status === 'DELIVERED').length;
  const activeTrips = trips.filter((t) => !['DELIVERED', 'CANCELLED'].includes(t.status)).length;
  const cancelledTrips = trips.filter((t) => t.status === 'CANCELLED').length;
  const gmv = trips.reduce((acc, t) => acc + (t.status !== 'CANCELLED' ? t.fare.totalFare : 0), 0);
  const totalCommission = trips.reduce((acc, t) => acc + (t.status === 'DELIVERED' ? t.fare.platformCommission : 0), 0);
  const onlineDrivers = drivers.filter((d) => d.isOnline).length;
  const pendingKyc = drivers.filter((d) => d.kycStatus === 'PENDING').length;

  const currentTripModal = trips.find((t) => t.id === selectedTripId);

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (vehicleFilter !== 'ALL' && t.vehicleCategory !== vehicleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.bookingCode.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.pickup.area.toLowerCase().includes(q) ||
        t.drop.area.toLowerCase().includes(q) ||
        (t.driverName && t.driverName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      {/* Top Admin Navigation & Role Switcher */}
      <header className="bg-slate-900 text-white px-5 py-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-base shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight flex items-center space-x-2">
              <span>SwifLoad Ops Command Portal</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                Coimbatore Central Hub (Tamil Nadu)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Real-time marketplace monitoring, dispatch & governance</p>
          </div>
        </div>

        {/* Role Switcher & Reset */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 text-[10px] px-1 font-semibold uppercase">Role:</span>
            {(['super_admin', 'dispatcher', 'support', 'finance'] as AdminRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setAdminRole(r)}
                className={`px-2 py-1 rounded text-[11px] font-bold capitalize transition-colors ${
                  adminRole === r ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={resetToDemoData}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1"
            title="Reset to fresh demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Sub Tabs Bar */}
      <nav className="bg-white border-b border-slate-200 px-5 py-2 flex items-center space-x-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'dashboard', label: 'Operations Dashboard', icon: BarChart3 },
          { id: 'live-board', label: 'Live Bookings Board', icon: Truck, badge: activeTrips },
          { id: 'fleet-map', label: 'Live Fleet Radar', icon: MapPin },
          { id: 'drivers-kyc', label: 'Driver Partners & KYC', icon: Users, badge: pendingKyc },
          { id: 'slab-rates', label: 'Distance Slab Rates', icon: Calculator },
          { id: 'referrals', label: 'Referral Programs', icon: Gift },
          { id: 'wallets', label: 'Driver & Customer Wallets', icon: Wallet },
          { id: 'pricing-zones', label: 'Vehicle Matrix & Zones', icon: Settings },
          { id: 'finance', label: 'Finance & Reconciliation', icon: DollarSign },
          { id: 'audit', label: 'Audit Trail', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* ================= 1. DASHBOARD ================= */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {completedTrips} delivered • {activeTrips} active
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Marketplace GMV</div>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{gmv.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Gross Merchandise Value</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Revenue</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalCommission.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">18% avg platform take-rate</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Fleet Supply</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {onlineDrivers} <span className="text-sm font-normal text-slate-500">/ {drivers.length}</span>
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">{pendingKyc} pending verification</div>
              </div>
            </div>

            {/* Quick Live Board Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Active Real-Time Freight Orders</h3>
                  <p className="text-xs text-slate-500">Live operational dispatch status across Coimbatore city</p>
                </div>
                <button
                  onClick={() => setAdminTab('live-board')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <span>Go to Live Dispatch Board</span>
                  <span>➔</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {trips.slice(0, 3).map((tr) => (
                  <div
                    key={tr.id}
                    onClick={() => {
                      setSelectedTripId(tr.id);
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{tr.bookingCode}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tr.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tr.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium truncate">
                      {tr.pickup.area} ➔ {tr.drop.area}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{tr.vehicleCategory}</span>
                      <span className="font-bold text-slate-900">₹{tr.fare.totalFare}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. LIVE BOOKINGS BOARD ================= */}
        {adminTab === 'live-board' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by code, customer, area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                >
                  <option value="ALL">All Trip Statuses</option>
                  <option value="SEARCHING">Searching</option>
                  <option value="DRIVER_ASSIGNED">Driver Assigned</option>
                  <option value="ARRIVING_PICKUP">Arriving Pickup</option>
                  <option value="AT_PICKUP">At Pickup</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="ARRIVED_DESTINATION">Arrived Destination</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                >
                  <option value="ALL">All Vehicles</option>
                  <option value="2wheeler">2-Wheeler</option>
                  <option value="3wheeler">3-Wheeler</option>
                  <option value="tata_ace">Tata Ace</option>
                  <option value="pickup_8ft">8ft Pickup</option>
                </select>
              </div>

              {/* CSV Export */}
              <button
                onClick={() => exportCsvData('trips')}
                className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Trips CSV</span>
              </button>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Booking</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Route</th>
                      <th className="p-3.5">Vehicle</th>
                      <th className="p-3.5">Assigned Driver</th>
                      <th className="p-3.5">Fare</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrips.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900">{tr.bookingCode}</div>
                          <div className="text-[10px] text-slate-400">{tr.createdAt.slice(11, 16)}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{tr.customerName}</div>
                          <div className="text-[10px] text-slate-400">{tr.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800 truncate max-w-[160px]">{tr.pickup.area}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">➔ {tr.drop.area} ({tr.distanceKm}km)</div>
                        </td>
                        <td className="p-3.5 capitalize font-medium text-slate-700">
                          {tr.vehicleCategory.replace('_', ' ')}
                        </td>
                        <td className="p-3.5">
                          {tr.driverName ? (
                            <div>
                              <div className="font-semibold text-slate-900">{tr.driverName}</div>
                              <div className="text-[10px] text-slate-400">{tr.driverVehicleNumber}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-black text-slate-900">₹{tr.fare.totalFare}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">{tr.paymentMethod.replace('_', ' ')}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tr.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tr.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {tr.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedTripId(tr.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. LIVE FLEET MAP ================= */}
        {adminTab === 'fleet-map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Live Coimbatore Fleet Telematics</h3>
                <p className="text-xs text-slate-500">
                  Tracking {onlineDrivers} active online drivers and 5 designated service zones
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Online Drivers</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Service Zones</span>
                </div>
              </div>
            </div>

            <LeafletMap
              zones={serviceZones}
              driver={{ lat: 12.9360, lng: 77.6240, label: 'Fleet Hub Koramangala' }}
              pickup={{ lat: 12.9756, lng: 77.6066, label: 'Central Hub' }}
              drop={{ lat: 12.9854, lng: 77.7289, label: 'East Hub ITPL' }}
              className="h-[520px] w-full rounded-2xl border border-slate-200 shadow"
            />
          </div>
        )}

        {/* ================= 4. DRIVER PARTNERS & KYC ================= */}
        {adminTab === 'drivers-kyc' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Driver Partner Onboarding & KYC Management</h3>
                <p className="text-xs text-slate-500">Verify driving licences, vehicle RC, and insurance before activation</p>
              </div>
              <button
                onClick={() => exportCsvData('drivers')}
                className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Drivers CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={drv.avatar}
                        alt={drv.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{drv.name}</h4>
                        <p className="text-xs text-slate-500">{drv.phone} • {drv.email}</p>
                        <p className="text-[11px] font-mono text-slate-700 font-semibold">{drv.vehicleModel} ({drv.vehicleNumber})</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        drv.kycStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : drv.kycStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {drv.kycStatus}
                    </span>
                  </div>

                  {/* Documents Preview */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">Uploaded Documents</div>
                    <div className="grid grid-cols-2 gap-2">
                      {drv.kycDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-lg border text-[11px]">
                          <span className="truncate max-w-[110px]">{doc.docType.replace('_', ' ')}</span>
                          <span className={doc.verified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-medium'}>
                            {doc.verified ? '✓' : 'Review'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KYC Approval Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-500">
                      Balance: <strong className="text-slate-800">₹{drv.wallet.balance}</strong>
                    </div>

                    {drv.kycStatus === 'PENDING' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => rejectDriverKyc(drv.id, 'Unclear document photo')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveDriverKyc(drv.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
                        >
                          Approve KYC
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Partner</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 5. DISTANCE SLAB RATES ENGINE ================= */}
        {adminTab === 'slab-rates' && (
          <div className="space-y-6">
            {/* Header & Category Switcher */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    <span>Distance Slab Rates Engine (Marginal Slabs & Categories)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure slab distance rates. Distance from driver location to customer pickup and drop location calculates driver payout and customer quotes.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const activeSlabConf = customerSlabConfigs.find((c) => c.customerType === selectedSlabCustType);
                    const lastTo = activeSlabConf?.slabs[activeSlabConf.slabs.length - 1]?.toKm || 5;
                    setNewSlabFrom(lastTo === 999 ? 5 : lastTo);
                    setNewSlabTo(lastTo === 999 ? 10 : lastTo + 2);
                    setNewSlabRate(9);
                    setNewSlabType('per_km');
                    setNewSlabLabel(`Above ${lastTo} km`);
                    setShowAddSlabModal(true);
                  }}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Distance Slab</span>
                </button>
              </div>

              {/* Customer Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {(
                  [
                    { type: 'regular', name: 'Regular Customer', desc: 'Standard slab rates' },
                    { type: 'new', name: 'New Customer', desc: 'Introductory promotional rates' },
                    { type: 'multi_pickup', name: 'Multiple Pickup Location', desc: 'Multi-stop transit slabs' },
                    { type: 'corporate', name: 'Corporate Customer', desc: 'Tiered contracted rates' },
                  ] as { type: CustomerType; name: string; desc: string }[]
                ).map((cat) => {
                  const isSel = selectedSlabCustType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      onClick={() => setSelectedSlabCustType(cat.type)}
                      className={`px-3.5 py-2 rounded-xl text-left transition-all ${
                        isSel
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{cat.name}</div>
                      <div className={`text-[10px] ${isSel ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slabs Grid for Selected Customer Category */}
              {(() => {
                const currentConfig =
                  customerSlabConfigs.find((c) => c.customerType === selectedSlabCustType) ||
                  customerSlabConfigs[0];

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Configured Slabs for <strong>{currentConfig.customerTypeName}</strong>:
                      </span>
                      <span className="text-[11px] text-slate-400">{currentConfig.description}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {currentConfig.slabs.map((slab, sIdx) => (
                        <div
                          key={slab.id || sIdx}
                          className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative group hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Slab #{sIdx + 1}
                            </span>
                            <button
                              onClick={() =>
                                setEditingSlabItem({ custType: selectedSlabCustType, slab: { ...slab } })
                              }
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>

                          <div className="text-sm font-extrabold text-slate-900">
                            {slab.fromKm} to {slab.toKm >= 999 ? '∞' : `${slab.toKm} km`}
                          </div>

                          <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Rate:</span>
                            <span className="font-black text-emerald-600 text-sm">
                              ₹{slab.rate}
                              <span className="text-[10px] font-normal text-slate-400">
                                {slab.rateType === 'flat' ? ' (Flat Min)' : '/km'}
                              </span>
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 truncate">{slab.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Live Interactive Pricing Simulation Sandbox */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 text-lg">⚡</span>
                    <h4 className="font-extrabold text-sm text-white">
                      Live Slab Pricing Simulation Sandbox (Verify prompt requirement)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Demonstrates exact behavior: Driver 1 at 1 km away gets ₹68, Driver 2 at 2 km away gets ₹74. Customer quote uses farthest driver (₹74).
                  </p>
                </div>

                <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono">
                  Slab Rules: 0-1km flat ₹50 • 1-3km ₹6/km • 3-5km ₹6/km
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-semibold">Customer Trip Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={simTripKm}
                    onChange={(e) => setSimTripKm(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Pickup to drop distance</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-semibold">Driver A Distance to Pickup (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={simDriver1Dist}
                    onChange={(e) => setSimDriver1Dist(Number(e.target.value) || 0.5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-bold text-emerald-400 text-sm"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 1.0 km away from customer</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-semibold">Driver B Distance to Pickup (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={simDriver2Dist}
                    onChange={(e) => setSimDriver2Dist(Number(e.target.value) || 0.5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-bold text-cyan-400 text-sm"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 2.0 km away from customer</span>
                </div>
              </div>

              {/* Simulation Result Cards */}
              {(() => {
                const currentConfig =
                  customerSlabConfigs.find((c) => c.customerType === selectedSlabCustType) ||
                  customerSlabConfigs[0];
                const d1Total = Math.round((simDriver1Dist + simTripKm) * 10) / 10;
                const d2Total = Math.round((simDriver2Dist + simTripKm) * 10) / 10;
                const farthestDist = Math.max(simDriver1Dist, simDriver2Dist);
                const custTotal = Math.round((farthestDist + simTripKm) * 10) / 10;

                const d1Calc = calculateSlabDistanceFare(d1Total, currentConfig.slabs);
                const d2Calc = calculateSlabDistanceFare(d2Total, currentConfig.slabs);
                const custCalc = calculateSlabDistanceFare(custTotal, currentConfig.slabs);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Driver 1 Card */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">Driver A ({simDriver1Dist} km away)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                          Total: {d1Total} km
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Task Payout on Driver App</div>
                        <div className="text-3xl font-black text-emerald-400 mt-1">₹{d1Calc.totalSlabCost}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {simDriver1Dist}km approach + {simTripKm}km trip
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        {d1Calc.breakdown.map((b, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{b.slabLabel}:</span>
                            <span className="text-slate-200 font-mono">₹{b.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Driver 2 Card */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400">Driver B ({simDriver2Dist} km away)</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                          Total: {d2Total} km
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Task Payout on Driver App</div>
                        <div className="text-3xl font-black text-cyan-400 mt-1">₹{d2Calc.totalSlabCost}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {simDriver2Dist}km approach + {simTripKm}km trip
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        {d2Calc.breakdown.map((b, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{b.slabLabel}:</span>
                            <span className="text-slate-200 font-mono">₹{b.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Quoted Card */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">Customer Displayed Fare</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          Quoted via Farthest Driver ({farthestDist} km)
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Initial Customer Quote</div>
                        <div className="text-3xl font-black text-amber-400 mt-1">₹{custCalc.totalSlabCost}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Based on {farthestDist}km max approach + {simTripKm}km trip
                        </div>
                      </div>

                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <span>🛡️ Customer Protection Guarantee</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-amber-200/90">
                          Notice displayed: "Prices shown can vary. Quoted based on the farthest driver in your pickup range to guarantee no surprise fare increases when a driver accepts."
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================= 6. REFERRAL BONUS PROGRAMS ================= */}
        {adminTab === 'referrals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-indigo-600" />
                    <span>Referral Bonus Programs (Driver & Customer Programs)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure bonus reward amounts for driver-to-driver, driver-to-customer, and customer-to-customer referral loops.
                  </p>
                </div>

                <button
                  onClick={() => exportCsvData('referrals')}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Referrals CSV</span>
                </button>
              </div>

              {/* 3 Program Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Track 1: Driver -> Driver */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                      Track 1: Driver ➔ Driver
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Peer Driver Onboarding
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Existing driver partner invites another driver. Bonus credited to driver's wallet when the new driver verifies commercial KYC.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Driver Referral Bonus (₹)</label>
                    <input
                      type="number"
                      value={refD2D}
                      onChange={(e) => setRefD2D(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-indigo-950 font-black text-base"
                    />
                  </div>
                </div>

                {/* Track 2: Driver -> Customer */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                      Track 2: Driver ➔ Customer
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Merchant Acquisition
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Driver partner refers shippers, traders or industrial merchants. Bonus credited to driver wallet when customer completes their first booking.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Driver Commission Bonus (₹)</label>
                    <input
                      type="number"
                      value={refD2C}
                      onChange={(e) => setRefD2C(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-emerald-950 font-black text-base"
                    />
                  </div>
                </div>

                {/* Track 3: Customer -> Customer */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                      Track 3: Customer ➔ Customer
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Viral Organic Loop
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Existing shipper refers another shipper or friend. Referrer earns wallet credits and referee receives instant welcome discount credit.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Referrer Bonus (₹)</label>
                      <input
                        type="number"
                        value={refC2CRef}
                        onChange={(e) => setRefC2CRef(Number(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-xl text-amber-950 font-black text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Referee Welcome (₹)</label>
                      <input
                        type="number"
                        value={refC2CNew}
                        onChange={(e) => setRefC2CNew(Number(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-xl text-amber-950 font-black text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    updateReferralConfig({
                      driverToDriverBonus: refD2D,
                      driverToCustomerBonus: refD2C,
                      customerToCustomerReferrerBonus: refC2CRef,
                      customerToCustomerRefereeBonus: refC2CNew,
                    });
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
                >
                  Save Referral Bonus Matrix ➔
                </button>
              </div>
            </div>

            {/* Referral Tracking Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span>Referral Activity Ledger & Attribution</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    {referrals.length} Total
                  </span>
                </h4>

                <div className="flex items-center space-x-1.5 text-xs">
                  {['ALL', 'CREDITED', 'PENDING'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setReferralFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        referralFilter === f
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Track Type</th>
                      <th className="p-3">Referrer</th>
                      <th className="p-3">Referee</th>
                      <th className="p-3">Bonus Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Initiated</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals
                      .filter((r) => (referralFilter === 'ALL' ? true : r.status === referralFilter))
                      .map((ref) => (
                        <tr key={ref.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-bold text-slate-900">
                              {ref.type === 'DRIVER_TO_DRIVER'
                                ? 'Driver ➔ Driver'
                                : ref.type === 'DRIVER_TO_CUSTOMER'
                                ? 'Driver ➔ Customer'
                                : 'Customer ➔ Customer'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{ref.referrerName}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{ref.referrerRole}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{ref.refereeName}</div>
                            <div className="text-[10px] text-slate-400">{ref.refereePhone || 'Registered User'}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-emerald-600">₹{ref.bonusAmount}</span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ref.status === 'CREDITED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {ref.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-500 font-mono">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            {ref.status === 'PENDING' ? (
                              <button
                                onClick={() => claimReferralBonus(ref.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
                              >
                                Credit Wallet
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">Credited</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. DRIVER & CUSTOMER WALLETS FACILITY ================= */}
        {adminTab === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span>Marketplace Wallets & Driver Overdraft Governance</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Negative balance is permitted <strong>only for drivers</strong> subject to pre-determined limits fixed for each driver. Customer wallets strictly require non-negative balance.
                  </p>
                </div>

                <button
                  onClick={() => exportCsvData('wallets')}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Wallets CSV</span>
                </button>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Driver Wallets</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    ₹{drivers.reduce((acc, d) => acc + d.wallet.balance, 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{drivers.length} Registered Drivers</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Drivers in Overdraft</div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">
                    {drivers.filter((d) => d.wallet.balance < 0).length} Driver(s)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Total utilized: ₹
                    {Math.abs(
                      drivers.filter((d) => d.wallet.balance < 0).reduce((acc, d) => acc + d.wallet.balance, 0)
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Customer Wallet Balance</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    ₹{currentCustomer.wallet.balance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Strictly Non-Negative Policy</div>
                </div>
              </div>

              {/* Driver Wallets Table */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Driver Partner Wallets & Negative Limits</h4>
                  <span className="text-xs text-slate-500">Limits can be adjusted per driver based on rating & tenure</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Driver Partner</th>
                        <th className="p-3">Vehicle / Number</th>
                        <th className="p-3">Current Balance</th>
                        <th className="p-3">Overdraft Limit Allowed</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {drivers.map((drv) => {
                        const isNeg = drv.wallet.balance < 0;
                        const limit = drv.wallet.negativeBalanceLimit || 1500;
                        return (
                          <tr key={drv.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{drv.name}</div>
                              <div className="text-[10px] text-slate-400">{drv.phone}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{drv.vehicleModel}</div>
                              <div className="text-[10px] font-mono text-slate-500">{drv.vehicleNumber}</div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`font-black text-sm ${
                                  isNeg ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                {isNeg ? `-₹${Math.abs(drv.wallet.balance)}` : `₹${drv.wallet.balance}`}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-800">-₹{limit}</span>
                                <button
                                  onClick={() => {
                                    setEditingDriverLimit({
                                      driverId: drv.id,
                                      driverName: drv.name,
                                      currentLimit: limit,
                                    });
                                    setNewLimitInput(limit);
                                  }}
                                  className="text-[10px] text-blue-600 hover:underline font-bold"
                                >
                                  Edit Limit
                                </button>
                              </div>
                            </td>
                            <td className="p-3">
                              {isNeg ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                  Overdraft Used (₹{Math.abs(drv.wallet.balance)} / ₹{limit})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Good Standing
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() =>
                                    setTopupTargetDriver({ driverId: drv.id, driverName: drv.name })
                                  }
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs"
                                >
                                  Top-Up
                                </button>
                                <button
                                  onClick={() =>
                                    setInspectingTransactions({
                                      title: `${drv.name}'s Driver Wallet`,
                                      balance: drv.wallet.balance,
                                      negativeLimit: limit,
                                      transactions: drv.wallet.transactions || [],
                                    })
                                  }
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                                >
                                  Ledger ({drv.wallet.transactions?.length || 0})
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Wallet Section */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Customer Wallets</h4>
                  <span className="text-xs text-slate-500">Shippers & Merchants balance management</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{currentCustomer.name}</div>
                    <div className="text-xs text-slate-500">
                      {currentCustomer.phone} • Category: <strong className="capitalize">{currentCustomer.customerType}</strong> • Referral Code: <strong className="font-mono">{currentCustomer.referralCode}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Wallet Balance</div>
                      <div className="text-xl font-black text-emerald-600">₹{currentCustomer.wallet.balance}</div>
                    </div>

                    <button
                      onClick={() => setShowCustomerTopupModal(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                    >
                      Add Money
                    </button>

                    <button
                      onClick={() =>
                        setInspectingTransactions({
                          title: `${currentCustomer.name}'s Customer Wallet`,
                          balance: currentCustomer.wallet.balance,
                          transactions: currentCustomer.wallet.transactions || [],
                        })
                      }
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
                    >
                      View Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. PRICING CONFIGURATION & GEOFENCES ================= */}
        {adminTab === 'pricing-zones' && (
          <div className="space-y-6">
            {/* Vehicle Pricing Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Dynamic Pricing Engine Matrix</h3>
                  <p className="text-xs text-slate-500">Configure base fares, per-km rates, and helper fees per vehicle class</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicleConfigs.map((veh) => (
                  <div key={veh.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{veh.name}</h4>
                      <button
                        onClick={() => setEditingVehicle(veh)}
                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Rates</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border">
                        <div className="text-[10px] text-slate-400">Base Fare</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">₹{veh.baseFare}</div>
                        <div className="text-[9px] text-slate-400">Incl {veh.baseKm}km</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border">
                        <div className="text-[10px] text-slate-400">Per Km Rate</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">₹{veh.perKmRate}/km</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border">
                        <div className="text-[10px] text-slate-400">Helper Fee</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">₹{veh.helperFee}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Zones & Geofences */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Coimbatore Serviceability Zones & Surge</h3>
                  <p className="text-xs text-slate-500">Configure city polygons, active surge multipliers and coverage radius</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {serviceZones.map((zone) => (
                  <div key={zone.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{zone.name}</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {zone.surgeMultiplier}x Surge
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Radius: {zone.radiusKm} km from center ({zone.center.lat.toFixed(3)}, {zone.center.lng.toFixed(3)})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Pincodes: {zone.pincodes.join(', ')}
                    </div>
                    <button
                      onClick={() => setEditingZone(zone)}
                      className="text-[11px] text-emerald-600 font-bold hover:underline pt-1 block"
                    >
                      Update Surge Multiplier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. FINANCE & RECONCILIATION ================= */}
        {adminTab === 'finance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Financial Ledger & Payout Reconciliation</h3>
                <p className="text-xs text-slate-500">Track digital payment settlements, cash collected, and tax breakdowns</p>
              </div>
              <button
                onClick={() => exportCsvData('finance')}
                className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Finance CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Booking Code</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Gross GMV</th>
                    <th className="p-3.5">Platform Take (18%)</th>
                    <th className="p-3.5">Driver Payout</th>
                    <th className="p-3.5">GST (5%)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trips.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{tr.bookingCode}</td>
                      <td className="p-3.5">{tr.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-3.5 font-black text-slate-900">₹{tr.fare.totalFare}</td>
                      <td className="p-3.5 font-bold text-emerald-600">₹{tr.fare.platformCommission}</td>
                      <td className="p-3.5 font-semibold text-slate-800">₹{tr.fare.driverEarnings}</td>
                      <td className="p-3.5 text-slate-500">₹{tr.fare.taxGst}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {tr.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 7. AUDIT TRAIL ================= */}
        {adminTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">System Audit Trail & Compliance Log</h3>
            <div className="space-y-2.5 text-xs">
              {trips.flatMap((t) => t.auditHistory).map((entry, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800">{entry.event}</div>
                    <div className="text-[10px] text-slate-400">Actor: {entry.actor}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: TRIP INSPECTION & MANUAL DISPATCH ================= */}
      {currentTripModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Trip Inspector: {currentTripModal.bookingCode}</h3>
                <p className="text-xs text-slate-500">Status: <strong>{currentTripModal.status}</strong></p>
              </div>
              <button onClick={() => setSelectedTripId(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Route */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>Pickup: <strong>{currentTripModal.pickup.address}</strong></div>
                <div>Drop: <strong>{currentTripModal.drop.address}</strong></div>
                <div>Distance: <strong>{currentTripModal.distanceKm} km</strong></div>
                <div>Shipment: <strong>{currentTripModal.shipment.goodsCategory} (~{currentTripModal.shipment.approxWeightKg}kg)</strong></div>
                <div>OTPs: Pickup: <strong>{currentTripModal.shipment.pickupOtp}</strong> | Drop: <strong>{currentTripModal.shipment.deliveryOtp}</strong></div>
              </div>

              {/* Manual Dispatch / Reassignment */}
              {adminRole !== 'finance' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-900 text-xs">Manual Dispatch / Reassign Driver</div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={reassignDriverId}
                      onChange={(e) => setReassignDriverId(e.target.value)}
                      className="flex-1 p-2 bg-white border border-blue-300 rounded-lg text-xs"
                    >
                      <option value="">Select an available driver...</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.vehicleModel} - {d.vehicleCategory}) [{d.currentStatus}]
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (reassignDriverId) {
                          assignDriver(currentTripModal.id, reassignDriverId);
                          setSelectedTripId(null);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg text-xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700">Internal Support & Ops Notes</div>
                {currentTripModal.internalNotes && currentTripModal.internalNotes.length > 0 ? (
                  <div className="space-y-1">
                    {currentTripModal.internalNotes.map((nt, i) => (
                      <div key={i} className="p-2 bg-slate-50 border rounded-lg text-slate-700 text-[11px]">
                        {nt}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">No internal notes recorded.</p>
                )}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add operational memo or call log..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border rounded-lg text-xs"
                  />
                  <button
                    onClick={() => {
                      if (noteInput.trim()) {
                        addAdminNote(currentTripModal.id, noteInput.trim());
                        setNoteInput('');
                      }
                    }}
                    className="bg-slate-900 text-white font-bold px-3 py-2 rounded-lg text-xs"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT VEHICLE PRICING ================= */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Edit Pricing: {editingVehicle.name}</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-700">Base Fare (₹)</label>
                <input
                  type="number"
                  value={editingVehicle.baseFare}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, baseFare: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Per Km Rate (₹)</label>
                <input
                  type="number"
                  value={editingVehicle.perKmRate}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, perKmRate: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Loading Helper Fee (₹)</label>
                <input
                  type="number"
                  value={editingVehicle.helperFee}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, helperFee: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingVehicle(null)}
                className="flex-1 py-2 text-xs bg-slate-100 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateVehicleConfig(editingVehicle);
                  setEditingVehicle(null);
                }}
                className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Save Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SERVICE ZONE SURGE ================= */}
      {editingZone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Edit Zone Surge: {editingZone.name}</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-700">Demand Surge Multiplier (e.g. 1.25x)</label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="3.0"
                  value={editingZone.surgeMultiplier}
                  onChange={(e) => setEditingZone({ ...editingZone, surgeMultiplier: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-lg text-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingZone(null)}
                className="flex-1 py-2 text-xs bg-slate-100 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateServiceZone(editingZone);
                  setEditingZone(null);
                }}
                className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Save Zone Surge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DISTANCE SLAB ================= */}
      {editingSlabItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Distance Slab</h3>
                <p className="text-xs text-slate-500 capitalize">Category: {editingSlabItem.custType.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => setEditingSlabItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Slab Display Label</label>
                <input
                  type="text"
                  value={editingSlabItem.slab.label}
                  onChange={(e) =>
                    setEditingSlabItem({
                      ...editingSlabItem,
                      slab: { ...editingSlabItem.slab, label: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">From Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingSlabItem.slab.fromKm}
                    onChange={(e) =>
                      setEditingSlabItem({
                        ...editingSlabItem,
                        slab: { ...editingSlabItem.slab, fromKm: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">To Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={editingSlabItem.slab.toKm}
                    onChange={(e) =>
                      setEditingSlabItem({
                        ...editingSlabItem,
                        slab: { ...editingSlabItem.slab, toKm: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pricing Model</label>
                  <select
                    value={editingSlabItem.slab.rateType}
                    onChange={(e) =>
                      setEditingSlabItem({
                        ...editingSlabItem,
                        slab: {
                          ...editingSlabItem.slab,
                          rateType: e.target.value as 'flat' | 'per_km',
                        },
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  >
                    <option value="flat">Flat Minimum Price (₹)</option>
                    <option value="per_km">Per Kilometer Rate (₹/km)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Rate ({editingSlabItem.slab.rateType === 'flat' ? '₹ Flat' : '₹/km'})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editingSlabItem.slab.rate}
                    onChange={(e) =>
                      setEditingSlabItem({
                        ...editingSlabItem,
                        slab: { ...editingSlabItem.slab, rate: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-extrabold text-emerald-600 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingSlabItem(null)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetConfig = customerSlabConfigs.find((c) => c.customerType === editingSlabItem.custType);
                  if (targetConfig) {
                    const updatedSlabs = targetConfig.slabs.map((s) =>
                      s.id === editingSlabItem.slab.id ? editingSlabItem.slab : s
                    );
                    updateCustomerSlabConfig({ ...targetConfig, slabs: updatedSlabs });
                  }
                  setEditingSlabItem(null);
                }}
                className="flex-1 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
              >
                Save Slab Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW DISTANCE SLAB ================= */}
      {showAddSlabModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Add New Distance Slab</h3>
                <p className="text-xs text-slate-500 capitalize">Target Category: {selectedSlabCustType.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => setShowAddSlabModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Slab Label</label>
                <input
                  type="text"
                  placeholder="e.g. Above 5 to 10 km"
                  value={newSlabLabel}
                  onChange={(e) => setNewSlabLabel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">From Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newSlabFrom}
                    onChange={(e) => setNewSlabFrom(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">To Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={newSlabTo}
                    onChange={(e) => setNewSlabTo(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pricing Model</label>
                  <select
                    value={newSlabType}
                    onChange={(e) => setNewSlabType(e.target.value as 'flat' | 'per_km')}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  >
                    <option value="flat">Flat Minimum Price (₹)</option>
                    <option value="per_km">Per Kilometer Rate (₹/km)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Rate ({newSlabType === 'flat' ? '₹ Flat' : '₹/km'})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newSlabRate}
                    onChange={(e) => setNewSlabRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-extrabold text-emerald-600 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowAddSlabModal(false)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetConfig = customerSlabConfigs.find((c) => c.customerType === selectedSlabCustType);
                  if (targetConfig) {
                    const newSlab: DistanceSlab = {
                      id: `slab_${Date.now()}`,
                      fromKm: newSlabFrom,
                      toKm: newSlabTo,
                      rate: newSlabRate,
                      rateType: newSlabType,
                      label: newSlabLabel || `${newSlabFrom}-${newSlabTo} km`,
                    };
                    const updatedSlabs = [...targetConfig.slabs, newSlab].sort((a, b) => a.fromKm - b.fromKm);
                    updateCustomerSlabConfig({ ...targetConfig, slabs: updatedSlabs });
                  }
                  setShowAddSlabModal(false);
                  setNewSlabLabel('');
                }}
                className="flex-1 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
              >
                Append Slab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DRIVER NEGATIVE LIMIT ================= */}
      {editingDriverLimit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Adjust Overdraft Limit</h3>
                <p className="text-xs text-slate-500">{editingDriverLimit.driverName} ({editingDriverLimit.driverId})</p>
              </div>
              <button
                onClick={() => setEditingDriverLimit(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Set the maximum negative wallet balance allowed for this driver. When balance drops below this threshold, the driver is restricted from receiving cash trips.
              </p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Negative Balance Limit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-rose-500">-₹</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newLimitInput}
                    onChange={(e) => setNewLimitInput(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-base text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Allowed range: ₹0 (No credit) to ₹10,000</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingDriverLimit(null)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDriverNegativeLimit(editingDriverLimit.driverId, newLimitInput);
                  setEditingDriverLimit(null);
                }}
                className="flex-1 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
              >
                Update Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOP-UP DRIVER WALLET ================= */}
      {topupTargetDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manual Driver Wallet Credit</h3>
                <p className="text-xs text-slate-500">{topupTargetDriver.driverName}</p>
              </div>
              <button
                onClick={() => setTopupTargetDriver(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Credit Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-emerald-600">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={driverTopupAmount}
                    onChange={(e) => setDriverTopupAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-base text-emerald-700"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {[200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDriverTopupAmount(amt)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setTopupTargetDriver(null)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  topUpDriverWallet(topupTargetDriver.driverId, driverTopupAmount, 'Admin credit settlement');
                  setTopupTargetDriver(null);
                }}
                className="flex-1 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
              >
                Credit ₹{driverTopupAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOP-UP CUSTOMER WALLET ================= */}
      {showCustomerTopupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Add Customer Wallet Credit</h3>
                <p className="text-xs text-slate-500">{currentCustomer.name} ({currentCustomer.phone})</p>
              </div>
              <button
                onClick={() => setShowCustomerTopupModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Credit Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-blue-600">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={customerTopupAmount}
                    onChange={(e) => setCustomerTopupAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-base text-blue-700"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomerTopupAmount(amt)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowCustomerTopupModal(false)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  topUpCustomerWallet(customerTopupAmount, 'Admin top-up / promotional balance');
                  setShowCustomerTopupModal(false);
                }}
                className="flex-1 py-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200"
              >
                Credit ₹{customerTopupAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSACTION LEDGER ================= */}
      {inspectingTransactions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{inspectingTransactions.title}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-slate-500">
                    Current Balance:{' '}
                    <span className={`font-extrabold ${inspectingTransactions.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{inspectingTransactions.balance.toLocaleString('en-IN')}
                    </span>
                  </span>
                  {inspectingTransactions.negativeLimit !== undefined && (
                    <span className="text-xs text-slate-400">
                      Limit: -₹{inspectingTransactions.negativeLimit.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setInspectingTransactions(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {inspectingTransactions.transactions && inspectingTransactions.transactions.length > 0 ? (
                inspectingTransactions.transactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • Ref: {tx.referenceId || tx.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Bal: ₹{tx.balanceAfter.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No transaction history recorded yet.
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => setInspectingTransactions(null)}
                className="w-full py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
