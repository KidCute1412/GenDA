# Frontend Conventions

- Organize by user-facing feature, not by generic component type alone.
- Keep server components by default; use client components only for interaction or browser APIs.
- Forms use React Hook Form and schema validation shared with the API where practical.
- API calls go through the generated client; loading, empty, error, and success states are explicit.
- Do not put business authorization decisions only in the UI.
- Reusable UI belongs in a shared component package only after a second real use.
- Prefer accessible semantic HTML, keyboard support, and mobile-first responsive layouts.
- Follow the visual tokens, wireframes, and UX guidelines specified in `docs/design.md` (DD-10: Neo-Industrial Ledger) and `docs/ui-guidelines.md`.
- Style with the design tokens in `apps/web/app/globals.css`. Never hardcode a hex value, and support both Light and Dark mode using the semantic token layer (`--color-surface-page`, `--machinery-border`, `--color-action-primary`).
- Build components to the contract in `docs/design-tokens.md` and `docs/ui-guidelines.md`. Maintain the Neo-Industrial Ledger tactile hardware aesthetic (2px borders, hard shadows, 0px sharp module bays, tactile switch buttons).
- Each page renders exactly one `<main id="main-content">` so the layout's skip link has a target.

