'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Trip,
  DriverPartner,
  VehicleConfig,
  ServiceZone,
  UserRole,
  AdminRole,
  TripStatus,
  VehicleCategory,
  LocationPoint,
  PaymentMethod,
  ShipmentDetails,
  CustomerUser,
  RegisterDriverPayload,
  DriverGroup,
  CustomerType,
  CustomerTypeSlabConfig,
  ReferralProgramConfig,
  ReferralRecord,
  WalletTransaction,
  IncentiveSlab,
  TripStop,
  DriverNotification,
  DriverCancellationReason,
  DriverCancellationLockout,
  DriverCancellationSlabConfig,
} from '@/types/logistics';
import {
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  SERVICE_ZONES,
  VEHICLE_CONFIGS,
  COIMBATORE_LANDMARKS,
  DRIVER_GROUPS,
  DEFAULT_CUSTOMER_SLABS,
  DEFAULT_REFERRAL_CONFIG,
  INITIAL_REFERRALS,
  DEFAULT_INCENTIVE_SLABS,
  DEFAULT_DISPATCH_TIMEOUT_SECS,
  INITIAL_DRIVER_NOTIFICATIONS,
  DEFAULT_DRIVER_CANCELLATION_SLABS,
} from '@/lib/data';
import {
  calculateDistanceKm,
  calculateMultiStopDistanceKm,
  calculateFare,
  calculateCancellationFee,
  estimateDurationMins,
  calculateCustomerQuotedSlabFare,
  calculateDriverTaskPayout,
} from '@/lib/pricing';

interface CreateTripPayload {
  pickup: LocationPoint;
  drop: LocationPoint;
  pickups?: LocationPoint[];
  drops?: LocationPoint[];
  stopType?: 'single' | 'multi_pickup' | 'multi_drop';
  vehicleCategory: VehicleCategory;
  goodsCategory: any;
  approxWeightKg: number;
  packageCount?: number;
  hasHelperRequired: boolean;
  notes?: string;
  cargoPhotoUrl?: string;
  paymentMethod: PaymentMethod;
  scheduledTime?: string;
  customerName: string;
  customerPhone: string;
  customerType?: CustomerType;
}

interface LogisticsContextType {
  // State
  role: UserRole;
  setRole: (role: UserRole) => void;
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  activeTripId: string | null;
  setActiveTripId: (id: string | null) => void;
  trips: Trip[];
  drivers: DriverPartner[];
  driverGroups: DriverGroup[];
  vehicleConfigs: VehicleConfig[];
  serviceZones: ServiceZone[];
  landmarks: LocationPoint[];
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Slab Distance Pricing
  customerSlabConfigs: CustomerTypeSlabConfig[];
  updateCustomerSlabConfig: (config: CustomerTypeSlabConfig) => void;

  // Driver Incentives & Dispatch Timeout (Changes Required Items 14 & 16)
  incentiveSlabs: IncentiveSlab[];
  updateIncentiveSlabs: (slabs: IncentiveSlab[]) => void;
  dispatchTimeoutSecs: number;
  updateDispatchTimeoutSecs: (secs: number) => void;

  // Referral Programs
  referralConfig: ReferralProgramConfig;
  updateReferralConfig: (config: ReferralProgramConfig) => void;
  referrals: ReferralRecord[];
  submitReferral: (
    type: 'DRIVER_TO_DRIVER' | 'DRIVER_TO_CUSTOMER' | 'CUSTOMER_TO_CUSTOMER',
    referrerId: string,
    refereeName: string,
    refereePhone: string
  ) => boolean;
  claimReferralBonus: (referralId: string) => void;
  applyCustomerReferralCode: (code: string) => { success: boolean; message: string };

  // Wallet Management
  topUpCustomerWallet: (amount: number, note?: string) => void;
  topUpDriverWallet: (driverId: string, amount: number, note?: string) => void;
  updateDriverNegativeLimit: (driverId: string, limit: number) => void;
  adjustWalletBalance: (entityType: 'customer' | 'driver', id: string, amount: number, note: string) => void;

  // Driver Notifications
  driverNotifications: DriverNotification[];
  addDriverNotification: (notification: Omit<DriverNotification, 'id' | 'timestamp' | 'read'>) => void;
  markDriverNotificationRead: (id: string) => void;
  clearDriverNotifications: (driverId?: string) => void;

  // Customer Auth
  currentCustomer: CustomerUser;
  registerCustomer: (data: { name: string; phone: string; email: string; companyName?: string; customerType?: CustomerType; referralCodeApplied?: string }) => void;
  loginCustomer: (phone: string, otp: string) => boolean;
  logoutCustomer: () => void;
  updateCustomerType: (type: CustomerType) => void;

  // Driver Auth
  registerDriver: (payload: RegisterDriverPayload) => string;
  loginDriver: (phone: string, otp: string) => boolean;
  logoutDriver: () => void;

  // Actions
  createBooking: (payload: CreateTripPayload) => string;
  acceptTripByDriver: (tripId: string, driverId: string) => { success: boolean; message: string };
  passTripToNextGroup: (tripId: string) => void;
  cancelTrip: (tripId: string, reason: string) => void;
  assignDriver: (tripId: string, driverId: string) => void;
  advanceTripStatus: (tripId: string, otpProvided?: string, photoProof?: string) => { success: boolean; message: string };
  startTripStop: (tripId: string, stopId: string) => { success: boolean; message: string };
  completeTripStop: (tripId: string, stopId: string, otpProvided?: string) => { success: boolean; message: string; nextStop?: TripStop; isCompleted?: boolean };
  submitRating: (tripId: string, rating: number, feedback: string) => void;
  toggleDriverOnline: (driverId: string) => void;
  approveDriverKyc: (driverId: string) => void;
  rejectDriverKyc: (driverId: string, reason: string) => void;
  requestDriverPayout: (driverId: string, amount: number) => boolean;
  updateVehicleConfig: (config: VehicleConfig) => void;
  updateServiceZone: (zone: ServiceZone) => void;
  addAdminNote: (tripId: string, note: string) => void;
  exportCsvData: (type: 'trips' | 'drivers' | 'finance' | 'referrals' | 'wallets') => void;
  resetToDemoData: () => void;

  // Driver Cancellation Penalties & Hour Slabs
  cancellationSlabConfigs: DriverCancellationSlabConfig[];
  updateCancellationSlabConfig: (reason: DriverCancellationReason, hours: number) => void;
  resetCancellationSlabsToDefault: () => void;
  driverLockouts: DriverCancellationLockout[];
  cancelTripByDriver: (tripId: string, driverId: string, reason: DriverCancellationReason) => { success: boolean; lockoutHours: number; lockedUntil: string };
  waiveDriverLockout: (driverId: string) => void;
  isDriverInLockout: (driverId: string) => { isLocked: boolean; lockout?: DriverCancellationLockout; remainingMinutes: number; remainingHours: number; remainingSeconds: number };
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TRIPS = 'swifload_trips_v2_cbe';
const LOCAL_STORAGE_KEY_DRIVERS = 'swifload_drivers_v2_cbe';
const LOCAL_STORAGE_KEY_VEHICLES = 'swifload_vehicles_v2_cbe';
const LOCAL_STORAGE_KEY_ZONES = 'swifload_zones_v2_cbe';
const LOCAL_STORAGE_KEY_CUSTOMER = 'swifload_customer_v2_cbe';
const LOCAL_STORAGE_KEY_SLABS = 'swifload_slabs_v2_cbe';
const LOCAL_STORAGE_KEY_REFERRALS = 'swifload_referrals_v2_cbe';
const LOCAL_STORAGE_KEY_REF_CONFIG = 'swifload_ref_config_v2_cbe';
const LOCAL_STORAGE_KEY_INCENTIVE_SLABS = 'swifload_incentive_slabs_v2_cbe';
const LOCAL_STORAGE_KEY_DISPATCH_TIMEOUT = 'swifload_dispatch_timeout_v2_cbe';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'swifload_driver_notifs_v2_cbe';
const LOCAL_STORAGE_KEY_CANCELLATION_SLABS = 'swifload_driver_cancel_slabs_v2_cbe';
const LOCAL_STORAGE_KEY_DRIVER_LOCKOUTS = 'swifload_driver_lockouts_v2_cbe';

const INITIAL_CUSTOMER: CustomerUser = {
  id: 'cust_01',
  name: 'Kavitha Sundaram',
  phone: '+91 98422 19283',
  email: 'kavitha.sundaram@example.com',
  companyName: 'Sundaram Engineering & Spares',
  customerType: 'regular',
  referralCode: 'SWIF-KAVITHA-20',
  isLoggedIn: true,
  wallet: {
    balance: 1250,
    transactions: [
      {
        id: 'tx_c_01',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        type: 'CREDIT',
        amount: 1000,
        balanceAfter: 1000,
        description: 'UPI Wallet Recharge via GPay',
        category: 'TOPUP',
      },
      {
        id: 'tx_c_02',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        type: 'CREDIT',
        amount: 250,
        balanceAfter: 1250,
        description: 'Referral Bonus: Friend Rajan Textiles joined',
        category: 'REFERRAL_BONUS',
      },
    ],
  },
};

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [adminRole, setAdminRole] = useState<AdminRole>('super_admin');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv_01');
  const [activeTripId, setActiveTripId] = useState<string | null>('trip_cbe_1001');

  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser>(INITIAL_CUSTOMER);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [drivers, setDrivers] = useState<DriverPartner[]>(INITIAL_DRIVERS);
  const [vehicleConfigs, setVehicleConfigs] = useState<VehicleConfig[]>(VEHICLE_CONFIGS);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>(SERVICE_ZONES);
  const [driverGroups] = useState<DriverGroup[]>(DRIVER_GROUPS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Slabs, Referrals & Configs
  const [customerSlabConfigs, setCustomerSlabConfigs] = useState<CustomerTypeSlabConfig[]>(DEFAULT_CUSTOMER_SLABS);
  const [referralConfig, setReferralConfig] = useState<ReferralProgramConfig>(DEFAULT_REFERRAL_CONFIG);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(INITIAL_REFERRALS);
  const [incentiveSlabs, setIncentiveSlabs] = useState<IncentiveSlab[]>(DEFAULT_INCENTIVE_SLABS);
  const [dispatchTimeoutSecs, setDispatchTimeoutSecs] = useState<number>(DEFAULT_DISPATCH_TIMEOUT_SECS);
  const [driverNotifications, setDriverNotifications] = useState<DriverNotification[]>(INITIAL_DRIVER_NOTIFICATIONS);
  const [cancellationSlabConfigs, setCancellationSlabConfigs] = useState<DriverCancellationSlabConfig[]>(DEFAULT_DRIVER_CANCELLATION_SLABS);
  const [driverLockouts, setDriverLockouts] = useState<DriverCancellationLockout[]>([]);

  // Helpers for server DB synchronization
  const syncTripToServer = useCallback(async (trip: Trip) => {
    try {
      await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
    } catch {}
  }, []);

  const updateTripOnServer = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    try {
      await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  }, []);

  const updateDriverOnServer = useCallback(async (driverId: string, updates: Partial<DriverPartner>) => {
    try {
      await fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  }, []);

  const syncWalletToServer = useCallback(async (payload: any) => {
    try {
      await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  }, []);

  // Load from central cloud DB and fallback to localStorage
  useEffect(() => {
    // 1. Initial fast load from localStorage cache
    try {
      const savedCustomer = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMER);
      if (savedCustomer) setCurrentCustomer(JSON.parse(savedCustomer));

      const savedTrips = localStorage.getItem(LOCAL_STORAGE_KEY_TRIPS);
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
      if (savedDrivers) setDrivers(JSON.parse(savedDrivers));

      const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
      if (savedVehicles) setVehicleConfigs(JSON.parse(savedVehicles));

      const savedZones = localStorage.getItem(LOCAL_STORAGE_KEY_ZONES);
      if (savedZones) setServiceZones(JSON.parse(savedZones));

      const savedSlabs = localStorage.getItem(LOCAL_STORAGE_KEY_SLABS);
      if (savedSlabs) setCustomerSlabConfigs(JSON.parse(savedSlabs));

      const savedRefConfig = localStorage.getItem(LOCAL_STORAGE_KEY_REF_CONFIG);
      if (savedRefConfig) setReferralConfig(JSON.parse(savedRefConfig));

      const savedReferrals = localStorage.getItem(LOCAL_STORAGE_KEY_REFERRALS);
      if (savedReferrals) setReferrals(JSON.parse(savedReferrals));

      const savedIncentives = localStorage.getItem(LOCAL_STORAGE_KEY_INCENTIVE_SLABS);
      if (savedIncentives) setIncentiveSlabs(JSON.parse(savedIncentives));

      const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY_DISPATCH_TIMEOUT);
      if (savedTimeout) setDispatchTimeoutSecs(JSON.parse(savedTimeout));

      const savedNotifs = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
      if (savedNotifs) setDriverNotifications(JSON.parse(savedNotifs));

      const savedCancelSlabs = localStorage.getItem(LOCAL_STORAGE_KEY_CANCELLATION_SLABS);
      if (savedCancelSlabs) setCancellationSlabConfigs(JSON.parse(savedCancelSlabs));

      const savedLockouts = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVER_LOCKOUTS);
      if (savedLockouts) setDriverLockouts(JSON.parse(savedLockouts));
    } catch {
      // fallback
    }

    // 2. Fetch latest shared data from Cloud DB
    const fetchCloudState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.trips) setTrips(data.trips);
          if (data.drivers) setDrivers(data.drivers);
          if (data.customerSlabConfigs) setCustomerSlabConfigs(data.customerSlabConfigs);
          if (data.referralConfig) setReferralConfig(data.referralConfig);
          if (data.referrals) setReferrals(data.referrals);
          if (data.incentiveSlabs) setIncentiveSlabs(data.incentiveSlabs);
          if (data.dispatchTimeoutSecs) setDispatchTimeoutSecs(data.dispatchTimeoutSecs);
          if (data.customer) setCurrentCustomer(data.customer);
          if (data.vehicleConfigs) setVehicleConfigs(data.vehicleConfigs);
          if (data.serviceZones) setServiceZones(data.serviceZones);
        }
      } catch (err) {
        // network offline fallback
      }
    };
    fetchCloudState();

    // 3. Connect to Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TRIP_CREATED' && payload.data) {
            setTrips((prev) => {
              const exists = prev.some((t) => t.id === payload.data.id);
              if (exists) return prev.map((t) => (t.id === payload.data.id ? payload.data : t));
              return [payload.data, ...prev];
            });
          } else if (payload.type === 'TRIP_UPDATED' && payload.data) {
            setTrips((prev) => prev.map((t) => (t.id === payload.data.id ? payload.data : t)));
          } else if (payload.type === 'DRIVER_UPDATED' && payload.data) {
            setDrivers((prev) => prev.map((d) => (d.id === payload.data.id ? { ...d, ...payload.data } : d)));
          } else if (payload.type === 'WALLET_UPDATED' && payload.data) {
            if (payload.data.entityType === 'customer' && payload.data.wallet) {
              setCurrentCustomer((prev) => ({ ...prev, wallet: payload.data.wallet }));
            } else if (payload.data.entityType === 'driver') {
              setDrivers((prev) =>
                prev.map((d) =>
                  d.id === payload.data.id
                    ? {
                        ...d,
                        walletBalance: payload.data.walletBalance,
                        wallet: payload.data.driver?.wallet || d.wallet,
                      }
                    : d
                )
              );
            }
          } else if (payload.type === 'CONFIG_UPDATED' && payload.data) {
            if (payload.data.type === 'slabs' && payload.data.slabs) {
              setCustomerSlabConfigs(payload.data.slabs);
            } else if (payload.data.type === 'incentiveSlabs' && payload.data.incentiveSlabs) {
              setIncentiveSlabs(payload.data.incentiveSlabs);
            } else if (payload.data.type === 'dispatchSettings' && payload.data.dispatchTimeoutSecs) {
              setDispatchTimeoutSecs(payload.data.dispatchTimeoutSecs);
            }
          } else if (payload.type === 'STATE_SYNC' || payload.type === 'SYSTEM_RESET') {
            if (payload.data) {
              if (payload.data.trips) setTrips(payload.data.trips);
              if (payload.data.drivers) setDrivers(payload.data.drivers);
              if (payload.data.customerSlabConfigs) setCustomerSlabConfigs(payload.data.customerSlabConfigs);
              if (payload.data.referralConfig) setReferralConfig(payload.data.referralConfig);
              if (payload.data.referrals) setReferrals(payload.data.referrals);
              if (payload.data.incentiveSlabs) setIncentiveSlabs(payload.data.incentiveSlabs);
              if (payload.data.dispatchTimeoutSecs) setDispatchTimeoutSecs(payload.data.dispatchTimeoutSecs);
              if (payload.data.customer) setCurrentCustomer(payload.data.customer);
            }
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch {}

    const interval = setInterval(fetchCloudState, 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TRIPS, JSON.stringify(trips));
    } catch {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
    } catch {}
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SLABS, JSON.stringify(customerSlabConfigs));
    } catch {}
  }, [customerSlabConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(vehicleConfigs));
    } catch {}
  }, [vehicleConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ZONES, JSON.stringify(serviceZones));
    } catch {}
  }, [serviceZones]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMER, JSON.stringify(currentCustomer));
    } catch {}
  }, [currentCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(driverNotifications));
    } catch {}
  }, [driverNotifications]);

  const addDriverNotification = useCallback(
    (notif: Omit<DriverNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: DriverNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setDriverNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markDriverNotificationRead = useCallback((id: string) => {
    setDriverNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearDriverNotifications = useCallback((driverId?: string) => {
    setDriverNotifications((prev) =>
      driverId ? prev.filter((n) => n.driverId !== driverId) : []
    );
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Customer Slab Config Update
  const updateCustomerSlabConfig = useCallback(
    (newConfig: CustomerTypeSlabConfig) => {
      setCustomerSlabConfigs((prev) =>
        prev.map((c) => (c.customerType === newConfig.customerType ? newConfig : c))
      );
      showToast(`Slab pricing matrix updated for ${newConfig.customerTypeName}`);
    },
    [showToast]
  );

  // Driver Incentive Slabs Update (Changes Required Item 14)
  const updateIncentiveSlabs = useCallback(
    async (newSlabs: IncentiveSlab[]) => {
      setIncentiveSlabs(newSlabs);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_INCENTIVE_SLABS, JSON.stringify(newSlabs));
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'incentiveSlabs', incentiveSlabs: newSlabs }),
        });
      } catch {}
      showToast('Driver incentive milestones updated successfully');
    },
    [showToast]
  );

  // Pickup Call Timeframe / Dispatch Timeout Update (Changes Required Item 16)
  const updateDispatchTimeoutSecs = useCallback(
    async (secs: number) => {
      const validSecs = Math.max(3, Math.min(60, Number(secs) || 10));
      setDispatchTimeoutSecs(validSecs);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_DISPATCH_TIMEOUT, JSON.stringify(validSecs));
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'dispatchSettings', dispatchTimeoutSecs: validSecs }),
        });
      } catch {}
      showToast(`Driver pickup call timeframe set to ${validSecs} seconds`);
    },
    [showToast]
  );

  // Referral Program Config Update
  const updateReferralConfig = useCallback(
    (newConfig: ReferralProgramConfig) => {
      setReferralConfig(newConfig);
      showToast('Referral program bonus settings updated');
    },
    [showToast]
  );

  // Submit Referral Invitation
  const submitReferral = useCallback(
    (
      type: 'DRIVER_TO_DRIVER' | 'DRIVER_TO_CUSTOMER' | 'CUSTOMER_TO_CUSTOMER',
      referrerId: string,
      refereeName: string,
      refereePhone: string
    ): boolean => {
      let bonusAmount = 0;
      let referrerName = '';
      let referrerRole: 'driver' | 'customer' = 'customer';

      if (type === 'DRIVER_TO_DRIVER') {
        const drv = drivers.find((d) => d.id === referrerId);
        referrerName = drv?.name || 'Driver Partner';
        referrerRole = 'driver';
        bonusAmount = referralConfig.driverToDriverBonus;
      } else if (type === 'DRIVER_TO_CUSTOMER') {
        const drv = drivers.find((d) => d.id === referrerId);
        referrerName = drv?.name || 'Driver Partner';
        referrerRole = 'driver';
        bonusAmount = referralConfig.driverToCustomerBonus;
      } else {
        referrerName = currentCustomer.name;
        referrerRole = 'customer';
        bonusAmount = referralConfig.customerToCustomerReferrerBonus;
      }

      const newRecord: ReferralRecord = {
        id: `ref_${Date.now()}`,
        type,
        referrerId,
        referrerName,
        referrerRole,
        refereeId: `referee_${Date.now()}`,
        refereeName,
        refereePhone,
        refereeRole: type === 'DRIVER_TO_DRIVER' ? 'driver' : 'customer',
        bonusAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        notes: `Referral invite dispatched to ${refereeName} (${refereePhone})`,
      };

      setReferrals((prev) => [newRecord, ...prev]);
      showToast(`Referral invite created for ${refereeName}! Reward: ₹${bonusAmount}`);
      return true;
    },
    [drivers, currentCustomer, referralConfig, showToast]
  );

  // Claim / Credit Referral Bonus
  const claimReferralBonus = useCallback(
    (referralId: string) => {
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id === referralId && r.status === 'PENDING') {
            const creditedAt = new Date().toISOString();
            if (r.referrerRole === 'driver') {
              setDrivers((dList) =>
                dList.map((d) => {
                  if (d.id === r.referrerId) {
                    const newBal = d.wallet.balance + r.bonusAmount;
                    const tx: WalletTransaction = {
                      id: `tx_d_${Date.now()}`,
                      timestamp: creditedAt,
                      type: 'CREDIT',
                      amount: r.bonusAmount,
                      balanceAfter: newBal,
                      description: `Referral Bonus: Invited ${r.refereeName}`,
                      category: 'REFERRAL_BONUS',
                      referenceId: r.id,
                    };
                    return {
                      ...d,
                      wallet: {
                        ...d.wallet,
                        balance: newBal,
                        transactions: [tx, ...(d.wallet.transactions || [])],
                      },
                    };
                  }
                  return d;
                })
              );
            } else {
              setCurrentCustomer((c) => {
                const newBal = c.wallet.balance + r.bonusAmount;
                const tx: WalletTransaction = {
                  id: `tx_c_${Date.now()}`,
                  timestamp: creditedAt,
                  type: 'CREDIT',
                  amount: r.bonusAmount,
                  balanceAfter: newBal,
                  description: `Referral Bonus: Invited ${r.refereeName}`,
                  category: 'REFERRAL_BONUS',
                  referenceId: r.id,
                };
                return {
                  ...c,
                  wallet: {
                    balance: newBal,
                    transactions: [tx, ...(c.wallet.transactions || [])],
                  },
                };
              });
            }

            showToast(`Referral bonus of ₹${r.bonusAmount} credited to ${r.referrerName}!`);
            return {
              ...r,
              status: 'CREDITED' as const,
              creditedAt,
            };
          }
          return r;
        })
      );
    },
    [showToast]
  );

  // Apply Customer Referral Code
  const applyCustomerReferralCode = useCallback(
    (code: string): { success: boolean; message: string } => {
      const cleanCode = code.trim().toUpperCase();
      const drv = drivers.find((d) => d.referralCode?.toUpperCase() === cleanCode);
      if (drv) {
        const welcomeCredit = referralConfig.customerToCustomerRefereeBonus;
        const driverBonus = referralConfig.driverToCustomerBonus;

        setCurrentCustomer((prev) => {
          const newBal = prev.wallet.balance + welcomeCredit;
          const tx: WalletTransaction = {
            id: `tx_c_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'CREDIT',
            amount: welcomeCredit,
            balanceAfter: newBal,
            description: `Welcome Bonus from Driver ${drv.name} Referral`,
            category: 'REFERRAL_BONUS',
          };
          return {
            ...prev,
            referredBy: drv.name,
            wallet: {
              balance: newBal,
              transactions: [tx, ...(prev.wallet.transactions || [])],
            },
          };
        });

        setDrivers((dList) =>
          dList.map((d) => {
            if (d.id === drv.id) {
              const newBal = d.wallet.balance + driverBonus;
              const tx: WalletTransaction = {
                id: `tx_d_${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'CREDIT',
                amount: driverBonus,
                balanceAfter: newBal,
                description: `Referral Bonus: New customer ${currentCustomer.name} joined via your code`,
                category: 'REFERRAL_BONUS',
              };
              return {
                ...d,
                wallet: {
                  ...d.wallet,
                  balance: newBal,
                  transactions: [tx, ...(d.wallet.transactions || [])],
                },
              };
            }
            return d;
          })
        );

        const rec: ReferralRecord = {
          id: `ref_${Date.now()}`,
          type: 'DRIVER_TO_CUSTOMER',
          referrerId: drv.id,
          referrerName: drv.name,
          referrerRole: 'driver',
          refereeId: currentCustomer.id,
          refereeName: currentCustomer.name,
          refereeRole: 'customer',
          bonusAmount: driverBonus,
          status: 'CREDITED',
          createdAt: new Date().toISOString(),
          creditedAt: new Date().toISOString(),
          notes: `Referral code ${cleanCode} applied. Customer received ₹${welcomeCredit}, driver earned ₹${driverBonus}.`,
        };
        setReferrals((prev) => [rec, ...prev]);

        showToast(`Referral code applied! Added ₹${welcomeCredit} welcome bonus to your wallet.`);
        return { success: true, message: `Code valid! ₹${welcomeCredit} credited to wallet.` };
      }

      if (cleanCode.startsWith('SWIF-') || cleanCode.includes('CUST')) {
        const welcomeCredit = referralConfig.customerToCustomerRefereeBonus;
        setCurrentCustomer((prev) => {
          const newBal = prev.wallet.balance + welcomeCredit;
          const tx: WalletTransaction = {
            id: `tx_c_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'CREDIT',
            amount: welcomeCredit,
            balanceAfter: newBal,
            description: `Welcome Credit via referral ${cleanCode}`,
            category: 'REFERRAL_BONUS',
          };
          return {
            ...prev,
            referredBy: cleanCode,
            wallet: {
              balance: newBal,
              transactions: [tx, ...(prev.wallet.transactions || [])],
            },
          };
        });

        const rec: ReferralRecord = {
          id: `ref_${Date.now()}`,
          type: 'CUSTOMER_TO_CUSTOMER',
          referrerId: 'cust_referrer',
          referrerName: 'Referring Customer',
          referrerRole: 'customer',
          refereeId: currentCustomer.id,
          refereeName: currentCustomer.name,
          refereeRole: 'customer',
          bonusAmount: referralConfig.customerToCustomerReferrerBonus,
          status: 'CREDITED',
          createdAt: new Date().toISOString(),
          creditedAt: new Date().toISOString(),
          notes: `Customer referral code ${cleanCode} applied.`,
        };
        setReferrals((prev) => [rec, ...prev]);

        showToast(`Referral code applied! Added ₹${welcomeCredit} credit to your wallet.`);
        return { success: true, message: `Code valid! ₹${welcomeCredit} credited.` };
      }

      showToast('Invalid referral code');
      return { success: false, message: 'Invalid or expired referral code' };
    },
    [drivers, currentCustomer, referralConfig, showToast]
  );

  // Top up customer wallet (Negative balance NOT allowed for customer)
  const topUpCustomerWallet = useCallback(
    (amount: number, note?: string) => {
      if (amount <= 0) return;
      const newBal = Math.round((currentCustomer.wallet.balance + amount) * 10) / 10;
      const tx: WalletTransaction = {
        id: `tx_c_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'CREDIT',
        amount,
        balanceAfter: newBal,
        description: note || 'UPI / NetBanking Wallet Top-up',
        category: 'TOPUP',
      };
      setCurrentCustomer((prev) => ({
        ...prev,
        wallet: {
          balance: newBal,
          transactions: [tx, ...(prev.wallet.transactions || [])],
        },
      }));
      syncWalletToServer({
        entityType: 'customer',
        id: currentCustomer.id,
        amount,
        description: note || 'UPI / NetBanking Wallet Top-up',
      });
      showToast(`Added ₹${amount} to your SwifLoad Wallet! New Balance: ₹${newBal}`);
    },
    [currentCustomer, syncWalletToServer, showToast]
  );

  // Top up / recharge driver wallet (Changes Required Items 9 & 11)
  const topUpDriverWallet = useCallback(
    (driverId: string, amount: number, note?: string) => {
      if (amount <= 0) return;
      let effectiveNewBal = 0;
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            // Negative balance calculation: e.g. -200 + 300 = +100
            // Balance can go up to a max of Rs.200
            const calculatedBal = d.wallet.balance + amount;
            const newBal = Math.min(200, Math.round(calculatedBal * 10) / 10);
            effectiveNewBal = newBal;
            const tx: WalletTransaction = {
              id: `tx_d_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'CREDIT',
              amount,
              balanceAfter: newBal,
              description: note || 'Driver Dues Clearance / Wallet Recharge via UPI',
              category: 'TOPUP',
            };
            return {
              ...d,
              wallet: {
                ...d.wallet,
                balance: newBal,
                transactions: [tx, ...(d.wallet.transactions || [])],
              },
            };
          }
          return d;
        })
      );
      syncWalletToServer({
        entityType: 'driver',
        id: driverId,
        amount,
        description: note || 'Driver Dues Clearance / Wallet Recharge via UPI',
      });
      showToast(`Driver wallet recharged with ₹${amount}. Current Balance: ₹${effectiveNewBal}`);
    },
    [syncWalletToServer, showToast]
  );

  // Update Driver Negative Balance Limit (Configurable per driver in Admin Portal)
  const updateDriverNegativeLimit = useCallback(
    (driverId: string, limit: number) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            return {
              ...d,
              wallet: {
                ...d.wallet,
                negativeBalanceLimit: limit,
              },
            };
          }
          return d;
        })
      );
      showToast(`Driver negative balance limit updated to -₹${limit}`);
    },
    [showToast]
  );

  // Adjust Wallet Balance (Admin Adjustment)
  const adjustWalletBalance = useCallback(
    (entityType: 'customer' | 'driver', id: string, amount: number, note: string) => {
      if (entityType === 'customer') {
        const newBal = Math.max(0, Math.round((currentCustomer.wallet.balance + amount) * 10) / 10);
        const tx: WalletTransaction = {
          id: `tx_c_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: amount >= 0 ? 'CREDIT' : 'DEBIT',
          amount: Math.abs(amount),
          balanceAfter: newBal,
          description: `Admin Adjustment: ${note}`,
          category: 'ADMIN_ADJUSTMENT',
        };
        setCurrentCustomer((prev) => ({
          ...prev,
          wallet: {
            balance: newBal,
            transactions: [tx, ...(prev.wallet.transactions || [])],
          },
        }));
        syncWalletToServer({ entityType: 'customer', id, amount, description: note });
        showToast(`Customer wallet adjusted by ₹${amount}. New balance: ₹${newBal}`);
      } else {
        setDrivers((prev) =>
          prev.map((d) => {
            if (d.id === id) {
              const newBal = Math.round((d.wallet.balance + amount) * 10) / 10;
              const tx: WalletTransaction = {
                id: `tx_d_${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: amount >= 0 ? 'CREDIT' : 'DEBIT',
                amount: Math.abs(amount),
                balanceAfter: newBal,
                description: `Admin Adjustment: ${note}`,
                category: 'ADMIN_ADJUSTMENT',
              };
              return {
                ...d,
                wallet: {
                  ...d.wallet,
                  balance: newBal,
                  transactions: [tx, ...(d.wallet.transactions || [])],
                },
              };
            }
            return d;
          })
        );
        syncWalletToServer({ entityType: 'driver', id, amount, description: note });
        showToast(`Driver wallet adjusted by ₹${amount}`);
      }
    },
    [currentCustomer, syncWalletToServer, showToast]
  );

  // Customer Registration & Auth
  const registerCustomer = useCallback(
    (data: {
      name: string;
      phone: string;
      email: string;
      companyName?: string;
      customerType?: CustomerType;
      referralCodeApplied?: string;
    }) => {
      const code = `SWIF-${data.name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
      const welcomeCredit = data.referralCodeApplied ? referralConfig.customerToCustomerRefereeBonus : 0;
      const initialTransactions: WalletTransaction[] = welcomeCredit > 0
        ? [
            {
              id: `tx_c_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'CREDIT',
              amount: welcomeCredit,
              balanceAfter: welcomeCredit,
              description: `Referral Welcome Bonus (${data.referralCodeApplied})`,
              category: 'REFERRAL_BONUS',
            },
          ]
        : [];

      const newCust: CustomerUser = {
        id: `cust_${Date.now()}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        companyName: data.companyName,
        customerType: data.customerType || 'regular',
        referralCode: code,
        referredBy: data.referralCodeApplied,
        isLoggedIn: true,
        wallet: {
          balance: welcomeCredit,
          transactions: initialTransactions,
        },
      };
      setCurrentCustomer(newCust);
      showToast(`Welcome ${data.name}! Registered with SwifLoad Wallet (₹${welcomeCredit} balance).`);
    },
    [referralConfig, showToast]
  );

  const loginCustomer = useCallback(
    (phone: string, otp: string): boolean => {
      if (otp.length === 4) {
        setCurrentCustomer((prev) => ({
          ...prev,
          phone,
          isLoggedIn: true,
        }));
        showToast('Customer logged in successfully!');
        return true;
      }
      showToast('Invalid 4-digit OTP. Please enter 4 digits.');
      return false;
    },
    [showToast]
  );

  const logoutCustomer = useCallback(() => {
    setCurrentCustomer((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    showToast('Customer logged out');
  }, [showToast]);

  const updateCustomerType = useCallback(
    (type: CustomerType) => {
      setCurrentCustomer((prev) => ({
        ...prev,
        customerType: type,
      }));
      showToast(`Switched customer tier to: ${type.replace(/_/g, ' ').toUpperCase()}`);
    },
    [showToast]
  );

  // Driver Registration & Auth
  const registerDriver = useCallback(
    (payload: RegisterDriverPayload): string => {
      const driverId = `drv_${Date.now()}`;
      const driverRefCode = `DRV-${payload.name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      const newDriver: DriverPartner = {
        id: driverId,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        groupId: 'grp_cbe_central',
        groupName: 'Group Central (Gandhipuram & RS Puram)',
        locationRange: 'Gandhipuram, RS Puram & Town Hall (Radius 5km)',
        vehicleCategory: payload.vehicleCategory,
        vehicleModel: payload.vehicleModel,
        vehicleNumber: payload.vehicleNumber.toUpperCase(),
        isOnline: false,
        currentStatus: 'OFFLINE',
        currentLocation: { lat: 11.0168, lng: 76.9558 },
        rating: 5.0,
        totalTrips: 0,
        acceptanceRate: 100,
        kycStatus: 'PENDING',
        kycDocuments: [
          {
            docType: 'DRIVING_LICENSE',
            docNumber: payload.licenseNumber,
            fileUrl: `https://placehold.co/600x400/1e293b/ffffff?text=Commercial+DL+${encodeURIComponent(payload.licenseNumber)}`,
            verified: false,
          },
          {
            docType: 'RC_BOOK',
            docNumber: payload.rcNumber,
            fileUrl: `https://placehold.co/600x400/1e293b/ffffff?text=Vehicle+RC+${encodeURIComponent(payload.rcNumber)}`,
            verified: false,
          },
          {
            docType: 'VEHICLE_INSURANCE',
            docNumber: payload.insuranceNumber,
            fileUrl: `https://placehold.co/600x400/1e293b/ffffff?text=Insurance+${encodeURIComponent(payload.insuranceNumber)}`,
            verified: false,
          },
          {
            docType: 'AADHAAR',
            docNumber: payload.aadhaarNumber,
            fileUrl: `https://placehold.co/600x400/1e293b/ffffff?text=Aadhaar+${encodeURIComponent(payload.aadhaarNumber)}`,
            verified: false,
          },
        ],
        bankDetails: {
          accountName: payload.accountName,
          accountNumber: payload.accountNumber,
          ifscCode: payload.ifscCode.toUpperCase(),
          upiId: payload.upiId,
        },
        referralCode: driverRefCode,
        wallet: {
          balance: 0,
          negativeBalanceLimit: 1500, // Pre-determined limit: allowed down to -₹1500
          todayEarnings: 0,
          pendingPayout: 0,
          transactions: [],
        },
      };

      // Handle driver referral bonus if referredByCode provided
      if (payload.referredByCode) {
        const cleanRef = payload.referredByCode.trim().toUpperCase();
        const referringDriver = drivers.find((d) => d.referralCode?.toUpperCase() === cleanRef);
        if (referringDriver) {
          const bonus = referralConfig.driverToDriverBonus;
          const rec: ReferralRecord = {
            id: `ref_${Date.now()}`,
            type: 'DRIVER_TO_DRIVER',
            referrerId: referringDriver.id,
            referrerName: referringDriver.name,
            referrerRole: 'driver',
            refereeId: driverId,
            refereeName: payload.name,
            refereePhone: payload.phone,
            refereeRole: 'driver',
            bonusAmount: bonus,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            notes: `Driver referral code ${cleanRef} applied. ₹${bonus} bonus pending verification.`,
          };
          setReferrals((prev) => [rec, ...prev]);
        }
      }

      setDrivers((prev) => [newDriver, ...prev]);
      setSelectedDriverId(driverId);
      showToast('Registration submitted! Account created under KYC verification.');
      return driverId;
    },
    [drivers, referralConfig, showToast]
  );

  const loginDriver = useCallback(
    (phone: string, otp: string): boolean => {
      const found = drivers.find((d) => d.phone.includes(phone.trim().slice(-10)));
      if (otp.length === 4) {
        if (found) {
          setSelectedDriverId(found.id);
          showToast(`Welcome back, ${found.name}!`);
          return true;
        }
        showToast('Driver account found and signed in with default test vehicle!');
        return true;
      }
      showToast('Invalid OTP. Enter 4-digit code.');
      return false;
    },
    [drivers, showToast]
  );

  const logoutDriver = useCallback(() => {
    // Set current driver offline
    setDrivers((prev) =>
      prev.map((d) => (d.id === selectedDriverId ? { ...d, isOnline: false, currentStatus: 'OFFLINE' } : d))
    );
    showToast('Driver signed out');
  }, [selectedDriverId, showToast]);

  // Live Simulated GPS Mover for active in-transit / arriving trips (Uber-like continuous movement)
  useEffect(() => {
    const timer = setInterval(() => {
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          // 1. Driver moving toward customer pickup (DRIVER_ASSIGNED or ARRIVING_PICKUP)
          if ((trip.status === 'DRIVER_ASSIGNED' || trip.status === 'ARRIVING_PICKUP') && trip.driverLocation) {
            const target = trip.pickup;
            const step = 0.00035; // smooth incremental motion (~40 meters per tick)
            const dLat = target.lat - trip.driverLocation.lat;
            const dLng = target.lng - trip.driverLocation.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);

            if (dist > 0.0005) {
              const newLat = trip.driverLocation.lat + (dLat / dist) * step;
              const newLng = trip.driverLocation.lng + (dLng / dist) * step;
              return {
                ...trip,
                status: 'ARRIVING_PICKUP',
                driverLocation: { lat: newLat, lng: newLng },
              };
            } else {
              // Reached pickup location!
              return {
                ...trip,
                status: 'AT_PICKUP',
                driverLocation: { lat: target.lat, lng: target.lng },
                auditHistory: [
                  ...trip.auditHistory,
                  {
                    timestamp: new Date().toISOString(),
                    event: `Driver ${trip.driverName || 'Partner'} arrived at pickup point`,
                    actor: 'Live GPS Geofence',
                  },
                ],
              };
            }
          }

          // 2. Driver moving toward drop destination (IN_TRANSIT)
          if (trip.status === 'IN_TRANSIT' && trip.driverLocation) {
            const target = trip.drop;
            const step = 0.00035;
            const dLat = target.lat - trip.driverLocation.lat;
            const dLng = target.lng - trip.driverLocation.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);

            if (dist > 0.0005) {
              const newLat = trip.driverLocation.lat + (dLat / dist) * step;
              const newLng = trip.driverLocation.lng + (dLng / dist) * step;
              return {
                ...trip,
                driverLocation: { lat: newLat, lng: newLng },
              };
            } else {
              // Reached drop destination!
              return {
                ...trip,
                status: 'ARRIVED_DESTINATION',
                driverLocation: { lat: target.lat, lng: target.lng },
                auditHistory: [
                  ...trip.auditHistory,
                  {
                    timestamp: new Date().toISOString(),
                    event: 'Driver arrived at drop destination',
                    actor: 'Live GPS Geofence',
                  },
                ],
              };
            }
          }

          return trip;
        })
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Cascading Dispatch Timer: If no driver in active group accepts within timeframe (default 10s), escalate to adjacent group
  useEffect(() => {
    const timer = setInterval(() => {
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.status === 'SEARCHING') {
            const currentSeconds = trip.dispatchCountdownSecs ?? dispatchTimeoutSecs;
            if (currentSeconds > 1) {
              return {
                ...trip,
                dispatchCountdownSecs: currentSeconds - 1,
              };
            } else {
              // Cascade to the next adjacent location group!
              const seq =
                trip.dispatchGroupSequence && trip.dispatchGroupSequence.length > 0
                  ? trip.dispatchGroupSequence
                  : DRIVER_GROUPS.map((g) => g.id);
              const currentIdx = trip.currentDispatchGroupIndex ?? 0;
              const nextIdx = (currentIdx + 1) % seq.length;
              const nextGroupId = seq[nextIdx];
              const nextGroup = DRIVER_GROUPS.find((g) => g.id === nextGroupId);

              return {
                ...trip,
                currentDispatchGroupIndex: nextIdx,
                currentDispatchGroupId: nextGroupId,
                currentDispatchGroupName: nextGroup?.name,
                dispatchCountdownSecs: dispatchTimeoutSecs,
                auditHistory: [
                  ...trip.auditHistory,
                  {
                    timestamp: new Date().toISOString(),
                    event: `Unaccepted order escalated to adjacent group: ${nextGroup?.name || nextGroupId}`,
                    actor: 'Cascading Dispatch Engine',
                  },
                ],
              };
            }
          }
          return trip;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatchTimeoutSecs]);

  // Helper to build sequential multi-stops (pickups and drops) for a trip
  const buildTripStops = useCallback(
    (tripData: {
      bookingCode?: string;
      pickups?: LocationPoint[];
      drops?: LocationPoint[];
      pickup?: LocationPoint;
      drop?: LocationPoint;
      fare?: { totalFare: number };
      shipment?: { pickupOtp?: string; deliveryOtp?: string };
    }): TripStop[] => {
      const allPickups = tripData.pickups && tripData.pickups.length > 0 ? tripData.pickups : (tripData.pickup ? [tripData.pickup] : []);
      const allDrops = tripData.drops && tripData.drops.length > 0 ? tripData.drops : (tripData.drop ? [tripData.drop] : []);
      const totalStops = Math.max(1, allPickups.length + allDrops.length);
      const totalFare = tripData.fare?.totalFare || 500;
      const stops: TripStop[] = [];
      let seq = 1;

      allPickups.forEach((p, idx) => {
        const charge = Math.round((totalFare / totalStops) * 10) / 10;
        const qrData = `upi://pay?pa=swifload.ops@icici&pn=SwifLoad%20Logistics&am=${charge}&cu=INR&tn=SwifLoad_${tripData.bookingCode || 'TRIP'}_Stop_${seq}`;
        stops.push({
          id: `stop_p_${idx + 1}_${seq}`,
          type: 'PICKUP',
          sequence: seq++,
          label: `Pickup #${idx + 1}`,
          area: p.area || 'Pickup Locality',
          address: p.address || '',
          lat: p.lat,
          lng: p.lng,
          contactName: p.senderOrReceiverName || 'Sender',
          contactPhone: p.senderOrReceiverPhone || p.contactPhone || '+91 98422 19283',
          status: 'PENDING',
          distanceCoveredKm: 2.5,
          associatedCharge: charge,
          companyPaymentQr: qrData,
          otp: tripData.shipment?.pickupOtp || '4821',
        });
      });

      allDrops.forEach((d, idx) => {
        const charge = Math.round((totalFare / totalStops) * 10) / 10;
        const qrData = `upi://pay?pa=swifload.ops@icici&pn=SwifLoad%20Logistics&am=${charge}&cu=INR&tn=SwifLoad_${tripData.bookingCode || 'TRIP'}_Stop_${seq}`;
        stops.push({
          id: `stop_d_${idx + 1}_${seq}`,
          type: 'DROP',
          sequence: seq++,
          label: `Drop #${idx + 1}`,
          area: d.area || 'Drop Locality',
          address: d.address || '',
          lat: d.lat,
          lng: d.lng,
          contactName: d.senderOrReceiverName || 'Receiver',
          contactPhone: d.senderOrReceiverPhone || d.contactPhone || '+91 98422 88712',
          status: 'PENDING',
          distanceCoveredKm: 3.5,
          associatedCharge: charge,
          companyPaymentQr: qrData,
          otp: tripData.shipment?.deliveryOtp || '7392',
        });
      });

      return stops;
    },
    []
  );

  // Create a new booking: dispatches to nearest driver group using slab distance rates
  const createBooking = useCallback(
    (payload: CreateTripPayload): string => {
      // Calculate distance based on multi-stop or single pickup-to-drop (Changes Required Item 17)
      let distanceKm = 1.0;
      const allWaypoints: LocationPoint[] = [];
      if (payload.pickups && payload.pickups.length > 0) {
        allWaypoints.push(...payload.pickups);
      } else {
        allWaypoints.push(payload.pickup);
      }
      if (payload.drops && payload.drops.length > 0) {
        allWaypoints.push(...payload.drops);
      } else {
        allWaypoints.push(payload.drop);
      }

      if (allWaypoints.length >= 2) {
        distanceKm = calculateMultiStopDistanceKm(allWaypoints);
      } else {
        distanceKm = calculateDistanceKm(payload.pickup, payload.drop);
      }

      const durationMins = estimateDurationMins(distanceKm);
      const custType = payload.customerType || currentCustomer.customerType || 'regular';

      // Slab calculation quoted on farthest driver in closest range to prevent under-quoting
      const fare = calculateCustomerQuotedSlabFare(
        distanceKm,
        custType,
        payload.pickup,
        payload.drop,
        drivers,
        customerSlabConfigs,
        payload.hasHelperRequired,
        payload.vehicleCategory,
        vehicleConfigs,
        serviceZones
      );

      // Check wallet if WALLET is selected as payment method (Negative balance NOT allowed for customer)
      if (payload.paymentMethod === 'WALLET') {
        if (currentCustomer.wallet.balance < fare.totalFare) {
          showToast(`Insufficient wallet balance (₹${currentCustomer.wallet.balance}). Please recharge or select another payment mode.`);
          return '';
        }

        // Deduct from customer wallet immediately
        const newBal = Math.round((currentCustomer.wallet.balance - fare.totalFare) * 10) / 10;
        const tx: WalletTransaction = {
          id: `tx_c_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'DEBIT',
          amount: fare.totalFare,
          balanceAfter: newBal,
          description: `Payment for booking with ${custType} slab rate`,
          category: 'TRIP_PAYMENT',
        };
        setCurrentCustomer((prev) => ({
          ...prev,
          wallet: {
            balance: newBal,
            transactions: [tx, ...(prev.wallet.transactions || [])],
          },
        }));
        syncWalletToServer({
          entityType: 'customer',
          id: currentCustomer.id,
          amount: -fare.totalFare,
          description: `Trip Booking Wallet Payment: -₹${fare.totalFare}`,
        });
      }

      const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const tripId = `trip_cbe_${Date.now()}`;
      const bookingCode = `SWF-CBE-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate ordered driver groups by proximity to pickup
      const orderedGroups = [...DRIVER_GROUPS].sort((a, b) => {
        const distA = Math.hypot(a.center.lat - payload.pickup.lat, a.center.lng - payload.pickup.lng);
        const distB = Math.hypot(b.center.lat - payload.pickup.lat, b.center.lng - payload.pickup.lng);
        return distA - distB;
      });
      const nearestGroup = orderedGroups[0];
      const sequence = orderedGroups.map((g) => g.id);

      const isPendingPayment = payload.paymentMethod === 'CASH_ON_DELIVERY' || payload.paymentMethod === 'POST_PAYMENT';

      const initialStops = buildTripStops({
        bookingCode,
        pickups: payload.pickups || [payload.pickup],
        drops: payload.drops || [payload.drop],
        pickup: payload.pickup,
        drop: payload.drop,
        fare,
        shipment: { pickupOtp, deliveryOtp },
      });

      const newTrip: Trip = {
        id: tripId,
        bookingCode,
        createdAt: new Date().toISOString(),
        scheduledTime: payload.scheduledTime || 'Instant Now',
        customerId: currentCustomer.id || 'cust_curr',
        customerName: payload.customerName || currentCustomer.name || 'Customer',
        customerPhone: payload.customerPhone || currentCustomer.phone || '+91 98450 00000',
        customerType: custType,
        vehicleCategory: payload.vehicleCategory,
        pickup: payload.pickup,
        drop: payload.drop,
        pickups: payload.pickups || [payload.pickup],
        drops: payload.drops || [payload.drop],
        stopType: payload.stopType || (payload.pickups && payload.pickups.length > 1 ? 'multi_pickup' : (payload.drops && payload.drops.length > 1 ? 'multi_drop' : 'single')),
        stops: initialStops,
        currentStopIndex: 0,
        distanceKm,
        durationMins,
        shipment: {
          goodsCategory: payload.goodsCategory,
          approxWeightKg: payload.approxWeightKg,
          packageCount: payload.packageCount || 1,
          hasHelperRequired: payload.hasHelperRequired,
          notes: payload.notes,
          cargoPhotoUrl: payload.cargoPhotoUrl,
          pickupOtp,
          deliveryOtp,
        },
        fare,
        paymentMethod: payload.paymentMethod,
        paymentStatus: isPendingPayment ? 'PENDING' : 'PAID',
        status: 'SEARCHING',
        currentDispatchGroupId: nearestGroup.id,
        currentDispatchGroupName: nearestGroup.name,
        dispatchGroupSequence: sequence,
        currentDispatchGroupIndex: 0,
        dispatchCountdownSecs: dispatchTimeoutSecs,
        auditHistory: [
          {
            timestamp: new Date().toISOString(),
            event: `Booking created (${custType} slab rate). Quoted ₹${fare.totalFare} based on farthest driver in range (${fare.farthestDriverDistanceKm}km away). Dispatched to: ${nearestGroup.name}`,
            actor: payload.customerName || 'Customer',
          },
        ],
      };

      setTrips((prev) => [newTrip, ...prev]);
      setActiveTripId(tripId);
      syncTripToServer(newTrip);

      showToast(`Trip ${bookingCode} created! Dispatched to ${nearestGroup.name}`);
      return tripId;
    },
    [currentCustomer, drivers, customerSlabConfigs, vehicleConfigs, serviceZones, dispatchTimeoutSecs, syncTripToServer, showToast, buildTripStops, syncWalletToServer]
  );

  // Driver Accepts a pickup task: Task payout is calculated from this driver's specific distance to pickup + trip distance!
  const acceptTripByDriver = useCallback(
    (tripId: string, driverId: string): { success: boolean; message: string } => {
      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) return { success: false, message: 'Driver profile not found' };

      // Blocked if wallet balance <= -200 (Changes Required Item 11)
      if (driver.wallet.balance <= -200) {
        showToast(`Account blocked: Wallet balance is -₹${Math.abs(driver.wallet.balance)}. Recharge minimum ₹200 to receive and accept pickup calls.`);
        return {
          success: false,
          message: `Wallet balance is below -₹200 limit. Please recharge minimum ₹200 to receive and accept pickup calls.`,
        };
      }

      // Check cancellation lockout (cooldown penalty)
      const activeLockout = driverLockouts.find(
        (l) => l.driverId === driverId && !l.isWaived && new Date(l.lockedUntil).getTime() > Date.now()
      );
      if (activeLockout) {
        const remainingMs = new Date(activeLockout.lockedUntil).getTime() - Date.now();
        const remHrs = Math.floor(remainingMs / (3600 * 1000));
        const remMins = Math.ceil((remainingMs % (3600 * 1000)) / 60000);
        const remStr = remHrs > 0 ? `${remHrs}h ${remMins}m` : `${remMins}m`;
        showToast(`Cannot accept: Order taking suspended (${activeLockout.reason}) for next ${remStr}.`);
        return {
          success: false,
          message: `Order taking is suspended due to previous trip cancellation (${activeLockout.reason}). Available again in ${remStr}.`,
        };
      }

      let accepted = false;
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId && t.status === 'SEARCHING') {
            accepted = true;
            // Calculate task charge/payout specifically for this driver based on their location
            const driverPayoutCalc = calculateDriverTaskPayout(
              driver.currentLocation,
              t.pickup,
              t.distanceKm,
              t.customerType || 'regular',
              customerSlabConfigs
            );

            const updatedTrip = {
              ...t,
              status: 'DRIVER_ASSIGNED' as TripStatus,
              driverId: driver.id,
              driverName: driver.name,
              driverPhone: driver.phone,
              driverVehicleNumber: driver.vehicleNumber,
              driverRating: driver.rating,
              driverLocation: driver.currentLocation,
              driverToPickupDistanceKm: driverPayoutCalc.driverToPickupKm,
              totalSlabDistanceKm: driverPayoutCalc.totalDistanceKm,
              fare: {
                ...t.fare,
                driverEarnings: driverPayoutCalc.driverEarnings,
                slabBreakdown: driverPayoutCalc.breakdown,
              },
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Task accepted by driver ${driver.name} (${driver.groupName}). Driver distance to pickup: ${driverPayoutCalc.driverToPickupKm}km. Task payout: ₹${driverPayoutCalc.driverEarnings} (Total distance: ${driverPayoutCalc.totalDistanceKm}km)`,
                  actor: 'Driver Partner',
                },
              ],
            };
            updateTripOnServer(tripId, updatedTrip);
            return updatedTrip;
          }
          return t;
        })
      );

      if (accepted) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, currentStatus: 'BUSY' } : d))
        );
        updateDriverOnServer(driverId, { currentStatus: 'BUSY' });
        showToast(`Task accepted by ${driver.name}! Navigating to pickup.`);
        return { success: true, message: 'Trip successfully accepted' };
      }
      return { success: false, message: 'Trip is no longer available in this group' };
    },
    [drivers, driverLockouts, customerSlabConfigs, updateTripOnServer, updateDriverOnServer, showToast]
  );

  // Pass trip to adjacent group manually (if driver passes or tests escalation)
  const passTripToNextGroup = useCallback(
    (tripId: string) => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId && t.status === 'SEARCHING') {
            const seq =
              t.dispatchGroupSequence && t.dispatchGroupSequence.length > 0
                ? t.dispatchGroupSequence
                : DRIVER_GROUPS.map((g) => g.id);
            const currentIdx = t.currentDispatchGroupIndex ?? 0;
            const nextIdx = (currentIdx + 1) % seq.length;
            const nextGroupId = seq[nextIdx];
            const nextGroup = DRIVER_GROUPS.find((g) => g.id === nextGroupId);

            showToast(`Task passed to adjacent group: ${nextGroup?.name || nextGroupId}`);
            return {
              ...t,
              currentDispatchGroupIndex: nextIdx,
              currentDispatchGroupId: nextGroupId,
              currentDispatchGroupName: nextGroup?.name,
              dispatchCountdownSecs: dispatchTimeoutSecs,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Driver passed task. Escalated to adjacent group: ${nextGroup?.name || nextGroupId}`,
                  actor: 'Dispatch Engine',
                },
              ],
            };
          }
          return t;
        })
      );
    },
    [dispatchTimeoutSecs, showToast]
  );

  // Cancel Trip
  const cancelTrip = useCallback(
    (tripId: string, reason: string) => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            const charge = calculateCancellationFee(t.status, t.vehicleCategory);
            // Free the driver if assigned
            if (t.driverId) {
              setDrivers((dList) =>
                dList.map((d) => (d.id === t.driverId ? { ...d, currentStatus: 'IDLE' } : d))
              );
              updateDriverOnServer(t.driverId, { currentStatus: 'IDLE' });
            }
            const updatedTrip = {
              ...t,
              status: 'CANCELLED' as TripStatus,
              cancellationReason: reason,
              cancellationCharge: charge,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Trip cancelled. Reason: ${reason}. Cancellation fee: ₹${charge}`,
                  actor: 'User',
                },
              ],
            };
            updateTripOnServer(tripId, updatedTrip);
            return updatedTrip;
          }
          return t;
        })
      );
      showToast('Trip cancelled');
    },
    [updateTripOnServer, updateDriverOnServer, showToast]
  );

  // Driver Cancels Accepted Trip with Configurable Lockout Penalty
  const cancelTripByDriver = useCallback(
    (tripId: string, driverId: string, reason: DriverCancellationReason) => {
      const driver = drivers.find((d) => d.id === driverId);
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) return { success: false, lockoutHours: 0, lockedUntil: '' };

      const slab = cancellationSlabConfigs.find((s) => s.reason === reason);
      const lockoutHours = slab
        ? slab.lockoutHours
        : reason === 'Illness'
        ? 1
        : reason === 'Vehicle breakdown'
        ? 2
        : reason === 'Priority personal work'
        ? 4
        : 6;
      const lockedAt = new Date().toISOString();
      const lockedUntil = new Date(Date.now() + lockoutHours * 3600 * 1000).toISOString();

      const newLockout: DriverCancellationLockout = {
        driverId,
        driverName: driver?.name || 'Driver',
        tripId,
        bookingCode: trip.bookingCode,
        reason,
        lockoutHours,
        lockedAt,
        lockedUntil,
      };

      setDriverLockouts((prev) => {
        const updated = [newLockout, ...prev.filter((l) => !(l.driverId === driverId && !l.isWaived))];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_DRIVER_LOCKOUTS, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Update driver to OFFLINE
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const updated = {
              ...d,
              isOnline: false,
              currentStatus: 'OFFLINE' as const,
            };
            updateDriverOnServer(driverId, updated);
            return updated;
          }
          return d;
        })
      );

      // Cancel the trip
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            const charge = calculateCancellationFee(t.status, t.vehicleCategory);
            const updated = {
              ...t,
              status: 'CANCELLED' as TripStatus,
              cancellationReason: `Driver Cancelled: ${reason} (${lockoutHours}h lockout penalty)`,
              cancellationCharge: charge,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Trip cancelled by Driver (${driver?.name || driverId}). Reason: ${reason}. Cooldown penalty: ${lockoutHours} hour(s) until ${new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                  actor: 'Driver',
                },
              ],
            };
            updateTripOnServer(tripId, updated);
            return updated;
          }
          return t;
        })
      );

      // Add driver notification
      setDriverNotifications((prev) => {
        const notif: DriverNotification = {
          id: `notif_${Date.now()}_cancel`,
          driverId,
          tripId,
          title: `Duty Suspended: ${reason}`,
          message: `Booking #${trip.bookingCode} cancelled. You are on mandatory standby for ${lockoutHours} hr(s) until ${new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'CANCELLATION',
          timestamp: new Date().toISOString(),
          read: false,
        };
        const updatedNotifs = [notif, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updatedNotifs));
        } catch {}
        return updatedNotifs;
      });

      showToast(`Trip cancelled. Order taking suspended for ${lockoutHours} hr(s) (${reason}).`);
      return { success: true, lockoutHours, lockedUntil };
    },
    [drivers, trips, cancellationSlabConfigs, updateDriverOnServer, updateTripOnServer, showToast]
  );

  // Waive Driver Lockout (Admin Action)
  const waiveDriverLockout = useCallback(
    (driverId: string) => {
      setDriverLockouts((prev) => {
        const updated = prev.map((l) =>
          l.driverId === driverId && !l.isWaived
            ? { ...l, isWaived: true, waivedAt: new Date().toISOString(), waivedBy: 'Admin' }
            : l
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_DRIVER_LOCKOUTS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showToast('Driver cancellation lockout waived by Admin!');
    },
    [showToast]
  );

  // Update Cancellation Hour Slabs (Configurable from Admin Portal)
  const updateCancellationSlabConfig = useCallback(
    (reason: DriverCancellationReason, hours: number) => {
      const sanitized = Math.max(0.5, Math.min(72, Number(hours)));
      setCancellationSlabConfigs((prev) => {
        const updated = prev.map((s) => (s.reason === reason ? { ...s, lockoutHours: sanitized } : s));
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_CANCELLATION_SLABS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showToast(`Lockout penalty for '${reason}' updated to ${sanitized} hour(s)`);
    },
    [showToast]
  );

  // Reset Cancellation Slabs to Factory Defaults
  const resetCancellationSlabsToDefault = useCallback(() => {
    setCancellationSlabConfigs(DEFAULT_DRIVER_CANCELLATION_SLABS);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CANCELLATION_SLABS, JSON.stringify(DEFAULT_DRIVER_CANCELLATION_SLABS));
    } catch {}
    showToast('Reset cancellation slabs to defaults (1, 2, 4, 6 hrs)');
  }, [showToast]);

  // Check if Driver is Currently Locked Out
  const isDriverInLockout = useCallback(
    (driverId: string) => {
      const active = driverLockouts.find(
        (l) => l.driverId === driverId && !l.isWaived && new Date(l.lockedUntil).getTime() > Date.now()
      );
      if (!active) {
        return { isLocked: false, remainingMinutes: 0, remainingHours: 0, remainingSeconds: 0 };
      }
      const remainingMs = Math.max(0, new Date(active.lockedUntil).getTime() - Date.now());
      const remainingSeconds = Math.floor(remainingMs / 1000);
      const remainingMinutes = Math.floor(remainingSeconds / 60);
      const remainingHours = Math.floor(remainingMinutes / 60);
      return {
        isLocked: true,
        lockout: active,
        remainingMinutes,
        remainingHours,
        remainingSeconds,
      };
    },
    [driverLockouts]
  );

  // Assign or Reassign Driver (from Admin or Dispatch)
  const assignDriver = useCallback(
    (tripId: string, driverId: string) => {
      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) return;

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            // Free previous driver if any
            if (t.driverId && t.driverId !== driverId) {
              setDrivers((dList) =>
                dList.map((d) => (d.id === t.driverId ? { ...d, currentStatus: 'IDLE' } : d))
              );
              updateDriverOnServer(t.driverId, { currentStatus: 'IDLE' });
            }
            const updatedTrip = {
              ...t,
              status: 'DRIVER_ASSIGNED' as TripStatus,
              driverId: driver.id,
              driverName: driver.name,
              driverPhone: driver.phone,
              driverVehicleNumber: driver.vehicleNumber,
              driverRating: driver.rating,
              driverLocation: driver.currentLocation,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Manual dispatch to driver ${driver.name} (${driver.vehicleNumber})`,
                  actor: 'Admin Dispatcher',
                },
              ],
            };
            updateTripOnServer(tripId, updatedTrip);
            return updatedTrip;
          }
          return t;
        })
      );

      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, currentStatus: 'BUSY' } : d))
      );
      updateDriverOnServer(driverId, { currentStatus: 'BUSY' });

      showToast(`Driver ${driver.name} assigned to trip`);
    },
    [drivers, updateTripOnServer, updateDriverOnServer, showToast]
  );

  // Advance Trip Status in the lifecycle
  const advanceTripStatus = useCallback(
    (tripId: string, otpProvided?: string, photoProof?: string): { success: boolean; message: string } => {
      let result = { success: false, message: 'Invalid action' };

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;

          // 1. DRIVER_ASSIGNED -> ARRIVING_PICKUP
          if (t.status === 'DRIVER_ASSIGNED') {
            result = { success: true, message: 'Driver en route to pickup location' };
            return {
              ...t,
              status: 'ARRIVING_PICKUP',
              auditHistory: [
                ...t.auditHistory,
                { timestamp: new Date().toISOString(), event: 'Driver started moving to pickup', actor: 'Driver' },
              ],
            };
          }

          // 2. ARRIVING_PICKUP -> AT_PICKUP
          if (t.status === 'ARRIVING_PICKUP') {
            result = { success: true, message: 'Driver reached pickup location' };
            return {
              ...t,
              status: 'AT_PICKUP',
              auditHistory: [
                ...t.auditHistory,
                { timestamp: new Date().toISOString(), event: 'Driver reached pickup address', actor: 'Driver' },
              ],
            };
          }

          // 3. AT_PICKUP -> IN_TRANSIT (Requires Pickup OTP validation)
          if (t.status === 'AT_PICKUP') {
            if (otpProvided && otpProvided !== t.shipment.pickupOtp) {
              result = { success: false, message: `Incorrect Pickup OTP! Expected ${t.shipment.pickupOtp}` };
              return t;
            }
            result = { success: true, message: 'Pickup OTP verified! Goods loaded, trip in transit.' };
            return {
              ...t,
              status: 'IN_TRANSIT',
              auditHistory: [
                ...t.auditHistory,
                { timestamp: new Date().toISOString(), event: `Goods loaded. Pickup OTP verified.`, actor: 'Driver' },
              ],
            };
          }

          // 4. IN_TRANSIT -> ARRIVED_DESTINATION
          if (t.status === 'IN_TRANSIT') {
            result = { success: true, message: 'Driver reached destination drop address' };
            return {
              ...t,
              status: 'ARRIVED_DESTINATION',
              driverLocation: t.drop,
              auditHistory: [
                ...t.auditHistory,
                { timestamp: new Date().toISOString(), event: 'Driver reached destination drop location', actor: 'Driver' },
              ],
            };
          }

          // 5. ARRIVED_DESTINATION -> DELIVERED (Requires Delivery OTP & optional photo)
          if (t.status === 'ARRIVED_DESTINATION') {
            if (otpProvided && otpProvided !== t.shipment.deliveryOtp) {
              result = { success: false, message: `Incorrect Delivery OTP! Expected ${t.shipment.deliveryOtp}` };
              return t;
            }

            // Update driver wallet & stats (Negative balance allowed for driver within negativeBalanceLimit)
            if (t.driverId) {
              setDrivers((dList) =>
                dList.map((d) => {
                  if (d.id === t.driverId) {
                    let newBal = d.wallet.balance;
                    const transactions = [...(d.wallet.transactions || [])];

                    if (t.paymentMethod === 'CASH_ON_DELIVERY') {
                      // Driver collected full cash (fare.totalFare) directly from customer
                      // Platform takes 18% commission from driver's wallet (can push balance negative)
                      newBal = Math.round((d.wallet.balance - t.fare.platformCommission) * 10) / 10;
                      transactions.unshift({
                        id: `tx_d_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        type: 'DEBIT',
                        amount: t.fare.platformCommission,
                        balanceAfter: newBal,
                        description: `Platform Commission (18%) on COD trip ${t.bookingCode}`,
                        category: 'COMMISSION_DEDUCTION',
                        referenceId: t.id,
                      });
                    } else {
                      // Digital / Wallet: Driver earnings credited to driver's wallet
                      newBal = Math.round((d.wallet.balance + t.fare.driverEarnings) * 10) / 10;
                      transactions.unshift({
                        id: `tx_d_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        type: 'CREDIT',
                        amount: t.fare.driverEarnings,
                        balanceAfter: newBal,
                        description: `Task Earnings credited for trip ${t.bookingCode}`,
                        category: 'TRIP_EARNING',
                        referenceId: t.id,
                      });
                    }

                    const updatedDriver = {
                      ...d,
                      currentStatus: 'IDLE' as any,
                      totalTrips: d.totalTrips + 1,
                      wallet: {
                        ...d.wallet,
                        balance: newBal,
                        todayEarnings: d.wallet.todayEarnings + t.fare.driverEarnings,
                        transactions,
                      },
                    };
                    updateDriverOnServer(d.id, updatedDriver);
                    return updatedDriver;
                  }
                  return d;
                })
              );
            }

            result = { success: true, message: 'Delivery completed and verified!' };
            return {
              ...t,
              status: 'DELIVERED',
              paymentStatus: 'PAID',
              shipment: {
                ...t.shipment,
                proofOfDeliveryPhoto: photoProof || 'https://placehold.co/600x400/10b981/ffffff?text=Delivery+Confirmed',
              },
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Delivered successfully. Handover verified with OTP ${t.shipment.deliveryOtp}.`,
                  actor: 'Driver',
                },
              ],
            };
          }

          return t;
        })
      );

      if (result.success) {
        showToast(result.message);
        setTimeout(() => {
          setTrips((currentTrips) => {
            const up = currentTrips.find((t) => t.id === tripId);
            if (up) updateTripOnServer(tripId, up);
            return currentTrips;
          });
        }, 50);
      }
      return result;
    },
    [updateTripOnServer, updateDriverOnServer, showToast]
  );

  // Start an individual pickup or drop stop (Changes Required Item 8)
  const startTripStop = useCallback(
    (tripId: string, stopId: string): { success: boolean; message: string } => {
      let result = { success: false, message: 'Stop not found' };
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentStops = t.stops && t.stops.length > 0 ? t.stops : buildTripStops(t);
          const stopIndex = currentStops.findIndex((s) => s.id === stopId);
          if (stopIndex === -1) return t;

          const updatedStops = currentStops.map((s) => {
            if (s.id === stopId) {
              return {
                ...s,
                status: 'IN_PROGRESS' as const,
                startedAt: s.startedAt || new Date().toISOString(),
              };
            }
            return s;
          });

          const currentStop = updatedStops[stopIndex];
          const newStatus: TripStatus =
            currentStop.type === 'PICKUP'
              ? (t.status === 'DRIVER_ASSIGNED' ? 'ARRIVING_PICKUP' : t.status)
              : 'IN_TRANSIT';

          result = {
            success: true,
            message: `Started ${currentStop.label}: Driver en route to ${currentStop.area}!`,
          };

          addDriverNotification({
            title: `${currentStop.label} En Route`,
            message: `Driver is on the way to ${currentStop.label} at ${currentStop.area} (${currentStop.address})`,
            type: currentStop.type === 'PICKUP' ? 'PICKUP' : 'DROP',
            tripId: t.id,
            driverId: t.driverId,
          });

          const updatedTrip = {
            ...t,
            status: newStatus,
            stops: updatedStops,
            currentStopIndex: stopIndex,
            auditHistory: [
              ...t.auditHistory,
              {
                timestamp: new Date().toISOString(),
                event: `Driver started ${currentStop.label} at ${currentStop.area}`,
                actor: 'Driver',
              },
            ],
          };
          updateTripOnServer(t.id, updatedTrip);
          return updatedTrip;
        })
      );
      if (result.success) showToast(result.message);
      return result;
    },
    [addDriverNotification, buildTripStops, updateTripOnServer, showToast]
  );

  // Complete an individual pickup or drop stop (Changes Required Items 6, 8, 9)
  const completeTripStop = useCallback(
    (
      tripId: string,
      stopId: string,
      otpProvided?: string
    ): { success: boolean; message: string; nextStop?: TripStop; isCompleted?: boolean } => {
      let result: { success: boolean; message: string; nextStop?: TripStop; isCompleted?: boolean } = {
        success: false,
        message: 'Invalid operation',
      };

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentStops = t.stops && t.stops.length > 0 ? t.stops : buildTripStops(t);
          const stopIndex = currentStops.findIndex((s) => s.id === stopId);
          if (stopIndex === -1) return t;

          const targetStop = currentStops[stopIndex];
          if (otpProvided && targetStop.otp && otpProvided !== targetStop.otp) {
            result = {
              success: false,
              message: `Incorrect OTP! Expected ${targetStop.otp}`,
            };
            return t;
          }

          const now = new Date();
          const startedAt = targetStop.startedAt ? new Date(targetStop.startedAt) : new Date(now.getTime() - 15 * 60000);
          const timeTakenMinutes = Math.max(1, Math.round((now.getTime() - startedAt.getTime()) / 60000));

          const updatedStops = currentStops.map((s) => {
            if (s.id === stopId) {
              return {
                ...s,
                status: 'COMPLETED' as const,
                completedAt: now.toISOString(),
                timeTakenMinutes,
              };
            }
            return s;
          });

          const nextStop = updatedStops[stopIndex + 1];
          const isAllStopsCompleted = updatedStops.every((s) => s.status === 'COMPLETED');

          addDriverNotification({
            title: `${targetStop.label} Completed`,
            message: `${targetStop.label} completed at ${targetStop.area} for Order ${t.bookingCode}.${nextStop ? ` Next: ${nextStop.label} at ${nextStop.area}.` : ' Trip delivered!'}`,
            type: targetStop.type === 'PICKUP' ? 'PICKUP' : 'DROP',
            tripId: t.id,
            driverId: t.driverId,
          });

          if (isAllStopsCompleted) {
            if (t.driverId) {
              setDrivers((dList) =>
                dList.map((d) => {
                  if (d.id === t.driverId) {
                    let newBal = d.wallet.balance;
                    const transactions = [...(d.wallet.transactions || [])];

                    if (t.paymentMethod === 'CASH_ON_DELIVERY') {
                      newBal = Math.round((d.wallet.balance - t.fare.platformCommission) * 10) / 10;
                      transactions.unshift({
                        id: `tx_d_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        type: 'DEBIT',
                        amount: t.fare.platformCommission,
                        balanceAfter: newBal,
                        description: `Platform Commission (18%) on COD trip ${t.bookingCode}`,
                        category: 'COMMISSION_DEDUCTION',
                        referenceId: t.id,
                      });
                    } else {
                      newBal = Math.round((d.wallet.balance + t.fare.driverEarnings) * 10) / 10;
                      transactions.unshift({
                        id: `tx_d_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        type: 'CREDIT',
                        amount: t.fare.driverEarnings,
                        balanceAfter: newBal,
                        description: `Task Earnings credited for trip ${t.bookingCode}`,
                        category: 'TRIP_EARNING',
                        referenceId: t.id,
                      });
                    }

                    const updatedDriver = {
                      ...d,
                      currentStatus: 'IDLE' as any,
                      totalTrips: d.totalTrips + 1,
                      wallet: {
                        ...d.wallet,
                        balance: newBal,
                        todayEarnings: d.wallet.todayEarnings + t.fare.driverEarnings,
                        transactions,
                      },
                    };
                    updateDriverOnServer(d.id, updatedDriver);
                    return updatedDriver;
                  }
                  return d;
                })
              );
            }

            result = {
              success: true,
              message: `All stops completed for Order ${t.bookingCode}! Delivery verified.`,
              isCompleted: true,
            };

            const updatedTrip = {
              ...t,
              status: 'DELIVERED' as TripStatus,
              stops: updatedStops,
              currentStopIndex: stopIndex,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: now.toISOString(),
                  event: `All pickups and drops completed. Final delivery verified.`,
                  actor: 'Driver',
                },
              ],
            };
            updateTripOnServer(t.id, updatedTrip);
            return updatedTrip;
          }

          result = {
            success: true,
            message: `${targetStop.label} completed! Next: ${nextStop.label} (${nextStop.area})`,
            nextStop,
            isCompleted: false,
          };

          const nextStatus = nextStop.type === 'PICKUP' ? 'AT_PICKUP' : 'IN_TRANSIT';
          const updatedTrip = {
            ...t,
            status: nextStatus as TripStatus,
            stops: updatedStops,
            currentStopIndex: stopIndex + 1,
            auditHistory: [
              ...t.auditHistory,
              {
                timestamp: now.toISOString(),
                event: `${targetStop.label} completed at ${targetStop.area}. Moving to ${nextStop.label} (${nextStop.area})`,
                actor: 'Driver',
              },
            ],
          };
          updateTripOnServer(t.id, updatedTrip);
          return updatedTrip;
        })
      );

      if (result.success) showToast(result.message);
      return result;
    },
    [addDriverNotification, buildTripStops, updateDriverOnServer, updateTripOnServer, showToast]
  );

  // Submit Rating & Feedback with Reward Points
  const submitRating = useCallback(
    (tripId: string, rating: number, feedback: string) => {
      // Reward points: 50 points = ₹50 credited to customer wallet
      const rewardPoints = 50;
      setCurrentCustomer((prev) => {
        const newBal = Math.round((prev.wallet.balance + rewardPoints) * 10) / 10;
        const tx: WalletTransaction = {
          id: `tx_c_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'CREDIT',
          amount: rewardPoints,
          balanceAfter: newBal,
          description: `Reward Points Cashback for rating trip (${rating}★): 50 pts`,
          category: 'REWARD_POINTS',
        };
        return {
          ...prev,
          wallet: {
            balance: newBal,
            transactions: [tx, ...(prev.wallet.transactions || [])],
          },
        };
      });

      syncWalletToServer({
        entityType: 'customer',
        id: currentCustomer.id,
        amount: rewardPoints,
        description: `Trip Review Reward Points Cashback: +₹${rewardPoints}`,
      });

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            const updated = {
              ...t,
              customerRating: rating,
              customerFeedback: feedback,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Customer rated trip ${rating} stars: "${feedback}". Credited ${rewardPoints} reward points to wallet.`,
                  actor: 'Customer',
                },
              ],
            };
            updateTripOnServer(tripId, updated);
            return updated;
          }
          return t;
        })
      );
      showToast(`Thank you for rating! 50 Reward Points (₹50) credited to your SwifLoad Wallet!`);
    },
    [currentCustomer, updateTripOnServer, syncWalletToServer, showToast]
  );

  // Toggle Driver Online / Offline
  const toggleDriverOnline = useCallback(
    (driverId: string) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const nextOnline = !d.isOnline;
            if (nextOnline) {
              const activeLockout = driverLockouts.find(
                (l) => l.driverId === driverId && !l.isWaived && new Date(l.lockedUntil).getTime() > Date.now()
              );
              if (activeLockout) {
                const remainingMs = new Date(activeLockout.lockedUntil).getTime() - Date.now();
                const remHrs = Math.floor(remainingMs / (3600 * 1000));
                const remMins = Math.ceil((remainingMs % (3600 * 1000)) / 60000);
                const remStr = remHrs > 0 ? `${remHrs}h ${remMins}m` : `${remMins}m`;
                showToast(`Duty suspended: Cannot go Online until ${new Date(activeLockout.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${activeLockout.reason}, ${remStr} left).`);
                return d;
              }
            }
            showToast(`Driver is now ${nextOnline ? 'ONLINE' : 'OFFLINE'}`);
            const updated = {
              ...d,
              isOnline: nextOnline,
              currentStatus: nextOnline ? ('IDLE' as const) : ('OFFLINE' as const),
            };
            updateDriverOnServer(driverId, updated);
            return updated;
          }
          return d;
        })
      );
    },
    [driverLockouts, updateDriverOnServer, showToast]
  );

  // Approve Driver KYC
  const approveDriverKyc = useCallback(
    (driverId: string) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const updated = {
              ...d,
              kycStatus: 'VERIFIED' as const,
              kycDocuments: d.kycDocuments.map((doc) => ({ ...doc, verified: true })),
            };
            updateDriverOnServer(driverId, updated);
            return updated;
          }
          return d;
        })
      );
      showToast('Driver documents approved & account activated!');
    },
    [updateDriverOnServer, showToast]
  );

  // Reject Driver KYC
  const rejectDriverKyc = useCallback(
    (driverId: string, reason: string) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const updated = { ...d, kycStatus: 'REJECTED' as const };
            updateDriverOnServer(driverId, updated);
            return updated;
          }
          return d;
        })
      );
      showToast(`Driver KYC rejected: ${reason}`);
    },
    [updateDriverOnServer, showToast]
  );

  // Request Payout
  const requestDriverPayout = useCallback(
    (driverId: string, amount: number): boolean => {
      let ok = false;
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId && d.wallet.balance >= amount && amount > 0) {
            ok = true;
            return {
              ...d,
              wallet: {
                ...d.wallet,
                balance: d.wallet.balance - amount,
                pendingPayout: d.wallet.pendingPayout + amount,
              },
            };
          }
          return d;
        })
      );
      if (ok) {
        showToast(`Payout request of ₹${amount} initiated via IMPS`);
      }
      return ok;
    },
    [showToast]
  );

  // Update Vehicle Pricing
  const updateVehicleConfig = useCallback(
    (newConfig: VehicleConfig) => {
      setVehicleConfigs((prev) =>
        prev.map((v) => (v.id === newConfig.id ? newConfig : v))
      );
      showToast(`Pricing updated for ${newConfig.name}`);
    },
    [showToast]
  );

  // Update Service Zone
  const updateServiceZone = useCallback(
    (zone: ServiceZone) => {
      setServiceZones((prev) =>
        prev.map((z) => (z.id === zone.id ? zone : z))
      );
      showToast(`Service zone "${zone.name}" updated`);
    },
    [showToast]
  );

  // Add Internal Admin Note
  const addAdminNote = useCallback(
    (tripId: string, note: string) => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            const currentNotes = t.internalNotes || [];
            return {
              ...t,
              internalNotes: [...currentNotes, `[${new Date().toLocaleTimeString()}] ${note}`],
            };
          }
          return t;
        })
      );
      showToast('Admin note added to trip record');
    },
    [showToast]
  );

  // Export CSV Data
  const exportCsvData = useCallback(
    (type: 'trips' | 'drivers' | 'finance' | 'referrals' | 'wallets') => {
      let csvContent = '';
      if (type === 'trips') {
        csvContent = 'TripID,BookingCode,Date,Customer,CustomerType,Vehicle,Pickup,Drop,DistanceKm,TotalFare,Driver,Status,PricingNotice\n';
        trips.forEach((t) => {
          csvContent += `"${t.id}","${t.bookingCode}","${t.createdAt.slice(0, 10)}","${t.customerName}","${t.customerType || 'regular'}","${t.vehicleCategory}","${t.pickup.area}","${t.drop.area}",${t.distanceKm},${t.fare.totalFare},"${t.driverName || 'N/A'}","${t.status}","${t.fare.pricingNotice || ''}"\n`;
        });
      } else if (type === 'drivers') {
        csvContent = 'DriverID,Name,Phone,ReferralCode,VehicleCategory,VehicleNumber,Status,KYC,Rating,TotalTrips,WalletBalance,NegativeLimit\n';
        drivers.forEach((d) => {
          csvContent += `"${d.id}","${d.name}","${d.phone}","${d.referralCode || ''}","${d.vehicleCategory}","${d.vehicleNumber}","${d.isOnline ? 'ONLINE' : 'OFFLINE'}","${d.kycStatus}",${d.rating},${d.totalTrips},${d.wallet.balance},${d.wallet.negativeBalanceLimit || 1500}\n`;
        });
      } else if (type === 'finance') {
        csvContent = 'TripID,BookingCode,PaymentMethod,PaymentStatus,GMV,PlatformCommission,DriverEarnings,GST\n';
        trips.forEach((t) => {
          csvContent += `"${t.id}","${t.bookingCode}","${t.paymentMethod}","${t.paymentStatus}",${t.fare.totalFare},${t.fare.platformCommission},${t.fare.driverEarnings},${t.fare.taxGst}\n`;
        });
      } else if (type === 'referrals') {
        csvContent = 'ReferralID,Type,ReferrerName,ReferrerRole,RefereeName,RefereeRole,BonusAmount,Status,CreatedAt,CreditedAt\n';
        referrals.forEach((r) => {
          csvContent += `"${r.id}","${r.type}","${r.referrerName}","${r.referrerRole}","${r.refereeName}","${r.refereeRole}",${r.bonusAmount},"${r.status}","${r.createdAt.slice(0, 10)}","${r.creditedAt ? r.creditedAt.slice(0, 10) : 'PENDING'}"\n`;
        });
      } else {
        csvContent = 'EntityType,ID,Name,Phone,Role,Balance,OverdraftAllowed,OverdraftLimit\n';
        csvContent += `"Customer","${currentCustomer.id}","${currentCustomer.name}","${currentCustomer.phone}","${currentCustomer.customerType}",${currentCustomer.wallet.balance},"NO",0\n`;
        drivers.forEach((d) => {
          csvContent += `"Driver","${d.id}","${d.name}","${d.phone}","Driver",${d.wallet.balance},"YES",${d.wallet.negativeBalanceLimit || 1500}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `swifload_${type}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${type}.csv successfully!`);
    },
    [trips, drivers, referrals, currentCustomer, showToast]
  );

  const resetToDemoData = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRIPS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DRIVERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_VEHICLES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ZONES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOMER);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SLABS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_REFERRALS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_REF_CONFIG);
    localStorage.removeItem(LOCAL_STORAGE_KEY_INCENTIVE_SLABS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DISPATCH_TIMEOUT);
    localStorage.removeItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    setTrips(INITIAL_TRIPS);
    setDrivers(INITIAL_DRIVERS);
    setVehicleConfigs(VEHICLE_CONFIGS);
    setServiceZones(SERVICE_ZONES);
    setCurrentCustomer(INITIAL_CUSTOMER);
    setCustomerSlabConfigs(DEFAULT_CUSTOMER_SLABS);
    setReferralConfig(DEFAULT_REFERRAL_CONFIG);
    setReferrals(INITIAL_REFERRALS);
    setIncentiveSlabs(DEFAULT_INCENTIVE_SLABS);
    setDispatchTimeoutSecs(DEFAULT_DISPATCH_TIMEOUT_SECS);
    setDriverNotifications(INITIAL_DRIVER_NOTIFICATIONS);
    setActiveTripId('trip_cbe_1001');

    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    }).catch(() => {});

    showToast('Reset to default Coimbatore Starter MVP demo data!');
  }, [showToast]);

  return (
    <LogisticsContext.Provider
      value={{
        role,
        setRole,
        adminRole,
        setAdminRole,
        selectedDriverId,
        setSelectedDriverId,
        activeTripId,
        setActiveTripId,
        trips,
        drivers,
        driverGroups,
        vehicleConfigs,
        serviceZones,
        landmarks: COIMBATORE_LANDMARKS,
        toastMessage,
        showToast,
        customerSlabConfigs,
        updateCustomerSlabConfig,
        incentiveSlabs,
        updateIncentiveSlabs,
        dispatchTimeoutSecs,
        updateDispatchTimeoutSecs,
        referralConfig,
        updateReferralConfig,
        referrals,
        submitReferral,
        claimReferralBonus,
        applyCustomerReferralCode,
        topUpCustomerWallet,
        topUpDriverWallet,
        updateDriverNegativeLimit,
        adjustWalletBalance,
        driverNotifications,
        addDriverNotification,
        markDriverNotificationRead,
        clearDriverNotifications,
        currentCustomer,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        updateCustomerType,
        registerDriver,
        loginDriver,
        logoutDriver,
        createBooking,
        acceptTripByDriver,
        passTripToNextGroup,
        cancelTrip,
        assignDriver,
        advanceTripStatus,
        startTripStop,
        completeTripStop,
        submitRating,
        toggleDriverOnline,
        approveDriverKyc,
        rejectDriverKyc,
        requestDriverPayout,
        updateVehicleConfig,
        updateServiceZone,
        addAdminNote,
        exportCsvData,
        resetToDemoData,
        cancellationSlabConfigs,
        updateCancellationSlabConfig,
        resetCancellationSlabsToDefault,
        driverLockouts,
        cancelTripByDriver,
        waiveDriverLockout,
        isDriverInLockout,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
