# CLAUDE.md

YUSEA frontend: Next.js 16 (App Router, Server Components), Tailwind v4,
headless WordPress via WPGraphQL. Runs on mock WPGraphQL responses until the
CMS is live. [README.md](README.md) is the full reference, including the ACF
field spec and a changelog of the v2 rebuild. [CHECKLIST.md](CHECKLIST.md) is
the pre-launch audit. The brief the current structure implements is
`prompt/yusea_website_rebuild_prompt_v2.txt`.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # also type-checks; run before calling work done
npm run lint
npx tsc --noEmit
npm run check:cms    # live WordPress schema check — run before any deploy that adds fields
npm run wp:zip       # zips the wordpress/*.php plugins for upload
```

There are no tests. To check a change, build, run `npx next start`, and curl
the routes (e.g. compare `/work?pillar=urban-mobility` against `/work`).

## Next 16

This is not the Next.js in your training data. Read the bundled docs in
`node_modules/next/dist/docs/` before using an API you're unsure of. Things
that have bitten this repo:

- `params` and `searchParams` are Promises: `await` them, and never inside a
  callback (`.find(p => p.slug === (await searchParams).x)` won't compile).
- Reading `searchParams` makes a route dynamic. The cms fetches underneath
  stay cached (`force-cache` + tags in `lib/cms/client.ts`).
- `next/image` uses `preload`, not `priority`. `revalidateTag` needs a second
  argument (`"max"`).

## Rules

- **No visible copy in components.** Every string and image comes from
  WordPress (ACF, posts, terms) through `lib/cms`. A new label means a new
  field in `types.ts`, `queries.ts`, `mappers.ts`, the mock JSON and the
  README field tables. The exceptions are `app/error.tsx` and
  `app/global-error.tsx`.
- **Components import content only from `@/lib/cms`** (the facade in
  `lib/cms/index.ts`). They see domain types, never raw WPGraphQL shapes. If
  WordPress field names change, only `queries.ts` and `mappers.ts` change.
- **Production builds against the live CMS** (`WORDPRESS_USE_MOCKS="false"`
  on Vercel) and has no fallback, so a query field WordPress lacks fails the
  deploy. When you add a field to `queries.ts`, add it to
  `wordpress/yusea-content-model.php` too (bump its version so it re-runs),
  and have `npm run check:cms` pass before pushing.
- WordPress uses **Secure Custom Fields** (SCF), not ACF Pro: same `acf_*`
  API. Use Radio, not Select, for single-choice fields (WPGraphQL for ACF v2
  returns Select as a list).
- **Mocks are raw WPGraphQL responses** (`lib/cms/mocks/*.json`) and go
  through the same mappers as live data. Keep them shaped exactly like the
  query in `queries.ts`.
- **Build URLs with `lib/routes.ts`** (`projectHref`, `publicationHref`,
  `pillarHref`, `withQuery`) rather than writing `/work/...` strings by hand.
- **New routes** go in `app/sitemap.ts`. New cache tags go in `PURGE_TAGS` in
  `app/api/revalidate/route.ts` and in `wordpress/yusea-revalidate.php`.
- **Old URLs redirect** in `next.config.ts` (`/blog`, `/projects`). Moving a
  route means adding a redirect there.
- CMS HTML is rendered with `<Prose>` (`components/work/Prose.tsx`), which
  applies `prose prose-lg prose-yusea`. Don't style WYSIWYG output by hand.

## Content model

- The `pillar` taxonomy (three focus areas) tags Projects, Reports and Posts.
  The homepage Our Focus cards are its first three terms, and each links to
  `/work?pillar=<slug>`. `/work`, `/work/projects` and `/work/publications`
  filter with `byPillar()` over the fetched list.
- Publications = WP posts (`kind: "blog"`) + the `report` CPT
  (`kind: "report"`), merged newest first by `getPublications()`.
- The homepage is exactly `HeroSection`, `ImpactSection`, `OurFocusSection`.

## Design

- Clean and expansive: white space, sentence-case headings, hairline
  `slate-200`/`slate-300` borders, `rounded-2xl` images, pill buttons
  (`ButtonLink`). **No neo-brutalism**: no hard offset shadows, heavy borders
  or stark colour blocking.
- Uppercase only for small labels: header top-level nav (desktop and mobile),
  eyebrows, dropdown column headings.
- Header dropdowns are CSS only (`group-hover` / `group-focus-within`), with
  no React state. The header is a Server Component; only `MobileNav` is a
  client component.
- The footer logo must always be bigger than the header logo. Both sizes are
  in the `SIZES` map in `components/layout/Logo.tsx`; change them together.
- Colour tokens live in the `@theme` block in `app/globals.css` (it is the
  Tailwind config). Small accent text uses the `-700` shades for WCAG AA.
  Tailwind's default `slate` and `blue-50`/`blue-600` are also used, but the
  theme **overrides `blue-700`** (`#1a63c4`). Don't use `text-faint` for text
  (fails AA).

## Docs and git

- When a change affects routes, ACF fields, cache tags, design rules or
  commands, update [README.md](README.md) (and its "Rebuild v2" changelog
  for structural changes), [CHECKLIST.md](CHECKLIST.md) if it resolves or
  adds a launch item, and this file.
- Commit directly on `main` and push to `origin/main`; no feature branches.
