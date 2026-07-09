import { auditRepository } from '../audit/auditRepository';
import { seatRepository } from '../seats/seatRepository';
import { AppError, assertFound } from '../../shared/errors';
import { eventRepository } from './eventRepository';
import { Event } from './eventTypes';

export const eventService = {
  createEvent(input: { tenantId: string; actorId: string; name: string; startsAt: string; basePriceCents: number; seats: Array<{ section: string; row: string; numbers: number[] }> }): Event {
    if (input.basePriceCents <= 0) throw new AppError(400, 'Base price must be positive');
    const event = eventRepository.create({ tenantId: input.tenantId, name: input.name, startsAt: input.startsAt, basePriceCents: input.basePriceCents });
    for (const group of input.seats) seatRepository.createMany({ tenantId: input.tenantId, eventId: event.id, ...group });
    auditRepository.add({ tenantId: input.tenantId, action: 'event_created', entityId: event.id, actorId: input.actorId });
    return event;
  },
  publish(tenantId: string, actorId: string, eventId: string): Event {
    const event = assertFound(eventRepository.findById(tenantId, eventId), 'Event not found');
    if (event.status !== 'draft') throw new AppError(409, 'Only draft events can be published');
    event.status = 'published';
    auditRepository.add({ tenantId, action: 'event_published', entityId: event.id, actorId });
    return eventRepository.save(event);
  }
};
