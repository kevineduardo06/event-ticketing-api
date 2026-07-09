export type EventStatus = 'draft' | 'published' | 'cancelled';
export interface Event { id: string; tenantId: string; name: string; startsAt: string; status: EventStatus; basePriceCents: number; createdAt: string; }
