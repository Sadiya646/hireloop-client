<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# hireloop-client

Next.js 16 (App Router) + React 19 single-package app. No monorepo, no `src/` directory — `app/`, `components/`, `hooks/`, `lib/` live at repo root. `@/*` maps to the repo root.

## Commands

```sh
npm run dev        # next dev
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run format     # prettier --write "**/*.{ts,tsx}"
npm run build
```

- There is **no test setup** (no test script, runner, or test files). Verification = `typecheck` + `lint`, then `npm run build` for route/type validation.
- `format` only touches `.ts`/`.tsx`; keep Prettier-compatible formatting when writing other file types by hand. Prettier config: `.prettierrc` (uses `prettier-plugin-tailwindcss`, so class order is re-sorted).

## Auth setup (better-auth + MongoDB)

- Auth is configured in `lib/auth.ts` (server) and `lib/auth-client.ts` (client); the route handler is `app/api/auth/[...all]/route.ts`.
- The MongoDB connection string is **hardcoded** in `lib/auth.ts` (`mongodb://localhost:27017/database`, db `hireloopdb`). It ignores any `MONGODB_URI` env var, so auth routes need a local MongoDB running on port 27017.
- `.env` holds `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`. `lib/auth.ts` also reads `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, which are not in `.env`.

## UI stack quirks

- shadcn-style components, but the style is **`base-nova` (Base UI, `@base-ui/react`)** — not the default Radix-based style. Add components with `npx shadcn@latest add <component>`; they land in `components/ui/` (import via `@/components/ui/<name>`).
- Tailwind **v4** via `@tailwindcss/postcss` — no `tailwind.config` file; theme/CSS variables live in `app/globals.css`.
- Fonts (Geist/Geist_Mono via `next/font`) and `ThemeProvider` (`next-themes`) are wired in `app/layout.tsx` with `--font-sans` / `--font-mono` CSS variables.

`CLAUDE.md` is a pointer file containing only `@AGENTS.md` — edit this file, not that one.
