import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { setNow } from '../src/shared/time';
import { resetState } from './reset';

async function createPublishedEvent() {
  const created = await request(app).post('/events').set('x-tenant-id', 't1').set('x-actor-id', 'admin').send({ name: 'Tech Conf', startsAt: '2026-08-01T18:00:00.000Z', basePriceCents: 5000, seats: [{ section: 'A', row: '1', numbers: [1, 2, 3] }] });
  await request(app).post(`/events/${created.body.id}/publish`).set('x-tenant-id', 't1').set('x-actor-id', 'admin');
  const seats = await request(app).get(`/events/${created.body.id}/seats`).set('x-tenant-id', 't1');
  return { event: created.body, seats: seats.body };
}

describe('event ticketing flow', () => {
  beforeEach(() => resetState());

  it('creates and publishes an event with seats', async () => {
    const { event, seats } = await createPublishedEvent();
    expect(event.status).toBe('draft');
    expect(seats).toHaveLength(3);
  });

  it('holds seats when reservation is created', async () => {
    const { event, seats } = await createPublishedEvent();
    const response = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id, seats[1].id] });
    expect(response.status).toBe(201);
    expect(response.body.amountCents).toBe(10000);
    const available = await request(app).get(`/events/${event.id}/seats/available`).set('x-tenant-id', 't1');
    expect(available.body.map((s: { id: string }) => s.id)).toEqual([seats[2].id]);
  });

  it('expires held reservations and releases seats', async () => {
    const { event, seats } = await createPublishedEvent();
    await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    setNow('2026-07-09T12:16:00.000Z');
    const available = await request(app).get(`/events/${event.id}/seats/available`).set('x-tenant-id', 't1');
    expect(available.body).toHaveLength(3);
  });

  it('captures payment and marks seats as sold', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    const payment = await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    expect(payment.status).toBe(201);
    const allSeats = await request(app).get(`/events/${event.id}/seats`).set('x-tenant-id', 't1');
    expect(allSeats.body.find((s: { id: string }) => s.id === seats[0].id).status).toBe('sold');
  });

  it('returns existing payment for repeated idempotency key and same payload', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    const first = await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    const second = await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    expect(second.body.id).toBe(first.body.id);
  });

  it('rejects payment when idempotency key is reused with different payload', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    const second = await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 6000, idempotencyKey: 'pay-1' });
    expect(second.status).toBe(409);
  });

  it('records check-in only for paid reservations and is idempotent', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    const first = await request(app).post('/checkins').set('x-tenant-id', 't1').set('x-actor-id', 'gate').send({ reservationId: reservation.body.id });
    const second = await request(app).post('/checkins').set('x-tenant-id', 't1').set('x-actor-id', 'gate').send({ reservationId: reservation.body.id });
    expect(second.body.id).toBe(first.body.id);
  });

  it('blocks cancelling paid reservations through customer flow', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id] });
    await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 5000, idempotencyKey: 'pay-1' });
    const cancelled = await request(app).post(`/reservations/${reservation.body.id}/cancel`).set('x-tenant-id', 't1');
    expect(cancelled.status).toBe(409);
  });

  it('builds a tenant-scoped event summary', async () => {
    const { event, seats } = await createPublishedEvent();
    const reservation = await request(app).post('/reservations').set('x-tenant-id', 't1').send({ eventId: event.id, customerEmail: 'buyer@example.com', seatIds: [seats[0].id, seats[1].id] });
    await request(app).post('/payments/capture').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id, amountCents: 10000, idempotencyKey: 'pay-1' });
    await request(app).post('/checkins').set('x-tenant-id', 't1').send({ reservationId: reservation.body.id });
    const report = await request(app).get(`/events/${event.id}/report`).set('x-tenant-id', 't1');
    expect(report.body.grossSalesCents).toBe(10000);
    expect(report.body.soldSeats).toBe(2);
    expect(report.body.checkedInCount).toBe(1);
  });

  it('isolates tenants', async () => {
    const { event } = await createPublishedEvent();
    const seatsFromOtherTenant = await request(app).get(`/events/${event.id}/seats`).set('x-tenant-id', 't2');
    expect(seatsFromOtherTenant.body).toEqual([]);
  });
});
