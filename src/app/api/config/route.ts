import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    if (body.type === 'slabs') {
      db.customerSlabConfigs = body.slabs;
    } else if (body.type === 'referralConfig') {
      db.referralConfig = body.referralConfig;
    } else if (body.type === 'referrals') {
      db.referrals = body.referrals;
    } else if (body.type === 'serviceZones') {
      db.serviceZones = body.serviceZones;
    } else if (body.type === 'vehicleConfigs') {
      db.vehicleConfigs = body.vehicleConfigs;
    }

    saveDatabase(db);
    broadcastEvent('CONFIG_UPDATED', { type: body.type, data: body });

    return NextResponse.json({ success: true, db });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
