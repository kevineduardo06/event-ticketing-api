# Event Ticketing API

A personal TypeScript/Express REST API prototype for event ticketing workflows, including events, seats, reservations, simulated payment capture, check-ins, tenant-scoped audit logs, and reports.

## Current scope

- Create and publish events with assigned seats
- View seat inventory and availability
- Reserve seats with expiration and cancel eligible reservations
- Simulate payment capture using idempotency keys (no real payment provider)
- Record idempotent check-ins for paid reservations
- View tenant-scoped audit logs and event sales/attendance summaries
- Run HTTP-level automated tests using Vitest and Supertest

This is a development prototype with **in-memory repositories**. Data does not survive process restarts. Tenant and actor identifiers currently come from HTTP headers and are **not authenticated**; the API is not production-ready. Do not use real customer information, credentials, or payments.

## Stack

Node.js, TypeScript, Express, Zod, Vitest, Supertest, and tsx.

## Getting started

Requirements: a compatible Node.js LTS version and npm.

```bash
npm ci
npm test
npm run build
npm run dev
```

The default server entry point is `src/server.ts`. See `src/app.ts` for the implemented endpoints and request schemas.

## Main endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/events` | Create an event |
| POST | `/events/:eventId/publish` | Publish an event |
| GET | `/events/:eventId/seats` | List seats |
| GET | `/events/:eventId/seats/available` | List available seats |
| POST | `/reservations` | Reserve seats |
| POST | `/reservations/:reservationId/cancel` | Cancel an eligible reservation |
| POST | `/payments/capture` | Simulate payment capture |
| POST | `/checkins` | Record check-in |
| GET | `/events/:eventId/report` | Event summary |
| GET | `/audit-logs` | Tenant audit log |

Current test fixtures use synthetic sample data. Review all content and Git history for sensitive data before making a public submission.

## Architecture

HTTP routes and validation live in `src/app.ts`; business logic lives in `src/modules/*/*Service.ts`; in-memory data access lives in repositories; shared errors and clock utilities live in `src/shared/`. Automated HTTP flows are in `tests/`.

## Future development

See [ROADMAP.md](ROADMAP.md) for proposed improvements. These are plans, **not implemented features**. Prioritize them based on actual project needs and available time.

## License

MIT — see [LICENSE](LICENSE).
