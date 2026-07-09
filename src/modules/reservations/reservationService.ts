import { auditRepository } from '../audit/auditRepository';
import { eventRepository } from '../events/eventRepository';
import { seatRepository } from '../seats/seatRepository';
import { AppError, assertFound } from '../../shared/errors';
import { addMinutes, isPast, now } from '../../shared/time';
import { reservationRepository } from './reservationRepository';
import { Reservation } from './reservationTypes';

const HOLD_MINUTES = 15;

function expireHeldReservations(tenantId: string, eventId: string): void {
  for (const reservation of reservationRepository.listByEvent(tenantId, eventId)) {
    if (reservation.status === 'held' && isPast(new Date(reservation.expiresAt))) {
      reservation.status = 'expired';
      reservationRepository.save(reservation);
      seatRepository.setStatus(tenantId, reservation.seatIds, 'available');
    }
  }
}

export const reservationService = {
  create(input: { tenantId: string; actorId: string; eventId: string; customerEmail: string; seatIds: string[] }): Reservation {
    const event = assertFound(eventRepository.findById(input.tenantId, input.eventId), 'Event not found');
    if (event.status !== 'published') throw new AppError(409, 'Event must be published before reservations');
    expireHeldReservations(input.tenantId, input.eventId);
    const seats = seatRepository.findByIds(input.tenantId, input.seatIds);
    if (seats.length !== input.seatIds.length) throw new AppError(404, 'One or more seats were not found');
    if (seats.some(s => s.eventId !== input.eventId)) throw new AppError(400, 'Seats must belong to the requested event');
    if (seats.some(s => s.status !== 'available')) throw new AppError(409, 'One or more seats are unavailable');
    seatRepository.setStatus(input.tenantId, input.seatIds, 'held');
    const reservation = reservationRepository.create({ tenantId: input.tenantId, eventId: input.eventId, customerEmail: input.customerEmail, seatIds: input.seatIds, amountCents: seats.length * event.basePriceCents, expiresAt: addMinutes(now(), HOLD_MINUTES).toISOString() });
    auditRepository.add({ tenantId: input.tenantId, action: 'reservation_created', entityId: reservation.id, actorId: input.actorId, metadata: { seatCount: input.seatIds.length } });
    return reservation;
  },
  cancel(tenantId: string, actorId: string, reservationId: string): Reservation {
    const reservation = assertFound(reservationRepository.findById(tenantId, reservationId), 'Reservation not found');
    if (reservation.status === 'paid') throw new AppError(409, 'Paid reservations cannot be cancelled by customer flow');
    if (reservation.status === 'cancelled') return reservation;
    reservation.status = 'cancelled';
    reservation.cancelledAt = now().toISOString();
    seatRepository.setStatus(tenantId, reservation.seatIds, 'available');
    auditRepository.add({ tenantId, action: 'reservation_cancelled', entityId: reservation.id, actorId });
    return reservationRepository.save(reservation);
  },
  expireHeldReservations,
  getAvailableSeats(tenantId: string, eventId: string) {
    expireHeldReservations(tenantId, eventId);
    return seatRepository.listByEvent(tenantId, eventId).filter(s => s.status === 'available');
  }
};
