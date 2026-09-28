import fs from 'fs';
import path from 'path';
import {
  Trip,
  DriverPartner,
  VehicleConfig,
  ServiceZone,
  DriverGroup,
  CustomerTypeSlabConfig,
  ReferralProgramConfig,
  ReferralRecord,
  CustomerUser,
} from '@/types/logistics';
import {
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  SERVICE_ZONES,
  VEHICLE_CONFIGS,
  DRIVER_GROUPS,
  DEFAULT_CUSTOMER_SLABS,
  DEFAULT_REFERRAL_CONFIG,
  INITIAL_REFERRALS,
} from '@/lib/data';

export interface DatabaseSchema {
  trips: Trip[];
  drivers: DriverPartner[];
  driverGroups: DriverGroup[];
  vehicleConfigs: VehicleConfig[];
  serviceZones: ServiceZone[];
  customerSlabConfigs: CustomerTypeSlabConfig[];
  referralConfig: ReferralProgramConfig;
  referrals: ReferralRecord[];
  customer: CustomerUser;
  lastUpdated: string;
}

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

const getDbPath = (): string => {
  // Use Azure App Service persistent storage /home/data if running on Azure, otherwise ./data
  const isAzure = process.env.WEBSITE_SITE_NAME || process.env.AZURE_APP_SERVICE;
  const dir = isAzure ? path.join('/home', 'data') : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      return path.join(process.cwd(), 'data', 'swifload-db.json');
    }
  }
  return path.join(dir, 'swifload-db.json');
};

let inMemoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'utf-8');
      inMemoryDb = JSON.parse(content);
      return inMemoryDb!;
    } catch (err) {
      console.error('Error reading DB file, reinitializing default:', err);
    }
  }

  inMemoryDb = {
    trips: INITIAL_TRIPS,
    drivers: INITIAL_DRIVERS,
    driverGroups: DRIVER_GROUPS,
    vehicleConfigs: VEHICLE_CONFIGS,
    serviceZones: SERVICE_ZONES,
    customerSlabConfigs: DEFAULT_CUSTOMER_SLABS,
    referralConfig: DEFAULT_REFERRAL_CONFIG,
    referrals: INITIAL_REFERRALS,
    customer: INITIAL_CUSTOMER,
    lastUpdated: new Date().toISOString(),
  };

  saveDatabase(inMemoryDb);
  return inMemoryDb;
}

export function saveDatabase(data: DatabaseSchema): void {
  inMemoryDb = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  const dbPath = getDbPath();
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

export function resetDatabase(): DatabaseSchema {
  inMemoryDb = {
    trips: INITIAL_TRIPS,
    drivers: INITIAL_DRIVERS,
    driverGroups: DRIVER_GROUPS,
    vehicleConfigs: VEHICLE_CONFIGS,
    serviceZones: SERVICE_ZONES,
    customerSlabConfigs: DEFAULT_CUSTOMER_SLABS,
    referralConfig: DEFAULT_REFERRAL_CONFIG,
    referrals: INITIAL_REFERRALS,
    customer: INITIAL_CUSTOMER,
    lastUpdated: new Date().toISOString(),
  };
  saveDatabase(inMemoryDb);
  return inMemoryDb;
}
