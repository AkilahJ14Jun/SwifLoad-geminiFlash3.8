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
} from '@/lib/data';
import {
  calculateDistanceKm,
  calculateFare,
  calculateCancellationFee,
  estimateDurationMins,
  calculateCustomerQuotedSlabFare,
  calculateDriverTaskPayout,
} from '@/lib/pricing';

interface CreateTripPayload {
  pickup: LocationPoint;
  drop: LocationPoint;
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

  // Load from localStorage on client mount
  useEffect(() => {
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
    } catch {
      // fallback to initial
    }
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
      showToast(`Added ₹${amount} to your SwifLoad Wallet! New Balance: ₹${newBal}`);
    },
    [currentCustomer, showToast]
  );

  // Top up / recharge driver wallet (to clear negative balance or add funds)
  const topUpDriverWallet = useCallback(
    (driverId: string, amount: number, note?: string) => {
      if (amount <= 0) return;
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const newBal = Math.round((d.wallet.balance + amount) * 10) / 10;
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
      showToast(`Driver wallet recharged with ₹${amount}`);
    },
    [showToast]
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
        showToast(`Driver wallet adjusted by ₹${amount}`);
      }
    },
    [currentCustomer, showToast]
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

  // Cascading Dispatch Timer: If no driver in active group accepts within 20s, escalate to adjacent group
  useEffect(() => {
    const timer = setInterval(() => {
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.status === 'SEARCHING') {
            const currentSeconds = trip.dispatchCountdownSecs ?? 20;
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
                dispatchCountdownSecs: 20,
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
  }, []);

  // Create a new booking: dispatches to nearest driver group using slab distance rates
  const createBooking = useCallback(
    (payload: CreateTripPayload): string => {
      const distanceKm = calculateDistanceKm(payload.pickup, payload.drop);
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
        paymentStatus: payload.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
        status: 'SEARCHING',
        currentDispatchGroupId: nearestGroup.id,
        currentDispatchGroupName: nearestGroup.name,
        dispatchGroupSequence: sequence,
        currentDispatchGroupIndex: 0,
        dispatchCountdownSecs: 20,
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

      showToast(`Trip ${bookingCode} created! Dispatched to ${nearestGroup.name}`);
      return tripId;
    },
    [currentCustomer, drivers, customerSlabConfigs, vehicleConfigs, serviceZones, showToast]
  );

  // Driver Accepts a pickup task: Task payout is calculated from this driver's specific distance to pickup + trip distance!
  const acceptTripByDriver = useCallback(
    (tripId: string, driverId: string): { success: boolean; message: string } => {
      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) return { success: false, message: 'Driver profile not found' };

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

            return {
              ...t,
              status: 'DRIVER_ASSIGNED',
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
          }
          return t;
        })
      );

      if (accepted) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, currentStatus: 'BUSY' } : d))
        );
        showToast(`Task accepted by ${driver.name}! Navigating to pickup.`);
        return { success: true, message: 'Trip successfully accepted' };
      }
      return { success: false, message: 'Trip is no longer available in this group' };
    },
    [drivers, customerSlabConfigs, showToast]
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
              dispatchCountdownSecs: 20,
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
    [showToast]
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
            }
            return {
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
          }
          return t;
        })
      );
      showToast('Trip cancelled');
    },
    [showToast]
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
            }
            return {
              ...t,
              status: 'DRIVER_ASSIGNED',
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
          }
          return t;
        })
      );

      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, currentStatus: 'BUSY' } : d))
      );

      showToast(`Driver ${driver.name} assigned to trip`);
    },
    [drivers, showToast]
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

                    return {
                      ...d,
                      currentStatus: 'IDLE',
                      totalTrips: d.totalTrips + 1,
                      wallet: {
                        ...d.wallet,
                        balance: newBal,
                        todayEarnings: d.wallet.todayEarnings + t.fare.driverEarnings,
                        transactions,
                      },
                    };
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
      }
      return result;
    },
    [showToast]
  );

  // Submit Rating & Feedback
  const submitRating = useCallback(
    (tripId: string, rating: number, feedback: string) => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === tripId) {
            return {
              ...t,
              customerRating: rating,
              customerFeedback: feedback,
              auditHistory: [
                ...t.auditHistory,
                {
                  timestamp: new Date().toISOString(),
                  event: `Customer rated trip ${rating} stars: "${feedback}"`,
                  actor: 'Customer',
                },
              ],
            };
          }
          return t;
        })
      );
      showToast('Thank you for rating your trip!');
    },
    [showToast]
  );

  // Toggle Driver Online / Offline
  const toggleDriverOnline = useCallback(
    (driverId: string) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            const nextOnline = !d.isOnline;
            showToast(`Driver is now ${nextOnline ? 'ONLINE' : 'OFFLINE'}`);
            return {
              ...d,
              isOnline: nextOnline,
              currentStatus: nextOnline ? 'IDLE' : 'OFFLINE',
            };
          }
          return d;
        })
      );
    },
    [showToast]
  );

  // Approve Driver KYC
  const approveDriverKyc = useCallback(
    (driverId: string) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === driverId) {
            return {
              ...d,
              kycStatus: 'VERIFIED',
              kycDocuments: d.kycDocuments.map((doc) => ({ ...doc, verified: true })),
            };
          }
          return d;
        })
      );
      showToast('Driver documents approved & account activated!');
    },
    [showToast]
  );

  // Reject Driver KYC
  const rejectDriverKyc = useCallback(
    (driverId: string, reason: string) => {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, kycStatus: 'REJECTED' } : d))
      );
      showToast(`Driver KYC rejected: ${reason}`);
    },
    [showToast]
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
    setTrips(INITIAL_TRIPS);
    setDrivers(INITIAL_DRIVERS);
    setVehicleConfigs(VEHICLE_CONFIGS);
    setServiceZones(SERVICE_ZONES);
    setCurrentCustomer(INITIAL_CUSTOMER);
    setCustomerSlabConfigs(DEFAULT_CUSTOMER_SLABS);
    setReferralConfig(DEFAULT_REFERRAL_CONFIG);
    setReferrals(INITIAL_REFERRALS);
    setActiveTripId('trip_cbe_1001');
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
