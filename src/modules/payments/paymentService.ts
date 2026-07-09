import { auditRepository } from '../audit/auditRepository';
import { reservationRepository } from '../reservations/reservationRepository';
import { seatRepository } from '../seats/seatRepository';
import { AppError, assertFound } from '../../shared/errors';
import { isPast, now } from '../../shared/time';
import { paymentRepository } from './paymentRepository';
import { Payment } from './paymentTypes';

export const paymentService = {
  capture(input: { tenantId: string; actorId: string; reservationId: string; amountCents: number; idempotencyKey: string }): Payment {
    const existing = paymentRepository.findByIdempotencyKey(input.tenantId, input.idempotencyKey);
    if (existing) {
      if (existing.reservationId !== input.reservationId || existing.amountCents !== input.amountCents) throw new AppError(409, 'Idempotency key already used with different payload');
      return existing;
    }
    const reservation = assertFound(reservationRepository.findById(input.tenantId, input.reservationId), 'Reservation not found');
    if (reservation.status !== 'held') throw new AppError(409, 'Only held reservations can be paid');
    if (isPast(new Date(reservation.expiresAt))) {
      reservation.status = 'expired';
      reservationRepository.save(reservation);
      seatRepository.setStatus(input.tenantId, reservation.seatIds, 'available');
      throw new AppError(409, 'Reservation expired');
    }
    if (input.amountCents !== reservation.amountCents) throw new AppError(400, 'Payment amount does not match reservation amount');
    const payment = paymentRepository.create({ tenantId: input.tenantId, reservationId: input.reservationId, amountCents: input.amountCents, idempotencyKey: input.idempotencyKey });
    reservation.status = 'paid';
    reservation.paidAt = now().toISOString();
    reservationRepository.save(reservation);
    seatRepository.setStatus(input.tenantId, reservation.seatIds, 'sold');
    auditRepository.add({ tenantId: input.tenantId, action: 'payment_captured', entityId: payment.id, actorId: input.actorId, metadata: { reservationId: input.reservationId } });
    return payment;
  }
};
