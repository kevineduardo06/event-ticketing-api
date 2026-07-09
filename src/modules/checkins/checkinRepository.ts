import { nextId } from '../../shared/id';
import { now } from '../../shared/time';
import { CheckIn } from './checkinTypes';

const checkins: CheckIn[] = [];
export const checkinRepository = {
  create(input: Omit<CheckIn, 'id' | 'checkedInAt'>): CheckIn { const checkin = { id: nextId('chk'), checkedInAt: now().toISOString(), ...input }; checkins.push(checkin); return checkin; },
  findByReservation(tenantId: string, reservationId: string): CheckIn | undefined { return checkins.find(c => c.tenantId === tenantId && c.reservationId === reservationId); },
  listByTenant(tenantId: string): CheckIn[] { return checkins.filter(c => c.tenantId === tenantId); },
  reset(): void { checkins.length = 0; }
};
