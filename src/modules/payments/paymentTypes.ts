export interface Payment { id: string; tenantId: string; reservationId: string; idempotencyKey: string; amountCents: number; status: 'captured'; capturedAt: string; }
