# Technical Pre-Launch Checklist

Audit of the frontend before the Vercel deploy and WordPress go-live
(2026-10-03). Ticked items are already done in the code. File links are
relative to the repo root.

## Done in this pass

- [x] Site-wide metadata defaults: `metadataBase`, title template, description, favicon + Apple icon, theme colour ([app/layout.tsx](app/layout.tsx))
- [x] Per-page canonical URL, Open Graph and Twitter card via `pageMetadata()` ([lib/seo.ts](lib/seo.ts))
- [x] Blog posts tagged `og:type article` with publish date and featured image
- [x] `robots.txt`, closed on preview deployments ([app/robots.ts](app/robots.ts))
- [x] `sitemap.xml` with every route, project, report and post ([app/sitemap.ts](app/sitemap.ts))
- [x] Branded 404 with copy from the CMS ([app/not-found.tsx](app/not-found.tsx))
- [x] Error pages for failed page renders and a failed root layout ([app/error.tsx](app/error.tsx), [app/global-error.tsx](app/global-error.tsx))
- [x] Every index page has an `<h1>` (`as` prop on [SectionHeading](components/ui/SectionHeading.tsx))
- [x] Valid `<dl>` markup in [ImpactSection](components/home/ImpactSection.tsx)
- [x] `prefers-reduced-motion` respected site-wide ([app/globals.css](app/globals.css))
- [x] `priority` → `preload` on hero and post images (deprecated in Next 16)
- [x] Post bodies can't force horizontal scroll (embeds, tables, code blocks)
- [x] Baseline security headers ([next.config.ts](next.config.ts))
- [x] [.env.example](.env.example) listing every variable

## P0 — must fix before launch

- [ ] **Install and activate `wordpress/yusea-content-model.php`** (`npm run wp:zip`), and re-upload `yusea-revalidate.php` (v1.1.0, adds report and pillar purges). This creates the `project`/`report` post types, the `pillar` taxonomy and every v2 field.
- [ ] **`npm run check:cms` passes** against the live CMS. WPGraphQL rejects a whole query if any field is missing, which fails the Vercel build.
- [ ] Add the three pillar terms (with card images), the `/about` page, and the nav dropdown links in WP admin.
- [ ] **Nav and CTAs must point at routes that exist:** `/`, `/about`, `/work`, `/work/projects`, `/work/publications` and the single templates. Add any new route to [app/sitemap.ts](app/sitemap.ts).
- [ ] **Mock content could ship.** If `WORDPRESS_USE_MOCKS` isn't `"false"`, production shows mocks, including the "PLACEHOLDER" stats. Once WordPress is live, fail the build when `VERCEL_ENV=production` and the CMS isn't connected.
- [ ] **Colour contrast (WCAG AA) — needs design sign-off:**
  - [ ] White on `coral` buttons is 3.11:1 (needs 4.5:1). Suggest `coral-700` as the button background.
  - [x] `text-faint` (3.78:1 on white) is no longer used for text; stat sources now use `text-muted`.
  - [ ] Coral focus ring is 2.55:1 on `tint-blue` (needs 3:1). Suggest `ink` or `blue-700`.
- [ ] **Sanitize post HTML.** The single templates ([Prose](components/work/Prose.tsx)) render WordPress HTML raw; a compromised editor account could run scripts on the site. Run `sanitize-html` in the mapper.
- [ ] **Vercel environment variables:** `SITE_URL`, `REVALIDATE_SECRET`, `WORDPRESS_GRAPHQL_ENDPOINT`, `WORDPRESS_USE_MOCKS` (and `WORDPRESS_AUTH_TOKEN` if previews are needed).
- [ ] **Brand assets:** real favicon, Apple touch icon, 1200×630 share image. Add a fallback `app/icon.png` so an empty CMS field doesn't mean no favicon.

## P1 — SEO

- [ ] JSON-LD structured data: `Organization` on the homepage, `BlogPosting` on posts.
- [ ] Query `dateGmt` / `modifiedGmt` instead of `date` — WP's `date` has no timezone, so publish times and sitemap dates are read in the server's timezone.
- [ ] Decide on a Vietnamese version now. `lang="en"` is hard-coded and adding locales later changes every route (plus `hreflang`).
- [ ] Paginate the sitemap once there are more than 100 posts.

## P1 — Accessibility and mobile

- [ ] Mobile menu: close on Escape and move focus into it (it already closes on navigation).
- [ ] Social links open a new tab without warning screen readers. Add an "(opens in new tab)" label from the CMS.
- [x] Cards link the title only, with its hit area stretched over the card.
- [x] Header nav no longer uses `/` separator `<li>`s.
- [ ] Header dropdowns are CSS-only (`group-hover` / `group-focus-within`), so Escape can't close them. Check this with a keyboard user.
- [ ] axe scan plus a manual VoiceOver / TalkBack pass on the preview deployment.

## P1 — Performance

- [ ] Fonts: Archivo is variable — drop its `weight` list to get one file. Check whether Barlow 600/700 are used.
- [ ] Images: add `images.formats: ['image/avif', 'image/webp']`; watch the Vercel image-optimisation quota.
- [ ] Turn on Vercel Speed Insights; run Lighthouse on the preview deployment.

## P2 — Operations

- [ ] Error reporting (e.g. Sentry). The error pages only log to the console.
- [ ] Content-Security-Policy header — test against post embeds.
- [ ] `/api/revalidate`: validate `tags` / `paths` are string arrays (a malformed body gives a 500).
- [ ] Draft previews via `draftMode` (the auth token is already supported).
- [ ] CI running lint, type-check and build on every PR.
- [ ] Uptime monitoring for `cms.yuseavietnam.com`.
