import { auditRepository } from '../src/modules/audit/auditRepository';
import { checkinRepository } from '../src/modules/checkins/checkinRepository';
import { eventRepository } from '../src/modules/events/eventRepository';
import { paymentRepository } from '../src/modules/payments/paymentRepository';
import { reservationRepository } from '../src/modules/reservations/reservationRepository';
import { seatRepository } from '../src/modules/seats/seatRepository';
import { resetIds } from '../src/shared/id';
import { setNow } from '../src/shared/time';

export function resetState(): void { auditRepository.reset(); checkinRepository.reset(); eventRepository.reset(); paymentRepository.reset(); reservationRepository.reset(); seatRepository.reset(); resetIds(); setNow('2026-07-09T12:00:00.000Z'); }
