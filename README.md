# Event Ticketing API

A TypeScript/Express greenfield API for event booking workflows. It models multi-tenant events, seats, reservations, payments, check-ins, audit logs, and sales reports.

## Features

- Event creation and publishing
- Seat inventory per event
- Seat reservation with expiration
- Payment capture with idempotency key
- Check-in for paid reservations
- Tenant-scoped audit logs
- Sales and attendance reports

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## Useful Task Ideas

- Expired reservations still block seat availability.
- Duplicate payment idempotency is too strict or too loose.
- Check-in should be idempotent but still audited correctly.
- Sales report should exclude expired/unpaid reservations.
- Reservation cancellation should release seats and write audit entries.
