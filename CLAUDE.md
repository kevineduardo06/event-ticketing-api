# CLAUDE.md

## Commands

- Install dependencies: npm install
- Run tests: npm test
- Type-check/build: npm run build
- Lint: npm run lint

## Workflow Rules

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, or force push without confirmation.
- Keep diffs focused on the requested task.
- Add or update tests for behavior changes.
- Report the exact commands run and their results before finishing.

## Architecture

- Routes handle HTTP concerns only.
- Services contain business rules.
- Repositories own in-memory persistence and query behavior.
- Use money in cents.
- Keep tenant isolation explicit in service/repository calls.
- Prefer existing patterns before adding new abstractions.

## Domain Notes

- Reservations can expire before payment.
- A paid reservation cannot be cancelled by the customer.
- Seat availability must consider active reservations and sold tickets.
- Check-in requires a paid reservation and must be idempotent.
