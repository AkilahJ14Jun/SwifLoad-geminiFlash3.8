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
} from 'lucide-react';
import { useLogistics } from '@/context/LogisticsContext';
import { AdminRole, VehicleCategory, TripStatus, VehicleConfig, ServiceZone } from '@/types/logistics';

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
  } = useLogistics();

  // Admin Navigation Tab: 'dashboard' | 'live-board' | 'fleet-map' | 'drivers-kyc' | 'pricing-zones' | 'finance' | 'audit'
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'live-board' | 'fleet-map' | 'drivers-kyc' | 'pricing-zones' | 'finance' | 'audit'
  >('dashboard');

  // Filters for Live Board
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected trip for details modal
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [reassignDriverId, setReassignDriverId] = useState<string>('');

  // Edit Pricing / Zone Modal
  const [editingVehicle, setEditingVehicle] = useState<VehicleConfig | null>(null);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);

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
                Bengaluru Central Hub
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
          { id: 'pricing-zones', label: 'Pricing & Geofences', icon: Settings },
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
                  <p className="text-xs text-slate-500">Live operational dispatch status across Bangalore city</p>
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
                <h3 className="font-bold text-sm text-slate-900">Live Bangalore Fleet Telematics</h3>
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

        {/* ================= 5. PRICING CONFIGURATION & GEOFENCES ================= */}
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
                  <h3 className="font-bold text-sm text-slate-900">Bengaluru Serviceability Zones & Surge</h3>
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
    </div>
  );
}
