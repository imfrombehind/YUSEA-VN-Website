# YUSEA — Headless WordPress + Next.js

Frontend for the YUSEA regional development platform. Next.js 16 (App Router,
React Server Components), Tailwind v4, MapLibre GL.

**The site runs today with no CMS.** Content comes from fixtures in
`lib/cms/fixtures.ts` until WordPress is ready. See [Connecting
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
  globals.css              Design tokens (this IS the Tailwind config)
  api/revalidate/route.ts  On-demand ISR purge, called by a WP webhook
components/
  layout/                  Header (slash nav), Footer, Logo, SocialIcons
  home/                    Hero, StatsBand, MissionGrid, ProjectsSection, VietnamMap, Partners
  ui/                      ButtonLink, SectionHeading
lib/
  cms/
    index.ts               ← the facade. Components import only from here.
    types.ts               Domain model (the ACF contract)
    queries.ts             WPGraphQL documents
    client.ts              Transport (fetch + ISR tags)
    mappers.ts             WPGraphQL response → domain model
    fixtures.ts            Design-time stand-in content
  projects-csv.ts          CSV → typed nodes → GeoJSON
public/data/projects.csv   Map data source
```

Section IDs match the spec: `#homepage-hero`, `#homepage-section-1` … `-4`.

## Connecting WordPress

Every content call goes through `lib/cms/index.ts`. Each getter returns
fixtures while `WORDPRESS_GRAPHQL_URL` is unset, and hits WPGraphQL once it is.
**Setting that one variable is the entire switch** — no component changes.

```bash
cp .env.example .env.local
# WORDPRESS_GRAPHQL_URL="https://cms.yusea.example/graphql"
```

If a live query throws, the facade logs and falls back to fixtures rather than
blanking the page. Watch for `[cms] … failed` in the server log — that means
you are looking at fixtures, not real content.

### What to build in WordPress

Plugins: WPGraphQL, ACF Pro, WPGraphQL for ACF, Custom Post Type UI.

`lib/cms/queries.ts` was written **before** the CMS on purpose — the field
names in it are the build spec for ACF. Name the field groups to match and the
queries work first try:

| CPT / Options | ACF group      | Fields |
|---|---|---|
| Page `/`      | `homepageFields` | `hero`, `statsBand`, `missionGrid`, `projects`, `partners` |
| `Project`     | `projectFields`  | `latitude`, `longitude`, `city`, `province`, `status`, `metrics[]`, `heroImage` |
| Options page  | `siteSettings`   | `navigation[]`, `footerLinks[]`, `social[]`, `partners[]` |

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

Cache tags in use: `homepage`, `site-settings`, `projects`. Standard ISR window
is 3600s (spec §3).

WordPress side, roughly:

```php
add_action('save_post', function ($post_id, $post) {
  if (wp_is_post_revision($post_id)) return;
  wp_remote_post(YUSEA_FRONTEND . '/api/revalidate', [
    'headers' => [
      'Content-Type'        => 'application/json',
      'x-revalidate-secret' => YUSEA_REVALIDATE_SECRET,
    ],
    'body' => wp_json_encode(['tags' => ['projects', 'homepage']]),
  ]);
}, 10, 2);
```

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

**The fixture figures are placeholders.** Every stat in `fixtures.ts` carries a
`source` of `"PLACEHOLDER — replace via CMS"`, and that string renders visibly
under each stat. It is deliberately ugly so it cannot ship by accident.

**The slash-separated nav is from the spec, not from the reference.**
shiftcities.org uses a conventional menu with dropdowns. The `/` separators are
a YUSEA-specific choice; they are rendered as `aria-hidden` so screen readers
announce a clean list of links.
