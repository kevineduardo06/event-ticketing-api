import { auditRepository } from '../audit/auditRepository';
import { reservationRepository } from '../reservations/reservationRepository';
import { AppError, assertFound } from '../../shared/errors';
import { checkinRepository } from './checkinRepository';
import { CheckIn } from './checkinTypes';

export const checkinService = {
  record(input: { tenantId: string; actorId: string; reservationId: string }): CheckIn {
    const existing = checkinRepository.findByReservation(input.tenantId, input.reservationId);
    if (existing) return existing;
    const reservation = assertFound(reservationRepository.findById(input.tenantId, input.reservationId), 'Reservation not found');
    if (reservation.status !== 'paid') throw new AppError(409, 'Only paid reservations can be checked in');
    const checkin = checkinRepository.create(input);
    auditRepository.add({ tenantId: input.tenantId, action: 'checkin_recorded', entityId: checkin.id, actorId: input.actorId, metadata: { reservationId: input.reservationId } });
    return checkin;
  }
};
