import { NextResponse } from 'next/server';
import { getDatabase, resetDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'reset') {
      const resetData = resetDatabase();
      broadcastEvent('SYSTEM_RESET', resetData);
      return NextResponse.json({ success: true, message: 'Database reset to demo state', data: resetData });
    }

    if (body.action === 'sync') {
      const current = getDatabase();
      const updated = { ...current, ...body.data };
      saveDatabase(updated);
      broadcastEvent('STATE_SYNC', updated);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
