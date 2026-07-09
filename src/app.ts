import cors from 'cors';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from './shared/errors';
import { auditRepository } from './modules/audit/auditRepository';
import { checkinService } from './modules/checkins/checkinService';
import { eventService } from './modules/events/eventService';
import { paymentService } from './modules/payments/paymentService';
import { reportService } from './modules/reports/reportService';
import { reservationService } from './modules/reservations/reservationService';
import { seatRepository } from './modules/seats/seatRepository';

export const app = express();
app.use(cors());
app.use(express.json());

const tenant = (req: Request) => String(req.header('x-tenant-id') ?? 'tenant_default');
const actor = (req: Request) => String(req.header('x-actor-id') ?? 'system');

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/events', (req, res) => {
  const body = z.object({ name: z.string(), startsAt: z.string(), basePriceCents: z.number().int().positive(), seats: z.array(z.object({ section: z.string(), row: z.string(), numbers: z.array(z.number().int().positive()) })) }).parse(req.body);
  res.status(201).json(eventService.createEvent({ tenantId: tenant(req), actorId: actor(req), ...body }));
});

app.post('/events/:eventId/publish', (req, res) => res.json(eventService.publish(tenant(req), actor(req), req.params.eventId)));
app.get('/events/:eventId/seats/available', (req, res) => res.json(reservationService.getAvailableSeats(tenant(req), req.params.eventId)));
app.get('/events/:eventId/seats', (req, res) => res.json(seatRepository.listByEvent(tenant(req), req.params.eventId)));

app.post('/reservations', (req, res) => {
  const body = z.object({ eventId: z.string(), customerEmail: z.string().email(), seatIds: z.array(z.string()).min(1) }).parse(req.body);
  res.status(201).json(reservationService.create({ tenantId: tenant(req), actorId: actor(req), ...body }));
});
app.post('/reservations/:reservationId/cancel', (req, res) => res.json(reservationService.cancel(tenant(req), actor(req), req.params.reservationId)));

app.post('/payments/capture', (req, res) => {
  const body = z.object({ reservationId: z.string(), amountCents: z.number().int().positive(), idempotencyKey: z.string().min(3) }).parse(req.body);
  res.status(201).json(paymentService.capture({ tenantId: tenant(req), actorId: actor(req), ...body }));
});

app.post('/checkins', (req, res) => {
  const body = z.object({ reservationId: z.string() }).parse(req.body);
  res.status(201).json(checkinService.record({ tenantId: tenant(req), actorId: actor(req), ...body }));
});

app.get('/events/:eventId/report', (req, res) => res.json(reportService.eventSummary(tenant(req), req.params.eventId)));
app.get('/audit-logs', (req, res) => res.json(auditRepository.listByTenant(tenant(req))));

app.use((err: unknown, _req: Request, res: Response, _next: unknown) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', details: err.errors });
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
  return res.status(500).json({ error: 'Internal server error' });
});
