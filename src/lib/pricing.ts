import {
  FareBreakdown,
  LocationPoint,
  ServiceZone,
  VehicleCategory,
  VehicleConfig,
  CustomerType,
  CustomerTypeSlabConfig,
  DistanceSlab,
  DriverPartner,
  SlabBreakdownItem,
} from '@/types/logistics';
import { DEFAULT_CUSTOMER_SLABS, SERVICE_ZONES, VEHICLE_CONFIGS } from './data';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 * multiplied by an urban Coimbatore road network tortuosity factor (~1.25x)
 */
export function calculateDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  
  // Road network factor for Coimbatore city traffic routing
  const roadDistance = straightDistance * 1.25;
  return Math.max(1.0, Math.round(roadDistance * 10) / 10);
}

/**
 * Estimated travel duration based on Coimbatore urban traffic (avg speed 22-26 km/h)
 */
export function estimateDurationMins(distanceKm: number): number {
  const avgSpeedKmh = 24;
  const mins = (distanceKm / avgSpeedKmh) * 60 + 4; // 4 min buffer
  return Math.max(8, Math.round(mins));
}

/**
 * Find highest surge multiplier among pickup and drop service zones
 */
export function detectZoneSurge(pickup: LocationPoint, drop: LocationPoint, zones: ServiceZone[]): number {
  let surge = 1.0;
  for (const zone of zones) {
    if (!zone.isActive) continue;
    const distToPickup = calculateDistanceKm(zone.center, pickup);
    const distToDrop = calculateDistanceKm(zone.center, drop);
    if (distToPickup <= zone.radiusKm || distToDrop <= zone.radiusKm) {
      if (zone.surgeMultiplier > surge) {
        surge = zone.surgeMultiplier;
      }
    }
  }
  return surge;
}

/**
 * Marginal / incremental distance slab fare calculation.
 * Rate per kilometer is applied in slab distance rates.
 * e.g., 0 to 1 km flat minimum price, 1 to 3 km another price, 3 to 5 km another price.
 */
export function calculateSlabDistanceFare(
  distanceKm: number,
  slabs: DistanceSlab[]
): {
  baseFare: number;
  distanceFare: number;
  totalSlabCost: number;
  breakdown: SlabBreakdownItem[];
} {
  const sortedSlabs = [...slabs].sort((a, b) => a.fromKm - b.fromKm);
  let totalCost = 0;
  let baseFare = 0;
  let distanceFare = 0;
  const breakdown: SlabBreakdownItem[] = [];

  for (const slab of sortedSlabs) {
    if (distanceKm <= slab.fromKm) break;

    const slabCapacity = slab.toKm - slab.fromKm;
    const kmInThisSlab = Math.min(Math.max(0, distanceKm - slab.fromKm), slabCapacity);

    if (kmInThisSlab > 0 || (slab.fromKm === 0 && distanceKm >= 0 && slab.rateType === 'flat')) {
      let cost = 0;
      if (slab.rateType === 'flat') {
        cost = slab.rate;
        baseFare += cost;
      } else {
        cost = kmInThisSlab * slab.rate;
        distanceFare += cost;
      }
      totalCost += cost;
      breakdown.push({
        slabLabel: slab.label,
        fromKm: slab.fromKm,
        toKm: slab.toKm,
        kmInSlab: Math.round(kmInThisSlab * 10) / 10,
        rate: slab.rate,
        rateType: slab.rateType,
        cost: Math.round(cost * 10) / 10,
      });
    }
  }

  return {
    baseFare: Math.round(baseFare * 10) / 10,
    distanceFare: Math.round(distanceFare * 10) / 10,
    totalSlabCost: Math.round(totalCost * 10) / 10,
    breakdown,
  };
}

/**
 * Customer Quote Calculation:
 * Quoted based on the driver who is the most distance in the closest range for the customer.
 * This guarantees the customer does not feel uncomfortable if a lesser price is shown initially
 * and later charged more because a different driver accepted the task.
 * Also returns an explicit warning/notice message for the customer.
 */
export function calculateCustomerQuotedSlabFare(
  tripDistanceKm: number,
  customerType: CustomerType = 'regular',
  pickup: LocationPoint,
  drop: LocationPoint,
  allDrivers: DriverPartner[] = [],
  customerSlabConfigs: CustomerTypeSlabConfig[] = DEFAULT_CUSTOMER_SLABS,
  hasHelper: boolean = false,
  vehicleCategory: VehicleCategory = 'tata_ace',
  customVehicleConfigs: VehicleConfig[] = VEHICLE_CONFIGS,
  serviceZones: ServiceZone[] = SERVICE_ZONES
): FareBreakdown {
  const slabConfig =
    customerSlabConfigs.find((c) => c.customerType === customerType) || customerSlabConfigs[0];
  const vehicle = customVehicleConfigs.find((v) => v.id === vehicleCategory) || customVehicleConfigs[0];

  // Find drivers in range of customer pickup (within 8km)
  const nearbyDrivers = allDrivers.filter((d) => d.isOnline && d.currentStatus !== 'BUSY');
  let farthestDriverDistanceKm = 2.0; // Default baseline driver approach buffer

  if (nearbyDrivers.length > 0) {
    const driverDistances = nearbyDrivers.map((d) => calculateDistanceKm(d.currentLocation, pickup));
    const inRangeDistances = driverDistances.filter((d) => d <= 8.0);
    if (inRangeDistances.length > 0) {
      farthestDriverDistanceKm = Math.max(...inRangeDistances);
    }
  }

  // Total billable slab distance = Farthest driver to pickup + Pickup to Drop
  const totalSlabDistanceKm = Math.round((farthestDriverDistanceKm + tripDistanceKm) * 10) / 10;
  const slabResult = calculateSlabDistanceFare(totalSlabDistanceKm, slabConfig.slabs);

  const zoneSurge = detectZoneSurge(pickup, drop, serviceZones);
  const surgeMultiplier = Math.max(vehicle.surgeMultiplier, zoneSurge);

  const helperFee = hasHelper ? vehicle.helperFee : 0;
  const subtotalBeforeSurge = slabResult.totalSlabCost + helperFee;
  const surgeFare = surgeMultiplier > 1.0 ? Math.round(subtotalBeforeSurge * (surgeMultiplier - 1.0)) : 0;

  const subtotal = subtotalBeforeSurge + surgeFare;
  const taxGst = Math.round(subtotal * 0.05 * 10) / 10;
  const totalFare = Math.round((subtotal + taxGst) * 10) / 10;

  const commissionRate = 0.18;
  const platformCommission = Math.round(subtotal * commissionRate);
  const driverEarnings = Math.round(totalFare - platformCommission);

  return {
    baseFare: slabResult.baseFare,
    distanceFare: slabResult.distanceFare,
    waitingFare: 0,
    helperFee,
    surgeFare,
    taxGst,
    totalFare,
    platformCommission,
    driverEarnings,
    slabBreakdown: slabResult.breakdown,
    farthestDriverDistanceKm,
    totalSlabDistanceKm,
    pricingNotice: `Prices shown can vary. Quoted based on the farthest driver in your pickup range (${farthestDriverDistanceKm} km away) to guarantee no surprise fare increases when a driver accepts.`,
  };
}

/**
 * Driver Task Payout Calculation:
 * Based on the distance from driver location to customer pickup and drop locations.
 * Charges are calculated and shown in the pop up for each driver based on slab rates.
 * (e.g., Driver 1 km away gets Rs. 68, Driver 2 km away gets Rs. 74).
 */
export function calculateDriverTaskPayout(
  driverLocation: { lat: number; lng: number },
  pickup: LocationPoint,
  tripDistanceKm: number,
  customerType: CustomerType = 'regular',
  customerSlabConfigs: CustomerTypeSlabConfig[] = DEFAULT_CUSTOMER_SLABS
): {
  driverDistanceToPickupKm: number;
  driverToPickupKm: number;
  tripDistanceKm: number;
  totalDistanceKm: number;
  grossFare: number;
  driverEarnings: number;
  netEarnings: number;
  slabBreakdown: SlabBreakdownItem[];
  breakdown: SlabBreakdownItem[];
} {
  const slabConfig =
    customerSlabConfigs.find((c) => c.customerType === customerType) || customerSlabConfigs[0];
  const driverDistanceToPickupKm = Math.round(calculateDistanceKm(driverLocation, pickup) * 10) / 10;
  const totalDistanceKm = Math.round((driverDistanceToPickupKm + tripDistanceKm) * 10) / 10;

  const slabResult = calculateSlabDistanceFare(totalDistanceKm, slabConfig.slabs);
  const grossFare = slabResult.totalSlabCost;
  const platformCommission = Math.round(grossFare * 0.18);
  const netEarnings = grossFare - platformCommission;

  return {
    driverDistanceToPickupKm,
    driverToPickupKm: driverDistanceToPickupKm,
    tripDistanceKm,
    totalDistanceKm,
    grossFare,
    driverEarnings: grossFare,
    netEarnings,
    slabBreakdown: slabResult.breakdown,
    breakdown: slabResult.breakdown,
  };
}

/**
 * Legacy / vehicle-config dynamic fare calculation engine
 */
export function calculateFare(
  vehicleCategory: VehicleCategory,
  distanceKm: number,
  hasHelper: boolean,
  customVehicleConfigs: VehicleConfig[] = VEHICLE_CONFIGS,
  serviceZones: ServiceZone[] = SERVICE_ZONES,
  pickup?: LocationPoint,
  drop?: LocationPoint
): FareBreakdown {
  const vehicle = customVehicleConfigs.find((v) => v.id === vehicleCategory) || customVehicleConfigs[0];
  const zoneSurge = (pickup && drop) ? detectZoneSurge(pickup, drop, serviceZones) : 1.0;
  const surgeMultiplier = Math.max(vehicle.surgeMultiplier, zoneSurge);

  const baseFare = vehicle.baseFare;
  const billableDistanceKm = Math.max(0, distanceKm - vehicle.baseKm);
  const distanceFare = Math.round(billableDistanceKm * vehicle.perKmRate);
  const helperFee = hasHelper ? vehicle.helperFee : 0;
  const waitingFare = 0;

  const subtotalBeforeSurge = baseFare + distanceFare + helperFee;
  const surgeFare = surgeMultiplier > 1.0 ? Math.round(subtotalBeforeSurge * (surgeMultiplier - 1.0)) : 0;
  
  const subtotal = subtotalBeforeSurge + surgeFare;
  const taxGst = Math.round(subtotal * 0.05 * 10) / 10; // 5% logistics GST
  const totalFare = Math.round((subtotal + taxGst) * 10) / 10;

  const commissionRate = 0.18; // 18% SwifLoad platform fee
  const platformCommission = Math.round(subtotal * commissionRate);
  const driverEarnings = Math.round(totalFare - platformCommission);

  return {
    baseFare,
    distanceFare,
    waitingFare,
    helperFee,
    surgeFare,
    taxGst,
    totalFare,
    platformCommission,
    driverEarnings,
  };
}

export function calculateCancellationFee(status: string, vehicleCategory: VehicleCategory): number {
  if (status === 'SEARCHING') return 0;
  if (status === 'DRIVER_ASSIGNED' || status === 'ARRIVING_PICKUP') {
    return vehicleCategory === '2wheeler' ? 30 : 75;
  }
  if (status === 'AT_PICKUP') {
    return vehicleCategory === '2wheeler' ? 50 : 120;
  }
  return 0;
}

