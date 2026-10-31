# Development roadmap

This is a proposed backlog for continued personal development. Estimates are rough planning ranges, not time already spent or guaranteed future work. Reprioritize as needed.

| Priority | Proposed work | Estimated effort | Acceptance criteria |
| --- | --- | --- | --- |
| P1 | Reservation expiration consistency | 4–6 h | Expired holds consistently release seats across availability, payment and reporting; regression tests pass |
| P1 | Concurrent seat reservation safety | 5–8 h | Simultaneous requests cannot successfully reserve the same seat twice; tests reproduce the conflict |
| P1 | Persistence layer and migrations | 7–11 h | Repository interfaces backed by a database; repeatable schema migrations and integration tests |
| P1 | Tenant authentication and authorization | 5–8 h | Verified tenant identity replaces trusted caller headers; role permissions and isolation tests |
| P2 | Reservation lifecycle and cancellation auditing | 3–5 h | Explicit transitions, consistent audit records, and edge-case tests |
| P2 | Payment simulation reliability | 4–6 h | Documented simulated capture semantics, idempotency scope and failure/retry tests; no real payment integration |
| P2 | Reporting accuracy and filtering | 3–5 h | Sales and attendance totals account for expired/cancelled/unpaid reservations; test coverage |
| P2 | API documentation and CI checks | 3–5 h | OpenAPI spec/examples and automated typecheck/test workflow |

**Total proposed effort: 34–54 hours.**

## Scope notes

- This prototype uses synthetic data only. Do not add real attendee or customer records.
- Payment capture is simulated; avoid representing it as live payment processing.
- Keep real development history and do not manufacture commits or usage evidence.
