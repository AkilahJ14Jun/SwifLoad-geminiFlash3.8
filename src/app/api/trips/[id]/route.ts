import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';
import { Trip } from '@/types/logistics';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = getDatabase();
  const trip = db.trips.find((t) => t.id === params.id);
  if (!trip) {
    return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
  }
  return NextResponse.json(trip);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<Trip> = await req.json();
    const db = getDatabase();
    const index = db.trips.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    db.trips[index] = {
      ...db.trips[index],
      ...updates,
    };

    saveDatabase(db);
    broadcastEvent('TRIP_UPDATED', db.trips[index]);

    return NextResponse.json({ success: true, trip: db.trips[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
