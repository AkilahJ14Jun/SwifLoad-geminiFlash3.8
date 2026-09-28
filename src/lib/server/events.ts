import { EventEmitter } from 'events';

// Global singleton event emitter to survive hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __swifloadEventEmitter: EventEmitter | undefined;
}

if (!global.__swifloadEventEmitter) {
  global.__swifloadEventEmitter = new EventEmitter();
  global.__swifloadEventEmitter.setMaxListeners(200);
}

export const eventBus = global.__swifloadEventEmitter;

export type EventType =
  | 'TRIP_CREATED'
  | 'TRIP_UPDATED'
  | 'DRIVER_UPDATED'
  | 'WALLET_UPDATED'
  | 'CONFIG_UPDATED'
  | 'STATE_SYNC'
  | 'SYSTEM_RESET';

export interface RealtimePayload {
  type: EventType;
  timestamp: string;
  data?: any;
}

export function broadcastEvent(type: EventType, data?: any): void {
  const payload: RealtimePayload = {
    type,
    timestamp: new Date().toISOString(),
    data,
  };
  eventBus.emit('change', payload);
}
