import { FareBreakdown, LocationPoint, ServiceZone, VehicleCategory, VehicleConfig } from '@/types/logistics';
import { SERVICE_ZONES, VEHICLE_CONFIGS } from './data';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 * multiplied by an urban Bangalore road network tortuosity factor (~1.3x)
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
  
  // Road network factor for Bangalore city traffic routing
  const roadDistance = straightDistance * 1.32;
  return Math.max(1.0, Math.round(roadDistance * 10) / 10);
}

/**
 * Estimated travel duration based on Bangalore urban traffic (avg speed 18-22 km/h)
 */
export function estimateDurationMins(distanceKm: number): number {
  const avgSpeedKmh = 20;
  const mins = (distanceKm / avgSpeedKmh) * 60 + 5; // 5 min buffer
  return Math.max(10, Math.round(mins));
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
 * Comprehensive dynamic fare calculation engine
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
