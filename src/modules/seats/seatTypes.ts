export type SeatStatus = 'available' | 'held' | 'sold' | 'blocked';
export interface Seat { id: string; tenantId: string; eventId: string; section: string; row: string; number: number; status: SeatStatus; }
