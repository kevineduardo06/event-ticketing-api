import { nextId } from '../../shared/id';
import { now } from '../../shared/time';
import { Event } from './eventTypes';

const events: Event[] = [];
export const eventRepository = {
  create(input: Omit<Event, 'id' | 'createdAt' | 'status'>): Event {
    const event: Event = { id: nextId('evt'), status: 'draft', createdAt: now().toISOString(), ...input };
    events.push(event);
    return event;
  },
  findById(tenantId: string, id: string): Event | undefined { return events.find(e => e.tenantId === tenantId && e.id === id); },
  save(event: Event): Event { const idx = events.findIndex(e => e.id === event.id && e.tenantId === event.tenantId); if (idx >= 0) events[idx] = event; return event; },
  list(tenantId: string): Event[] { return events.filter(e => e.tenantId === tenantId); },
  reset(): void { events.length = 0; }
};
