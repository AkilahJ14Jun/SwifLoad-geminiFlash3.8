import { NextRequest } from 'next/server';
import { eventBus, RealtimePayload } from '@/lib/server/events';
import { getDatabase } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event with current state summary
      const db = getDatabase();
      const initialPayload: RealtimePayload = {
        type: 'STATE_SYNC',
        timestamp: new Date().toISOString(),
        data: db,
      };

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialPayload)}\n\n`));

      const onEvent = (payload: RealtimePayload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          console.error('Error streaming event to client:', err);
        }
      };

      eventBus.on('change', onEvent);

      // Heartbeat every 20 seconds to keep connection alive through Azure load balancers / proxies
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 20000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatTimer);
        eventBus.off('change', onEvent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
