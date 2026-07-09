import { nextId } from '../../shared/id';
import { now } from '../../shared/time';
import { Reservation } from './reservationTypes';

const reservations: Reservation[] = [];
export const reservationRepository = {
  create(input: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Reservation {
    const reservation: Reservation = { id: nextId('res'), status: 'held', createdAt: now().toISOString(), ...input };
    reservations.push(reservation);
    return reservation;
  },
  findById(tenantId: string, id: string): Reservation | undefined { return reservations.find(r => r.tenantId === tenantId && r.id === id); },
  save(reservation: Reservation): Reservation { const idx = reservations.findIndex(r => r.tenantId === reservation.tenantId && r.id === reservation.id); if (idx >= 0) reservations[idx] = reservation; return reservation; },
  listByEvent(tenantId: string, eventId: string): Reservation[] { return reservations.filter(r => r.tenantId === tenantId && r.eventId === eventId); },
  listByTenant(tenantId: string): Reservation[] { return reservations.filter(r => r.tenantId === tenantId); },
  reset(): void { reservations.length = 0; }
};
