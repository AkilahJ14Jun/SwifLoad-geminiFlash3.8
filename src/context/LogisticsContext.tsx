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
} from '@/types/logistics';
import {
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  SERVICE_ZONES,
  VEHICLE_CONFIGS,
  BANGALORE_LANDMARKS,
} from '@/lib/data';
import { calculateDistanceKm, calculateFare, calculateCancellationFee, estimateDurationMins } from '@/lib/pricing';

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
  vehicleConfigs: VehicleConfig[];
  serviceZones: ServiceZone[];
  landmarks: LocationPoint[];
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Actions
  createBooking: (payload: CreateTripPayload) => string;
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
  exportCsvData: (type: 'trips' | 'drivers' | 'finance') => void;
  resetToDemoData: () => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TRIPS = 'swifload_trips_v1';
const LOCAL_STORAGE_KEY_DRIVERS = 'swifload_drivers_v1';
const LOCAL_STORAGE_KEY_VEHICLES = 'swifload_vehicles_v1';
const LOCAL_STORAGE_KEY_ZONES = 'swifload_zones_v1';

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [adminRole, setAdminRole] = useState<AdminRole>('super_admin');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv_01');
  const [activeTripId, setActiveTripId] = useState<string | null>('trip_blr_1001');

  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [drivers, setDrivers] = useState<DriverPartner[]>(INITIAL_DRIVERS);
  const [vehicleConfigs, setVehicleConfigs] = useState<VehicleConfig[]>(VEHICLE_CONFIGS);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>(SERVICE_ZONES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem(LOCAL_STORAGE_KEY_TRIPS);
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
      if (savedDrivers) setDrivers(JSON.parse(savedDrivers));

      const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
      if (savedVehicles) setVehicleConfigs(JSON.parse(savedVehicles));

      const savedZones = localStorage.getItem(LOCAL_STORAGE_KEY_ZONES);
      if (savedZones) setServiceZones(JSON.parse(savedZones));
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
      localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(vehicleConfigs));
    } catch {}
  }, [vehicleConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ZONES, JSON.stringify(serviceZones));
    } catch {}
  }, [serviceZones]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Live Simulated GPS Mover for active in-transit / arriving trips
  useEffect(() => {
    const timer = setInterval(() => {
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.status === 'IN_TRANSIT' && trip.driverLocation) {
            // Interpolate slightly toward drop location
            const target = trip.drop;
            const step = 0.0006;
            const dLat = target.lat - trip.driverLocation.lat;
            const dLng = target.lng - trip.driverLocation.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist > 0.001) {
              const newLat = trip.driverLocation.lat + (dLat / dist) * step;
              const newLng = trip.driverLocation.lng + (dLng / dist) * step;
              return {
                ...trip,
                driverLocation: { lat: newLat, lng: newLng },
              };
            }
          }
          if (trip.status === 'ARRIVING_PICKUP' && trip.driverLocation) {
            // Interpolate toward pickup
            const target = trip.pickup;
            const step = 0.0006;
            const dLat = target.lat - trip.driverLocation.lat;
            const dLng = target.lng - trip.driverLocation.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist > 0.001) {
              const newLat = trip.driverLocation.lat + (dLat / dist) * step;
              const newLng = trip.driverLocation.lng + (dLng / dist) * step;
              return {
                ...trip,
                driverLocation: { lat: newLat, lng: newLng },
              };
            }
          }
          return trip;
        })
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Create a new booking
  const createBooking = useCallback(
    (payload: CreateTripPayload): string => {
      const distanceKm = calculateDistanceKm(payload.pickup, payload.drop);
      const durationMins = estimateDurationMins(distanceKm);
      const fare = calculateFare(
        payload.vehicleCategory,
        distanceKm,
        payload.hasHelperRequired,
        vehicleConfigs,
        serviceZones,
        payload.pickup,
        payload.drop
      );

      const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const tripId = `trip_blr_${Date.now()}`;
      const bookingCode = `SWF-${Math.floor(1000 + Math.random() * 9000)}`;

      // Find an eligible online driver matching vehicle category
      const eligibleDriver = drivers.find(
        (d) => d.isOnline && d.currentStatus === 'IDLE' && d.vehicleCategory === payload.vehicleCategory && d.kycStatus === 'VERIFIED'
      );

      const newTrip: Trip = {
        id: tripId,
        bookingCode,
        createdAt: new Date().toISOString(),
        scheduledTime: payload.scheduledTime || 'Instant Now',
        customerId: 'cust_curr',
        customerName: payload.customerName || 'Customer',
        customerPhone: payload.customerPhone || '+91 98450 00000',
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
        status: eligibleDriver ? 'DRIVER_ASSIGNED' : 'SEARCHING',
        driverId: eligibleDriver?.id,
        driverName: eligibleDriver?.name,
        driverPhone: eligibleDriver?.phone,
        driverVehicleNumber: eligibleDriver?.vehicleNumber,
        driverRating: eligibleDriver?.rating,
        driverLocation: eligibleDriver?.currentLocation,
        auditHistory: [
          {
            timestamp: new Date().toISOString(),
            event: `Booking initiated for ${payload.vehicleCategory}`,
            actor: payload.customerName || 'Customer',
          },
          ...(eligibleDriver
            ? [
                {
                  timestamp: new Date().toISOString(),
                  event: `Auto-allocated driver ${eligibleDriver.name}`,
                  actor: 'Dispatch System',
                },
              ]
            : []),
        ],
      };

      setTrips((prev) => [newTrip, ...prev]);
      setActiveTripId(tripId);

      // If driver allocated, mark them as BUSY
      if (eligibleDriver) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === eligibleDriver.id ? { ...d, currentStatus: 'BUSY' } : d))
        );
      }

      showToast(`Trip ${bookingCode} created successfully!`);
      return tripId;
    },
    [drivers, vehicleConfigs, serviceZones, showToast]
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

            // Update driver wallet & stats
            if (t.driverId) {
              setDrivers((dList) =>
                dList.map((d) => {
                  if (d.id === t.driverId) {
                    return {
                      ...d,
                      currentStatus: 'IDLE',
                      totalTrips: d.totalTrips + 1,
                      wallet: {
                        ...d.wallet,
                        balance: d.wallet.balance + t.fare.driverEarnings,
                        todayEarnings: d.wallet.todayEarnings + t.fare.driverEarnings,
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
    (type: 'trips' | 'drivers' | 'finance') => {
      let csvContent = '';
      if (type === 'trips') {
        csvContent = 'TripID,BookingCode,Date,Customer,Vehicle,Pickup,Drop,DistanceKm,TotalFare,Driver,Status\n';
        trips.forEach((t) => {
          csvContent += `"${t.id}","${t.bookingCode}","${t.createdAt.slice(0, 10)}","${t.customerName}","${t.vehicleCategory}","${t.pickup.area}","${t.drop.area}",${t.distanceKm},${t.fare.totalFare},"${t.driverName || 'N/A'}","${t.status}"\n`;
        });
      } else if (type === 'drivers') {
        csvContent = 'DriverID,Name,Phone,VehicleCategory,VehicleNumber,Status,KYC,Rating,TotalTrips,WalletBalance\n';
        drivers.forEach((d) => {
          csvContent += `"${d.id}","${d.name}","${d.phone}","${d.vehicleCategory}","${d.vehicleNumber}","${d.isOnline ? 'ONLINE' : 'OFFLINE'}","${d.kycStatus}",${d.rating},${d.totalTrips},${d.wallet.balance}\n`;
        });
      } else {
        csvContent = 'TripID,BookingCode,PaymentMethod,PaymentStatus,GMV,PlatformCommission,DriverEarnings,GST\n';
        trips.forEach((t) => {
          csvContent += `"${t.id}","${t.bookingCode}","${t.paymentMethod}","${t.paymentStatus}",${t.fare.totalFare},${t.fare.platformCommission},${t.fare.driverEarnings},${t.fare.taxGst}\n`;
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
    [trips, drivers, showToast]
  );

  const resetToDemoData = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRIPS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DRIVERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_VEHICLES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ZONES);
    setTrips(INITIAL_TRIPS);
    setDrivers(INITIAL_DRIVERS);
    setVehicleConfigs(VEHICLE_CONFIGS);
    setServiceZones(SERVICE_ZONES);
    setActiveTripId('trip_blr_1001');
    showToast('Reset to default Bangalore Starter MVP demo data!');
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
        vehicleConfigs,
        serviceZones,
        landmarks: BANGALORE_LANDMARKS,
        toastMessage,
        showToast,
        createBooking,
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
