import { nextId } from '../../shared/id';
import { now } from '../../shared/time';
import { AuditAction, AuditLog } from './auditTypes';

const logs: AuditLog[] = [];
export const auditRepository = {
  add(input: { tenantId: string; action: AuditAction; entityId: string; actorId: string; metadata?: Record<string, unknown> }): AuditLog {
    const log = { id: nextId('aud'), createdAt: now().toISOString(), ...input };
    logs.push(log);
    return log;
  },
  listByTenant(tenantId: string): AuditLog[] { return logs.filter(l => l.tenantId === tenantId); },
  reset(): void { logs.length = 0; }
};
