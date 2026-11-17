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
- Fonts are self-hosted (`app/fonts.css`, `public/fonts/`): Inter Tight
  for everything. Don't go back
  to `next/font/google`: Turbopack failed the Vercel build ("next/font/google
  queries have exactly one entry") on an uncached deploy.
- `next/image` uses `preload`, not `priority`. `revalidateTag` needs a second
  argument. The webhook uses `{ expire: 0 }`, not `"max"`: `"max"` serves the
  old page once more after a purge, so edits seem to revert on refresh.

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
  WordPress's block CSS isn't loaded, so `.prose-yusea` styles the blocks
  editors use (Gallery grid, and Gallery → Styles → Carousel, a swipe row).

## Content model

- The `pillar` taxonomy (three focus areas) tags Projects, Reports and Posts.
  The Our Focus cards (homepage and /about, `PillarCards`) are its first
  three terms, edited together on the WP **Our Focus** screen; each links to
  `/work?pillar=<slug>`. `/work`, `/work/projects` and `/work/publications`
  filter with `byPillar()` over the fetched list.
- Publications = WP posts (`kind: "blog"`) + the `report` CPT
  (`kind: "report"`), merged newest first by `getPublications()`.
- The homepage is exactly `HeroSection`, `ImpactSection`, `SpotlightSection`.
  The hero is a blue headline panel (CTA = `hero.cta`, "Find out more" →
  /about) beside a slideshow of active projects (falls back to the ACF hero
  photos). Slides are shown whole (covers are often text posters), over a
  blurred copy of the same photo, with the caption in a band below. `ImpactSection` ("How we drive impact", `homepageFields.impactTabs`)
  tabs between `FocusPanel` (ourFocus, first) and `ContextPanel` (statsBand).
  Spotlight (`homepageFields.spotlight`, `getSpotlight()`) is the newest
  projects and publications merged by date.
- The homepage (test branch) follows a WEF-like look: a sun-yellow hero
  panel with ink text, light headings, and quiet chevron text links
  (`components/ui/ArrowLink.tsx`) instead of pill buttons.
- `/about` is a side nav plus Who we are (Page content box and body; the
  featured image is only the share image, not shown), Mission, Our focus
  (first three pillars, via `PillarCards`) and Board of directors, from
  `aboutPageFields` via `getAboutPage()`. Each section heading is also its
  nav label; empty sections are hidden.
- A single project (`/work/projects/[slug]`) is a full-width cover photo
  (`heroImage`) with the title, then Overview (the post body, tagline,
  hashtags) beside a sticky `RegistrationCard` (`projectFields.registration`;
  its button also shows on the cover and closes after `deadline`), then
  `VolunteerSection` (`projectFields.volunteer`; a second cover button jumps
  to `#volunteer`), then `PartnershipSection` (the `projectFields.partnership` group). The
  Overview heading and back-button label are Site Settings `work` labels.
- A project with `projectFields.programme` days (date, then sessions:
  start, end, title, speakers, description, image) gets Overview |
  Programme tabs (`ProjectTabs`) and `/work/projects/[slug]/programme`
  (`ProgrammeSchedule`, `?day=YYYY-MM-DD` filter, `programmeHref()`); without
  days that route 404s. The tab label is Site Settings `work.programmeLabel`.
- `/work`, `/work/projects`, `/work/publications` and `/about` take their
  eyebrow, heading and intro from the WP page's **Page content** box
  (`indexPageFields`; `getIndexPage()`). Site Settings is for site-wide
  settings and shared labels only — page copy goes on the page.
- **Removing a field WordPress serves** is two-step: deploy a frontend that
  no longer queries it, then delete it (Tools → YUSEA Setup → Remove old
  fields, fed by `yusea_cm_obsolete_fields()`). Deleting first breaks the
  deployed site's page refreshes.
- `wordpress/yusea-content-model.php` is the whole WordPress side: types,
  fields, index pages, editor layouts, frontend View links, and Tools →
  YUSEA Setup (status + starter content). Its starter data (pillars, About,
  social rows) is generated from the mocks; it deliberately has no projects,
  reports or posts, so don't regenerate those from the mocks.

## Design

- The whole site follows the homepage's WEF-like language: white space,
  sentence-case headings at **regular weight** (h1–h3 and prose headings
  are 400, large, tracking about -0.03em; no `font-bold` on headings),
  grey light lead text under titles, square photos (no rounding except
  portrait and logo circles), hairline `slate-200`/`slate-300` borders.
- Secondary actions are `ArrowLink` (text + chevron). `ButtonLink` pills
  (ink, sun for register, outline, light) are only for a page's main
  action. Filters (`FilterChips`) and homepage tabs share the grey pill
  switch with an ink active state. No blue accents in content (tags,
  hashtags, links, bullets are ink/grey). **No neo-brutalism**: no hard
  offset shadows or heavy borders.
- `.prose-yusea` rules live in `@layer utilities` as `.prose.prose-yusea`:
  in the components layer they lost to the Typography plugin.
- Uppercase only for small labels: header top-level nav (desktop and mobile),
  dropdown column headings.
- No eyebrow labels (the blue bar + uppercase label is gone; the `eyebrow`
  CMS fields are still queried but not shown) and no " · " separators:
  facts on one line go through `MetaLine` (`components/ui/MetaLine.tsx`),
  spaced apart.
- Header dropdowns are CSS only (`group-hover` / `group-focus-within`), with
  no React state. The header is a Server Component; only `MobileNav` is a
  client component.
- The footer is dark (`bg-ink`) with two columns built in `app/layout.tsx`:
  About (the About page sections, via `aboutSections()` in `lib/routes.ts`)
  and the /work page (its heading links to /work, then its "All projects"
  and "All publications" labels, then the Site Settings `annualReport`
  PDF, which also sits under the hero's "Find out more"; no file hides
  both). Logo, copyright, address and social
  icons are centred below. Site Settings `footerLinks` is no longer shown.
- The footer logo must always be bigger than the header logo. Both sizes are
  in the `SIZES` map in `components/layout/Logo.tsx`; change them together.
- Colour tokens live in the `@theme` block in `app/globals.css` (it is the
  Tailwind config). Text is `ink` or `muted`; don't use `text-faint` for
  text (fails AA). White text never goes on `sun` (use `ink`).

## Docs and git

- When a change affects routes, ACF fields, cache tags, design rules or
  commands, update [README.md](README.md) (and its "Rebuild v2" changelog
  for structural changes), [CHECKLIST.md](CHECKLIST.md) if it resolves or
  adds a launch item, and this file.
- Commit directly on `main` and push to `origin/main`; no feature branches.
