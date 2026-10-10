# Frontend Conventions

- Organize by user-facing feature, not by generic component type alone.
- Keep server components by default; use client components only for interaction or browser APIs.
- Forms use React Hook Form and schema validation shared with the API where practical.
- API calls go through the generated client; loading, empty, error, and success states are explicit.
- Do not put business authorization decisions only in the UI.
- Reusable UI belongs in a shared component package only after a second real use.
- Prefer accessible semantic HTML, keyboard support, and mobile-first responsive layouts.

