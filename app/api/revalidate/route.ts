import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * On-demand revalidation endpoint (spec §3).
 *
 * Point a WordPress webhook here on save/publish. Suggested WP-side hook:
 *   add_action('save_post', fn($id, $post) => wp_remote_post(...));
 *
 * Expected body:
 *   { "secret": "…", "tags": ["projects"], "paths": ["/work/projects/can-tho"] }
 *
 * The secret is compared in constant time so this endpoint cannot be used as
 * an oracle to recover it one character at a time.
 */

export const dynamic = "force-dynamic";

/** Every cache tag in lib/cms, purged when no target is given. */
const PURGE_TAGS = [
  "homepage",
  "site-settings",
  "pillars",
  "projects",
  "reports",
  "posts",
  "pages",
] as const;

/**
 * Expire purged data outright, so the next visit rebuilds the page with
 * fresh content. "max" would serve the old page once more while it rebuilds
 * in the background, which editors see as their change appearing and then
 * vanishing on refresh (WP sends one purge for the body and another for the
 * meta boxes, so a page can be caught half-saved in between).
 */
const EXPIRE_NOW = { expire: 0 };

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { revalidated: false, message: "REVALIDATE_SECRET is not configured." },
      { status: 500 },
    );
  }

  let body: { secret?: string; tags?: string[]; paths?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, message: "Body must be JSON." },
      { status: 400 },
    );
  }

  // Header is the tidier option for WP; body is kept for convenience.
  const provided = request.headers.get("x-revalidate-secret") ?? body.secret ?? "";

  if (!safeEqual(provided, expected)) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401 },
    );
  }

  const tags = body.tags ?? [];
  const paths = body.paths ?? [];

  // With no explicit target, purge everything.
  if (tags.length === 0 && paths.length === 0) {
    PURGE_TAGS.forEach((tag) => revalidateTag(tag, EXPIRE_NOW));
    revalidatePath("/");
    return NextResponse.json({
      revalidated: true,
      scope: "default",
      now: Date.now(),
    });
  }

  tags.forEach((tag) => revalidateTag(tag, EXPIRE_NOW));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: true, tags, paths, now: Date.now() });
}
