# Llah Design Rules

## Product feel
Llah should resemble high-quality productivity and developer tools such as Notion, Linear, Stripe Dashboard, GitHub and Vercel: quiet, precise, fast and obvious.

## Visual rules
- Primary surfaces: white and off-white.
- Dark mode: near-black charcoal, not blue/purple black.
- Borders: 1px neutral gray.
- Radius: normally 4px to 8px.
- Shadows: rare and very subtle.
- Typography: readable sans-serif; monospace only for identifiers, API keys, code and numeric telemetry.
- Accent: one restrained primary accent. Status colors are semantic.
- Tables are first-class UI for billing/usage data.
- Forms should be compact, labeled and keyboard friendly.

## Forbidden patterns
- gradients as decoration
- neon/glowing effects
- glassmorphism
- huge 20px+ rounded cards everywhere
- animated background blobs
- AI/robot illustrations
- emoji-heavy navigation
- fake "AI powered" badges
- marketing hero layouts inside the authenticated product
- random colors per card
- excessive motion

## Tailwind
Use Tailwind utilities as the default styling method. Reusable primitives live in `apps/web/src/components/ui`. Avoid one-off CSS except base tokens and cases Tailwind cannot express cleanly.
