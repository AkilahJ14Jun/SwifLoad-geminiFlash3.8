import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';
import { Trip } from '@/types/logistics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.trips);
}

export async function POST(req: Request) {
  try {
    const trip: Trip = await req.json();
    const db = getDatabase();

    // Check if trip already exists
    const existingIndex = db.trips.findIndex((t) => t.id === trip.id);
    if (existingIndex >= 0) {
      db.trips[existingIndex] = trip;
    } else {
      db.trips.unshift(trip);
    }

    saveDatabase(db);
    broadcastEvent('TRIP_CREATED', trip);

    return NextResponse.json({ success: true, trip });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
