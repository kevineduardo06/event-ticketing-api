import { nextId } from '../../shared/id';
import { now } from '../../shared/time';
import { Payment } from './paymentTypes';

const payments: Payment[] = [];
export const paymentRepository = {
  create(input: Omit<Payment, 'id' | 'capturedAt' | 'status'>): Payment { const payment = { id: nextId('pay'), status: 'captured' as const, capturedAt: now().toISOString(), ...input }; payments.push(payment); return payment; },
  findByIdempotencyKey(tenantId: string, key: string): Payment | undefined { return payments.find(p => p.tenantId === tenantId && p.idempotencyKey === key); },
  listByTenant(tenantId: string): Payment[] { return payments.filter(p => p.tenantId === tenantId); },
  reset(): void { payments.length = 0; }
};
