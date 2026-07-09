export type ReservationStatus = 'held' | 'paid' | 'cancelled' | 'expired';
export interface Reservation { id: string; tenantId: string; eventId: string; customerEmail: string; seatIds: string[]; status: ReservationStatus; amountCents: number; expiresAt: string; createdAt: string; paidAt?: string; cancelledAt?: string; }
