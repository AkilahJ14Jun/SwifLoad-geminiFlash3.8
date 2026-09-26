export type UserRole = 'customer' | 'driver' | 'admin';
export type AdminRole = 'super_admin' | 'dispatcher' | 'support' | 'finance';

export type VehicleCategory = '2wheeler' | '3wheeler' | 'tata_ace' | 'pickup_8ft';

export interface VehicleConfig {
  id: VehicleCategory;
  name: string;
  tagline: string;
  capacityKg: number;
  dimensions: string;
  icon: string;
  baseFare: number;
  baseKm: number;
  perKmRate: number;
  waitingChargePerMin: number;
  helperFee: number;
  surgeMultiplier: number;
}

export type GoodsCategory = 
  | 'Electronics & Appliances'
  | 'Furniture & Home Decor'
  | 'Groceries & Perishables'
  | 'Hardware & Building Materials'
  | 'Textiles & Garments'
  | 'Documents & Small Parcels'
  | 'Industrial Equipment'
  | 'Other Goods';

export type TripStatus =
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'ARRIVING_PICKUP'
  | 'AT_PICKUP'
  | 'IN_TRANSIT'
  | 'ARRIVED_DESTINATION'
  | 'DELIVERED'
  | 'CANCELLED';

export type CustomerType = 'new' | 'regular' | 'multi_pickup' | 'corporate';

export type PaymentMethod = 'UPI_GPAY' | 'UPI_PHONEPE' | 'NETBANKING_IMPS' | 'CASH_ON_DELIVERY' | 'WALLET';

export interface LocationPoint {
  address: string;
  area: string;
  lat: number;
  lng: number;
  landmark?: string;
  senderOrReceiverName?: string;
  contactPhone?: string;
}

export interface ShipmentDetails {
  goodsCategory: GoodsCategory;
  approxWeightKg: number;
  packageCount?: number;
  hasHelperRequired: boolean;
  notes?: string;
  cargoPhotoUrl?: string;
  pickupOtp: string;
  deliveryOtp: string;
  proofOfDeliveryPhoto?: string;
}

export interface SlabBreakdownItem {
  slabLabel: string;
  fromKm: number;
  toKm: number;
  kmInSlab: number;
  rate: number;
  rateType: 'flat' | 'per_km';
  cost: number;
}

export interface DistanceSlab {
  id: string;
  fromKm: number;
  toKm: number;
  rate: number;
  rateType: 'flat' | 'per_km';
  label: string;
}

export interface CustomerTypeSlabConfig {
  customerType: CustomerType;
  customerTypeName: string;
  description: string;
  slabs: DistanceSlab[];
}

export interface ReferralProgramConfig {
  driverToDriverBonus: number;
  driverToCustomerBonus: number;
  customerToCustomerReferrerBonus: number;
  customerToCustomerRefereeBonus: number;
}

export interface ReferralRecord {
  id: string;
  type: 'DRIVER_TO_DRIVER' | 'DRIVER_TO_CUSTOMER' | 'CUSTOMER_TO_CUSTOMER';
  referrerId: string;
  referrerName: string;
  referrerRole: 'driver' | 'customer';
  refereeId: string;
  refereeName: string;
  refereePhone?: string;
  refereeRole: 'driver' | 'customer';
  bonusAmount: number;
  status: 'PENDING' | 'CREDITED';
  createdAt: string;
  creditedAt?: string;
  notes?: string;
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  category:
    | 'TRIP_EARNING'
    | 'TRIP_PAYMENT'
    | 'REFERRAL_BONUS'
    | 'TOPUP'
    | 'PAYOUT'
    | 'COMMISSION_DEDUCTION'
    | 'ADMIN_ADJUSTMENT';
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  waitingFare: number;
  helperFee: number;
  surgeFare: number;
  taxGst: number;
  totalFare: number;
  platformCommission: number;
  driverEarnings: number;
  slabBreakdown?: SlabBreakdownItem[];
  pricingNotice?: string;
  farthestDriverDistanceKm?: number;
  totalSlabDistanceKm?: number;
}

export interface Trip {
  id: string;
  bookingCode: string;
  createdAt: string;
  scheduledTime?: string; // 'Instant' or ISO
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType?: CustomerType;
  vehicleCategory: VehicleCategory;
  pickup: LocationPoint;
  drop: LocationPoint;
  distanceKm: number;
  durationMins: number;
  shipment: ShipmentDetails;
  fare: FareBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: TripStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicleNumber?: string;
  driverRating?: number;
  driverLocation?: { lat: number; lng: number };
  driverToPickupDistanceKm?: number;
  totalSlabDistanceKm?: number;
  currentDispatchGroupId?: string;
  currentDispatchGroupName?: string;
  dispatchGroupSequence?: string[];
  currentDispatchGroupIndex?: number;
  dispatchCountdownSecs?: number;
  cancellationReason?: string;
  cancellationCharge?: number;
  customerRating?: number;
  customerFeedback?: string;
  internalNotes?: string[];
  auditHistory: {
    timestamp: string;
    event: string;
    actor: string;
  }[];
}

export interface DriverGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  locationRange: string;
  center: { lat: number; lng: number };
  radiusKm: number;
}

export interface DriverKycDoc {
  docType: 'DRIVING_LICENSE' | 'RC_BOOK' | 'VEHICLE_INSURANCE' | 'AADHAAR' | 'BANK_PASSBOOK';
  docNumber: string;
  fileUrl: string;
  verified: boolean;
}

export interface DriverPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  groupId: string;
  groupName: string;
  locationRange: string;
  vehicleCategory: VehicleCategory;
  vehicleModel: string;
  vehicleNumber: string;
  isOnline: boolean;
  currentStatus: 'IDLE' | 'BUSY' | 'OFFLINE';
  currentLocation: { lat: number; lng: number };
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycDocuments: DriverKycDoc[];
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  referralCode: string;
  wallet: {
    balance: number; // Negative balance permitted up to -negativeBalanceLimit
    negativeBalanceLimit: number; // Pre-determined limit fixed for each driver
    todayEarnings: number;
    pendingPayout: number;
    transactions: WalletTransaction[];
  };
}

export interface ServiceZone {
  id: string;
  name: string;
  city: string;
  center: { lat: number; lng: number };
  radiusKm: number;
  isActive: boolean;
  surgeMultiplier: number;
  pincodes: string[];
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  customerType: CustomerType;
  referralCode: string;
  referredBy?: string;
  isLoggedIn: boolean;
  savedAddresses?: LocationPoint[];
  wallet: {
    balance: number; // Negative balance NOT allowed for customer
    transactions: WalletTransaction[];
  };
}

export interface RegisterDriverPayload {
  name: string;
  phone: string;
  email: string;
  vehicleCategory: VehicleCategory;
  vehicleModel: string;
  vehicleNumber: string;
  licenseNumber: string;
  rcNumber: string;
  insuranceNumber: string;
  aadhaarNumber: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  referredByCode?: string;
}

