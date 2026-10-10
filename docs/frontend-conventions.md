# Frontend Conventions

- Organize by user-facing feature, not by generic component type alone.
- Keep server components by default; use client components only for interaction or browser APIs.
- Forms use React Hook Form and schema validation shared with the API where practical.
- API calls go through the generated client; loading, empty, error, and success states are explicit.
- Do not put business authorization decisions only in the UI.
- Reusable UI belongs in a shared component package only after a second real use.
- Prefer accessible semantic HTML, keyboard support, and mobile-first responsive layouts.
- Follow the visual tokens, wireframes, and UX guidelines specified in `docs/design.md`.
- Style with the design tokens in `apps/web/app/globals.css`. Never hardcode a hex value, and never reference a primitive token (`--teal-600`, `--space-5`) from a component — go through the semantic or component layer (`--color-action-primary`, `--btn-primary-bg`).
- Build components to the contract in `docs/design-tokens.md`, including every state it lists: default, hover, focus-visible, disabled, and loading where the component calls an API.
- Each page renders exactly one `<main id="main-content">` so the layout's skip link has a target.

