# YUSEA — Headless WordPress + Next.js

Frontend for the YUSEA regional development platform. Next.js 16 (App Router,
React Server Components), Tailwind v4.

**The site runs today with no CMS.** Content comes from mock WPGraphQL
responses in `lib/cms/mocks/` until WordPress is ready on
`cms.yuseavietnam.com`. **No visible text or image is written in a component**
— everything comes from ACF fields or posts. See [Connecting
WordPress](#connecting-wordpress).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Before going live, work through [CHECKLIST.md](CHECKLIST.md) — the
pre-launch audit (SEO, accessibility, performance, error handling, ops).
[CLAUDE.md](CLAUDE.md) is the short version of this file for AI coding
agents: commands, Next 16 gotchas and the rules below.

## Layout

```
app/
  layout.tsx               Fonts, header/footer, skip link, default metadata
  page.tsx                 Homepage — HeroSection, ImpactSection, OurFocusSection
  not-found.tsx            Branded 404 (copy from the options page)
  error.tsx                Runtime error fallback, inside header/footer
  global-error.tsx         Last resort when the root layout itself fails
  robots.ts / sitemap.ts   robots.txt (closed on previews) and sitemap.xml
  about/page.tsx           The WP page at /about
  work/page.tsx            Hub: projects + publications, filtered by ?pillar=<slug>
  work/projects/           All projects index (?pillar=) and [slug] template
  work/publications/       All publications index (?type=, ?pillar=),
                           reports/[slug] and blog/[slug] templates
  globals.css              Design tokens (this IS the Tailwind config)
  api/revalidate/route.ts  On-demand ISR purge, called by a WP webhook
components/
  layout/                  Header (CSS hover dropdowns), MobileNav, Footer, Logo, SocialIcons
  home/                    HeroSection, ImpactSection, OurFocusSection
  work/                    ProjectCard, PublicationCard, FilterChips, PillarTags, Prose
  ui/                      ButtonLink, SectionHeading, Eyebrow (accent bar + label)
lib/
  cms/
    index.ts               ← the facade. Components import only from here.
    types.ts               Domain model (the ACF contract)
    queries.ts             WPGraphQL documents
    client.ts              Transport (fetch + ISR tags)
    mappers.ts             WPGraphQL response → domain model
    mocks/                 Mock WPGraphQL responses, one JSON per query
  routes.ts                URL builders for /work, and the pillar filter
  format.ts                Date formatting
  seo.ts                   siteUrl(), pageMetadata() — canonical + Open Graph per page
wordpress/
  yusea-content-model.php  WP plugin: post types, taxonomy and fields for v2
  yusea-revalidate.php     WP plugin: pings /api/revalidate on publish
  zip.sh                   npm run wp:zip → upload-ready zips in wordpress/dist/
scripts/
  check-cms.mts            npm run check:cms → live CMS schema check
prompt/                    The rebuild brief this structure implements
CLAUDE.md                  Working notes for AI coding agents
CHECKLIST.md               Pre-launch audit
```

Homepage section IDs: `#homepage-hero`, `#homepage-impact`, `#homepage-focus`.

**Pillars and the /work filter.** A custom taxonomy `pillar` (the "hashtag"
for the three focus areas) is attached to Projects, Reports and Posts. The
homepage Our Focus cards are its first three terms; each card's "Explore
more" links to `/work?pillar=<term slug>`. `/work` is a Server Component that
reads `searchParams` and keeps only items tagged with that pillar. WPGraphQL
has no taxonomy filter on connections without an extension, so the filtering
runs over the fetched list (`byPillar()` in `lib/routes.ts`); move it into
the query if the lists grow past ~100 items. An unknown slug shows everything.

## Connecting WordPress

Every content call goes through `lib/cms/index.ts`. Each getter returns
mocks until the CMS is connected, then hits WPGraphQL. Two variables
control it (set them in `.env.local` and in Vercel → Settings → Environment
Variables):

```bash
WORDPRESS_GRAPHQL_ENDPOINT="https://cms.yuseavietnam.com/graphql"
WORDPRESS_USE_MOCKS="true"   # flip to "false" when WordPress is live
```

All variables, including `REVALIDATE_SECRET` and `SITE_URL` (the public origin
used for canonicals, Open Graph, robots.txt and the sitemap), are listed in
`.env.example`.

**Flipping `WORDPRESS_USE_MOCKS` is the entire switch** — no code changes.

Each file in `lib/cms/mocks/` is a raw WPGraphQL response for one query in
`queries.ts`, run through the same mapper as live data. To change what the site
shows before WordPress exists, edit the JSON. If real posts render differently from
the mocks, the bug is in the mapper or the query, not the components.

Once live there is **no fallback to mocks**. If a WordPress request fails,
the render throws: ISR keeps serving the last good version of the page, and a
failing build leaves the previous Vercel deployment in place. Look for
`[cms] … failed` in the logs. Every ACF field in the queries must exist before
flipping the switch — WPGraphQL rejects the whole query if one is missing.

### What to build in WordPress

Plugins: WPGraphQL, **Secure Custom Fields** (SCF, the WordPress.org fork of
ACF — it includes repeaters and options pages; ACF Pro works the same), and
WPGraphQL for ACF (v2, which supports SCF). "ACF" below means SCF.

**Install `wordpress/yusea-content-model.php`** — it does the v2 setup in
one upload:

```bash
npm run wp:zip     # → wordpress/dist/yusea-content-model.zip (and yusea-revalidate.zip)
```

Plugins → Add New → Upload Plugin → activate, then open any admin page. A
notice lists what was added. The plugin:

- Registers **post types `project` and `report`** and the **taxonomy
  `pillar`** (on posts, projects and reports), all with GraphQL names
  `project`/`projects`, `report`/`reports`, `pillar`/`pillars`. Anything
  already registered (in SCF's Post Types screen or CPT UI) is left alone.
- Enables excerpts on pages (the /about excerpt is its meta description).
- Registers the new field groups `projectFields`, `reportFields` and
  `pillarFields` in code (they don't appear under SCF → Field Groups; edit
  them in the plugin file).
- **Adds** `ourFocus` to `homepageFields`, and the `work` group, the
  `navigation` → `categoriesHeading`/`quickLinksHeading` and
  `categories`/`quickLinks` sub-fields, and a `social` → `icon` image to
  `siteSettingsFields`. It also re-exposes any of its own fields that were
  saved hidden from GraphQL. Versions 1.0–1.1 also added top-level
  `navCategoriesLabel`/`navQuickLinksLabel`; they are no longer used and
  can be deleted in SCF. These are
  saved to the database, so they are editable in SCF afterwards. It only
  adds: existing fields and content are never changed. If a group is stored
  in local JSON rather than the database, the notice says so and those
  fields must be added by hand.
- Gives every label field default wording (the mock copy), so pages have
  text before editors fill anything in.

Then check the live schema, which must pass before a build can:

```bash
npm run check:cms  # sends every query to the CMS; lists rejected fields
```

Term order drives the Our Focus cards (the query sorts by `TERM_ORDER`);
install a term-ordering plugin to make it editable. Project `status` is a
**Radio** field, not a Select: WPGraphQL for ACF v2 returns a list for
Select fields.

Content editors still need to add: the three pillar terms (name, slug,
description, card image), projects, reports, the `/about` page, and the nav
dropdown links.

`lib/cms/queries.ts` was written **before** the CMS on purpose — the field
names in it are the build spec for ACF. If you build fields by hand instead of
with the plugin, name them to match and the queries work first try:

Set each field group's **GraphQL Field Name** exactly as below. Sub-groups
(`hero`, `statsBand`, …) are ACF **Group** fields; `[]` means **Repeater**.

**Page `/`** (set as front page in Settings → Reading) → group `homepageFields`

| Group | Fields |
|---|---|
| `hero` | `headline`, `subheadline`, `ctaLabel`, `ctaHref`, `background` (image) |
| `statsBand` | `eyebrow`, `heading`, `intro` (WYSIWYG), `stats[]` { `value`, `description`, `source` } |
| `ourFocus` | `heading`, `ctaLabel`, `ctaHref` (`/work`), `linkLabel` ("Explore more") |

**Options page** (GraphQL type name `SiteSettings`) → group `siteSettingsFields`

`siteName`, `logo` (image), `favicon` (image), `seoTitle`, `seoDescription`,
`seoImage` (image, 1200×630 — the default social share image),
`notFoundEyebrow`, `notFoundHeading`, `notFoundBody`, `notFoundCtaLabel`,
`notFoundCtaHref` (the 404 page), `skipToContentLabel`,
`menuOpenLabel`, `menuCloseLabel`, `footerCopyright` (`{year}` is replaced),
`footerAddress`,
`navigation[]` { `label`, `href`, `categoriesHeading`, `quickLinksHeading`, `categories[]` { `label`, `href` }, `quickLinks[]` { `label`, `href` } },
`footerLinks[]` { `label`, `href` }, `social[]` { `platform`, `href`, `icon` (image, optional) }, and a
group `work` with:

| Fields | Used on |
|---|---|
| `hubEyebrow`, `hubHeading`, `hubIntro` | `/work` |
| `projectsEyebrow`, `projectsHeading`, `projectsIntro` | `/work/projects` |
| `publicationsEyebrow`, `publicationsHeading`, `publicationsIntro` | `/work/publications` |
| `filterLabel`, `filterAllLabel` | Filter chip rows |
| `projectsSectionHeading`, `publicationsSectionHeading`, `viewAllProjectsLabel`, `viewAllPublicationsLabel`, `emptyText` | `/work` sections |
| `kindBlogLabel`, `kindReportLabel` | Publication cards and the type filter |
| `statusActiveLabel`, `statusCompletedLabel`, `statusPlannedLabel` | Project cards |
| `metricsHeading` | Single project |
| `downloadReportLabel` | Single report |

A nav row with `categories` or `quickLinks` gets a hover dropdown in the
header, with that row's `categoriesHeading` / `quickLinksHeading` over each
column (e.g. Projects: "By focus", Publications: "By type"); on mobile the
links are listed under the item.

**`Project` CPT** → group `projectFields`: `latitude`, `longitude`, `city`,
`province`, `status`, `metrics[]` { `value`, `description`, `source` },
`heroImage` (image). The body is the post content.

**`Report` CPT** → group `reportFields`: `file` (file, usually the PDF). The
body is the report summary; empty `file` hides the download button.

**`pillar` term** → group `pillarFields`: `image` (the Our Focus card image,
3:2). The term description is the card text.

An empty CTA label hides that button. `navigation` and `footerLinks` are repeaters: the
header and footer render exactly the rows in WP admin, in order (rows without a
label are skipped; an empty `href` becomes `#`). Make `footerAddress` a textarea;
its line breaks are kept, and leaving it empty hides it. Options page data is publicly queryable over
GraphQL — keep nothing private there.

If the real field names end up differing, fix `queries.ts` and `mappers.ts`.
Nothing under `app/` or `components/` should need to change — that is the
point of the facade.

### Revalidation webhook

`POST /api/revalidate`, authenticated by a shared secret in either the
`x-revalidate-secret` header or a `secret` body key. Comparison is constant
time.

```jsonc
{ "tags": ["projects"], "paths": ["/work/projects/can-tho"] }  // targeted
{}                                                             // purge every tag
```

Cache tags in use: `homepage`, `site-settings`, `pillars`, `projects`,
`project:<slug>`, `reports`, `report:<slug>`, `posts`, `post:<slug>`,
`pages`, `page:<uri>`. Standard ISR window is 3600s (spec §3).

WordPress side: install `wordpress/yusea-revalidate.php` as a plugin (zip it,
then Plugins → Add New → Upload) and add to `wp-config.php`:

```php
define('YUSEA_FRONTEND_URL', 'https://your-nextjs-site.example');
define('YUSEA_REVALIDATE_SECRET', '<same value as REVALIDATE_SECRET>');
```

The webhook can only reach a deployed frontend, not `localhost`. In local dev,
hard-refresh (Cmd+Shift+R) to bypass the cache instead.

## SEO, error pages and headers

**Metadata.** `app/layout.tsx` sets the site-wide defaults from the options
page: title template, description, favicon, and `metadataBase` from
`siteUrl()`. Each page then calls `pageMetadata()` from `lib/seo.ts` for its
canonical URL, Open Graph and Twitter tags. Next merges metadata shallowly —
a page that sets `openGraph` replaces the layout's whole object — so
`pageMetadata()` always rebuilds it in full. New pages should do the same:

```ts
export function generateMetadata() {
  return pageMetadata({ title: "About", path: "/about" });
}
```

The share image is `seoImage` from the options page unless the page passes
its own (projects, reports and posts use their image; reports and posts are
tagged `og:type article` with a publish date).

**Site URL.** `siteUrl()` reads `SITE_URL`, then falls back to Vercel's
production domain, then `http://localhost:3000`. Previews therefore point
canonicals at production, which is what search engines should see.

**robots.txt / sitemap.xml.** `app/robots.ts` disallows everything unless
`VERCEL_ENV` is `production` (off Vercel: a production build). The sitemap
lists every route and every project, report and post (up to 100 each).
Filtered views (`?pillar=`) are left out. Old `/blog` and `/projects` URLs
308-redirect to their `/work` equivalents (`next.config.ts`).

**Error pages.** `app/not-found.tsx` is the branded 404, inside the normal
header and footer; Next adds `noindex` to it automatically. `app/error.tsx`
catches a failed page render and `app/global-error.tsx` a failed root layout
(it brings its own `<html>` and stylesheet). Both offer a retry and log the
error digest, which matches the server log line.

**Security headers.** `next.config.ts` sends `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` on every
route; Vercel adds HSTS. A Content-Security-Policy is still to do — see the
checklist.

## Design system

Tailwind v4 is CSS-first: the `@theme` block in `app/globals.css` **is** the
config. There is no `tailwind.config.js`. Every token becomes a utility
(`--color-blue` → `bg-blue` / `text-blue` / `border-blue`).

The palette follows the four quadrants of the YUSEA logo — black, orange, blue,
yellow. The full-strength colours are accents only
(eyebrow bars, list markers, hover states), never a whole section.

The look is clean and expansive: lots of white, sentence-case headings,
hairline `slate` borders, rounded image corners and pill buttons. **No
neo-brutalist elements** — no hard offset shadows, heavy borders or stark
colour blocking. The only shadow is the soft one under header dropdowns.

Uppercase is kept for small labels only: the header's top-level nav links
(desktop and mobile), eyebrows and dropdown column headings. Dropdown links
and all headings are sentence case.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#ffffff` | Primary ground (header, every page) |
| `tint-gray` | `#e2e8f0` | Footer ground (stands in for the black quadrant) |
| `paper-soft` / `tint-blue` / `tint-warm` | `#f8fafc` `#dbeafe` `#fef3c7` | Defined but currently unused; kept for future sections |
| `coral` | `#f26640` | Orange accent; `coral-700` `#b8431f` for small text |
| `blue` | `#1f6fd1` | Blue accent; `blue-700` `#1a63c4` for small text |
| `sun` | `#ffd450` | Yellow accent, hero CTA — fills and bars only, never text on light |
| `ink` / `muted` / `faint` / `line` | `#232429` `#55565b` `#828388` `#d3d4d9` | Text and rules; `ink` is also the black accent |

The rebuild also uses Tailwind's **default** `slate` scale (borders, the Our
Focus ground, nav text) and `blue-50` / `blue-600` (pill buttons, links,
active filter chips), as the brief specifies them by name. Note that
`blue-700` is **overridden** by the theme to `#1a63c4`, so it isn't Tailwind's
default `blue-700`.

`#1f6fd1` is a stand-in for the logo blue. When the official logo hex values
are confirmed, update `coral`, `blue` and `sun` (and their `-700` text shades)
in `globals.css` — every component reads from the tokens.

**Homepage rhythm.**

| Section | Ground | Notes |
|---|---|---|
| Hero | Full-bleed photo, dark gradient overlay | `sun` CTA |
| Impact (`#homepage-impact`) | white | 5/7 headline/body split; stats divided by `border-l-2 border-slate-300` |
| Our Focus (`#homepage-focus`) | `slate-50` | Outlined `blue-600` pill CTA; three borderless pillar cards |
| Footer | `tint-gray`, four-colour stripe on top | — |

The header is white with a hairline bottom border. There are no dark section
grounds — the hero photo is the only dark surface, and only it uses white text.

**CMS HTML** (WYSIWYG fields, post/report/project/page bodies) is styled by
Tailwind Typography: `prose prose-lg prose-yusea`, where `.prose-yusea` in
`globals.css` maps it onto the site fonts and tokens (blue list markers).

**Contrast rules.** Full-strength `coral` and `sun` fail WCAG AA as small text,
so accent *text* uses `coral-700` / `blue-700`, and `sun` is never text on a
light ground (its eyebrow label is `ink`, beside a `sun` bar). If a tinted
section ground comes back, keep it no darker than the 100–200 strength, or
its `-700` eyebrow text drops below AA. `text-faint` fails AA as text; it is
no longer used for text.

**Type:** Archivo (display) + Barlow (body), both with `vietnamese` subsets
loaded. The reference site uses Ambit, a commercial TypeMates face; Archivo is
the closest open substitute. Swap in `app/layout.tsx` if YUSEA licenses Ambit.

## Rebuild v2 (October 2026)

What changed when the site moved to the structure in
`prompt/yusea_website_rebuild_prompt_v2.txt`, for anyone who knew the old one:

- **Routes.** New: `/about`, `/work` (filterable hub), `/work/projects`,
  `/work/projects/[slug]`, `/work/publications`,
  `/work/publications/reports/[slug]`, `/work/publications/blog/[slug]`.
  Removed: `/blog`, `/blog/[slug]`. Old `/blog` and `/projects` URLs
  308-redirect to their `/work` equivalents.
- **Homepage.** Now exactly Hero, Impact and Our Focus. The "What we do"
  grid, latest-posts strip, project map and partner logos are gone (with the
  `maplibre-gl` and `papaparse` dependencies and `public/data/projects.csv`).
- **Content model.** New `report` CPT and `pillar` taxonomy; projects use
  `pillars` instead of `topics`. New ACF: `homepageFields.ourFocus`,
  `reportFields`, `pillarFields`, the options-page `work` group,
  per-row nav `categoriesHeading` / `quickLinksHeading` and `categories` /
  `quickLinks`, and an optional `social` → `icon`. Removed ACF: `missionGrid`, `latestPosts`, `blog*` labels.
- **Header.** Server Component with CSS-only hover dropdowns; uppercase
  top-level links; `/` separators removed. Mobile menu split into
  `MobileNav` and now closes on navigation.
- **Styling.** Sentence-case headings, pill buttons, rounded images, hairline
  borders. `@tailwindcss/typography` (`prose`) replaced the hand-written
  `.rich-text` styles. Footer nav lost its slashes and uppercase.
- **Logo.** Bigger in the header; the footer's is bigger still (`size` prop).
- **Cards** link the title only, stretched over the card, rather than
  wrapping the whole card in one link.
- **WordPress setup** is a plugin now (`yusea-content-model.php`), plus
  `npm run check:cms` to confirm the live schema before deploying. The first
  v2 deploy failed because the live CMS didn't have the new types yet.
- **Revalidation.** New cache tags (`pillars`, `reports`, `report:<slug>`,
  `project:<slug>`, `pages`, `page:<uri>`); `{}` now purges every tag. The WP
  plugin (v1.1.0) sends them for reports and pillar term edits.

## Things to know

**Error pages are the one place copy lives in code.** `app/error.tsx` and
`app/global-error.tsx` show when a render fails — most likely because
WordPress is down — so they cannot fetch their wording from it. The 404 page
is not an error in that sense and reads its copy from the options page.

**No logo is set in the mocks.** With `logo` empty, the header and footer show
`siteName` as a bold `ink` wordmark on a transparent background. Once a logo
is uploaded in WP admin it replaces the wordmark automatically. Upload a
version made for a **white** ground, wide rather than tall (roughly 5:1); it
is scaled by height.

**The footer logo is always bigger than the header's.** `Logo` takes a
`size` prop; both sizes live in one `SIZES` map in
`components/layout/Logo.tsx`. Change them together so the footer stays a
step larger at every breakpoint:

| `size` | Used in | Wordmark | Image height |
|---|---|---|---|
| `md` | Header | `text-3xl`, `lg:text-4xl` | 40px, 48px on `lg` |
| `lg` | Footer | `text-5xl`, `lg:text-6xl` | 56px, 64px on `lg` |

**The mock figures are placeholders.** Every stat in `mocks/homepage.json` carries a
`source` of `"PLACEHOLDER — replace via CMS"`, and that string renders visibly
under each stat. It is deliberately ugly so it cannot ship by accident.

**Social icons.** Each `social` row shows its uploaded `icon` if set,
otherwise a built-in icon for LinkedIn, Facebook, Instagram, YouTube or X,
matched by `platform` name or by the link's domain. A row with neither is
skipped. `platform` is also the link's screen-reader name. Upload icons
square (64×64+, PNG or SVG — WordPress blocks SVG uploads unless a plugin
allows them).

**Header dropdowns are CSS only.** They open on `group-hover` and, for
keyboard users, `group-focus-within`; there is no React state, so the header
is a Server Component. Only `MobileNav` is a client component.

**The report download button is hidden in the mocks.** No mock report has a
`file`; set one in WP to see it.
