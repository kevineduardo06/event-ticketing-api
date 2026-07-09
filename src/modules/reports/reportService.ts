import { checkinRepository } from '../checkins/checkinRepository';
import { eventRepository } from '../events/eventRepository';
import { paymentRepository } from '../payments/paymentRepository';
import { reservationRepository } from '../reservations/reservationRepository';
import { seatRepository } from '../seats/seatRepository';
import { assertFound } from '../../shared/errors';

export const reportService = {
  eventSummary(tenantId: string, eventId: string) {
    const event = assertFound(eventRepository.findById(tenantId, eventId), 'Event not found');
    const reservations = reservationRepository.listByEvent(tenantId, eventId);
    const seats = seatRepository.listByEvent(tenantId, eventId);
    const paidReservations = reservations.filter(r => r.status === 'paid');
    const payments = paymentRepository.listByTenant(tenantId).filter(p => paidReservations.some(r => r.id === p.reservationId));
    const checkins = checkinRepository.listByTenant(tenantId).filter(c => paidReservations.some(r => r.id === c.reservationId));
    return { eventId: event.id, status: event.status, totalSeats: seats.length, availableSeats: seats.filter(s => s.status === 'available').length, heldSeats: seats.filter(s => s.status === 'held').length, soldSeats: seats.filter(s => s.status === 'sold').length, grossSalesCents: payments.reduce((sum, p) => sum + p.amountCents, 0), reservationsByStatus: reservations.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {}), checkedInCount: checkins.length };
  }
};
