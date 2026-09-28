import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';
import { DriverPartner } from '@/types/logistics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.drivers);
}

export async function POST(req: Request) {
  try {
    const driver: DriverPartner = await req.json();
    const db = getDatabase();

    const existingIndex = db.drivers.findIndex((d) => d.id === driver.id || d.phone === driver.phone);
    if (existingIndex >= 0) {
      db.drivers[existingIndex] = driver;
    } else {
      db.drivers.unshift(driver);
    }

    saveDatabase(db);
    broadcastEvent('DRIVER_UPDATED', driver);

    return NextResponse.json({ success: true, driver });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
