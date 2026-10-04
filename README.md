# YUSEA — Headless WordPress + Next.js

Frontend for the YUSEA regional development platform. Next.js 16 (App Router,
React Server Components), Tailwind v4, MapLibre GL.

**The site runs today with no CMS.** Content comes from mock WPGraphQL
responses in `lib/cms/mocks/` until WordPress is ready on
`cms.yuseavietnam.com`. **No visible text or image is written in a component**
— everything comes from ACF fields, posts, or (for the map) the projects CSV. See [Connecting
WordPress](#connecting-wordpress).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Layout

```
app/
  layout.tsx               Fonts, header/footer, skip link
  page.tsx                 Homepage — composes the five spec sections
  blog/page.tsx            Blog index (WP posts)
  blog/[slug]/page.tsx     Single post
  globals.css              Design tokens (this IS the Tailwind config)
  api/revalidate/route.ts  On-demand ISR purge, called by a WP webhook
components/
  layout/                  Header (slash nav), Footer, Logo, SocialIcons
  home/                    Hero, StatsBand, MissionGrid, ProjectsSection, VietnamMap, LatestPosts, Partners
  blog/                    PostCard (shared by /blog and the homepage)
  ui/                      ButtonLink, SectionHeading
lib/
  cms/
    index.ts               ← the facade. Components import only from here.
    types.ts               Domain model (the ACF contract)
    queries.ts             WPGraphQL documents
    client.ts              Transport (fetch + ISR tags)
    mappers.ts             WPGraphQL response → domain model
    mocks/                 Mock WPGraphQL responses, one JSON per query
  projects-csv.ts          CSV → typed nodes → GeoJSON
public/data/projects.csv   Map data source
wordpress/
  yusea-revalidate.php     WP plugin: pings /api/revalidate on publish
```

Section IDs match the spec: `#homepage-hero`, `#homepage-section-1` … `-4`,
plus `#homepage-latest-posts`.

## Connecting WordPress

Every content call goes through `lib/cms/index.ts`. Each getter returns
mocks until the CMS is connected, then hits WPGraphQL. Two variables
control it (set them in `.env.local` and in Vercel → Settings → Environment
Variables):

```bash
WORDPRESS_GRAPHQL_ENDPOINT="https://cms.yuseavietnam.com/graphql"
WORDPRESS_USE_MOCKS="true"   # flip to "false" when WordPress is live
```

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

Plugins: WPGraphQL, ACF Pro, WPGraphQL for ACF, Custom Post Type UI.

`lib/cms/queries.ts` was written **before** the CMS on purpose — the field
names in it are the build spec for ACF. Name the field groups to match and the
queries work first try:

Set each field group's **GraphQL Field Name** exactly as below. Sub-groups
(`hero`, `statsBand`, …) are ACF **Group** fields; `[]` means **Repeater**.

**Page `/`** (set as front page in Settings → Reading) → group `homepageFields`

| Group | Fields |
|---|---|
| `hero` | `headline`, `subheadline`, `ctaLabel`, `ctaHref`, `background` (image) |
| `statsBand` | `eyebrow`, `heading`, `intro`, `stats[]` { `value`, `description`, `source` } |
| `missionGrid` | `eyebrow`, `heading`, `body`, `points[]` { `title`, `body` } |
| `projects` | `eyebrow`, `heading`, `body`, `ctaLabel`, `ctaHref`, `mapErrorText`, `mapCountOne`, `mapCountOther`, `statusActive`, `statusCompleted`, `statusPlanned` |
| `latestPosts` | `eyebrow`, `heading`, `ctaLabel`, `ctaHref` |
| `partners` | `eyebrow`, `heading`, `body`, `ctaLabel`, `ctaHref`, `funderLabel`, `leadLabel`, `partnerLabel`, `image` (image) |

**Options page** (GraphQL type name `SiteSettings`) → group `siteSettingsFields`

`siteName`, `logo` (image), `favicon` (image), `seoTitle`, `seoDescription`, `skipToContentLabel`,
`menuOpenLabel`, `menuCloseLabel`, `footerCopyright` (`{year}` is replaced),
`footerAddress`, `blogEyebrow`, `blogHeading`, `blogIntro`, `blogEmptyText`,
`navigation[]` { `label`, `href` }, `footerLinks[]` { `label`, `href` },
`social[]` { `platform`, `href` }, `partners[]` { `name`, `tier`
(funder/lead/partner), `href`, `logo` (image) }

**`Project` CPT** → group `projectFields`: `latitude`, `longitude`, `city`,
`province`, `status`, `metrics[]` { `value`, `description`, `source` },
`heroImage` (image)

`mapCountOne`/`mapCountOther` take `{count}`, e.g. `{count} project`. An empty
CTA label hides that button. Options page data is publicly queryable over
GraphQL — keep nothing private there.

If the real field names end up differing, fix `queries.ts` and `mappers.ts`.
Nothing under `app/` or `components/` should need to change — that is the
point of the facade.

### Revalidation webhook

`POST /api/revalidate`, authenticated by a shared secret in either the
`x-revalidate-secret` header or a `secret` body key. Comparison is constant
time.

```jsonc
{ "tags": ["projects"], "paths": ["/projects/can-tho"] }  // targeted
{}                                                        // purge homepage deps
```

Cache tags in use: `homepage`, `site-settings`, `projects`, `posts`,
`post:<slug>`. Standard ISR window is 3600s (spec §3).

WordPress side: install `wordpress/yusea-revalidate.php` as a plugin (zip it,
then Plugins → Add New → Upload) and add to `wp-config.php`:

```php
define('YUSEA_FRONTEND_URL', 'https://your-nextjs-site.example');
define('YUSEA_REVALIDATE_SECRET', '<same value as REVALIDATE_SECRET>');
```

The webhook can only reach a deployed frontend, not `localhost`. In local dev,
hard-refresh (Cmd+Shift+R) to bypass the cache instead.

## The map

`components/home/VietnamMap.tsx` parses `public/data/projects.csv` client-side
(Papa Parse) and plots each row as a vector node, coloured by status.

Built on **MapLibre GL, not Mapbox GL** — same API surface and vector
rendering, but no access token, so the map works without provisioning keys. The
basemap is CARTO Positron (also token-free), deliberately muted so the project
nodes carry the visual weight. To move to Mapbox: swap the import for
`mapbox-gl`, set `mapboxgl.accessToken`, point `style` at a Mapbox style URL.
Nothing else in that file changes.

Rows with unparseable coordinates are dropped rather than crashing the map. The
same nodes are also rendered as a scrollable list beside the map, so the
section works by keyboard, by screen reader, and if the basemap fails to load.

To move the map onto WordPress data later, either export this CSV from WP on
publish, or point `loadProjectNodes` at `getProjects()` — `ProjectNode` is a
deliberate subset of `Project`, so either source satisfies it.

## Design system

Tailwind v4 is CSS-first: the `@theme` block in `app/globals.css` **is** the
config. There is no `tailwind.config.js`. Every token becomes a utility
(`--color-navy` → `bg-navy` / `text-navy` / `border-navy`).

Palette derived from an audit of shiftcities.org's compiled stylesheet:

| Token | Hex | Role |
|---|---|---|
| `navy` | `#242456` | Primary ground |
| `coral` | `#f26640` | Dominant accent |
| `sun` | `#ffd450` | Secondary accent, hero CTA |
| `blush` / `mint` / `periwinkle` / `sky` | `#fed3cf` `#c4f4d5` `#e3e6ff` `#f5f8ff` | Pastel section grounds |
| `ink` / `muted` / `faint` / `line` | `#232429` `#55565b` `#828388` `#d3d4d9` | Text and rules |

Nothing has a border radius — the aesthetic is color-blocked and geometric.

**Type:** Archivo (display) + Barlow (body), both with `vietnamese` subsets
loaded. The reference site uses Ambit, a commercial TypeMates face; Archivo is
the closest open substitute. Swap in `app/layout.tsx` if YUSEA licenses Ambit.

## Two things to know

**The mock figures are placeholders.** Every stat in `mocks/homepage.json` carries a
`source` of `"PLACEHOLDER — replace via CMS"`, and that string renders visibly
under each stat. It is deliberately ugly so it cannot ship by accident.

**The slash-separated nav is from the spec, not from the reference.**
shiftcities.org uses a conventional menu with dropdowns. The `/` separators are
a YUSEA-specific choice; they are rendered as `aria-hidden` so screen readers
announce a clean list of links.
