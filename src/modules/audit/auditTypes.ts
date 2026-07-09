export type AuditAction = 'event_created' | 'event_published' | 'reservation_created' | 'reservation_cancelled' | 'payment_captured' | 'checkin_recorded';
export interface AuditLog { id: string; tenantId: string; action: AuditAction; entityId: string; actorId: string; createdAt: string; metadata?: Record<string, unknown>; }
