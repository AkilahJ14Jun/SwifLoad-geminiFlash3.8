import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';
import { DriverPartner } from '@/types/logistics';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = getDatabase();
  const driver = db.drivers.find((d) => d.id === params.id);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
  }
  return NextResponse.json(driver);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<DriverPartner> = await req.json();
    const db = getDatabase();
    const index = db.drivers.findIndex((d) => d.id === params.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    db.drivers[index] = {
      ...db.drivers[index],
      ...updates,
    };

    saveDatabase(db);
    broadcastEvent('DRIVER_UPDATED', db.drivers[index]);

    return NextResponse.json({ success: true, driver: db.drivers[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
