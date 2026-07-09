import { nextId } from '../../shared/id';
import { Seat, SeatStatus } from './seatTypes';

const seats: Seat[] = [];
export const seatRepository = {
  createMany(input: { tenantId: string; eventId: string; section: string; row: string; numbers: number[] }): Seat[] {
    const created = input.numbers.map(number => ({ id: nextId('seat'), tenantId: input.tenantId, eventId: input.eventId, section: input.section, row: input.row, number, status: 'available' as SeatStatus }));
    seats.push(...created);
    return created;
  },
  findByIds(tenantId: string, seatIds: string[]): Seat[] { return seats.filter(s => s.tenantId === tenantId && seatIds.includes(s.id)); },
  listByEvent(tenantId: string, eventId: string): Seat[] { return seats.filter(s => s.tenantId === tenantId && s.eventId === eventId); },
  setStatus(tenantId: string, seatIds: string[], status: SeatStatus): void { seats.filter(s => s.tenantId === tenantId && seatIds.includes(s.id)).forEach(s => { s.status = status; }); },
  reset(): void { seats.length = 0; }
};
