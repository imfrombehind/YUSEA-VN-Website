/**
 * npm run check:cms
 *
 * Sends every query in lib/cms/queries.ts to the live WordPress and lists
 * the fields it rejects. Run it before setting WORDPRESS_USE_MOCKS="false"
 * or deploying a change that adds fields: a missing field fails the Vercel
 * build (by design — see lib/cms/index.ts).
 *
 * Uses WORDPRESS_GRAPHQL_ENDPOINT from .env.local, or the production CMS.
 * Read-only: queries only, nothing is written.
 */

import { readFileSync } from "node:fs";
import * as queries from "../lib/cms/queries.ts";

function endpoint(): string {
  if (process.env.WORDPRESS_GRAPHQL_ENDPOINT) return process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const match = env.match(/^WORDPRESS_GRAPHQL_ENDPOINT="?([^"\n]+)"?/m);
    if (match) return match[1];
  } catch {
    // No .env.local; fall through to the production CMS.
  }
  return "https://cms.yuseavietnam.com/graphql";
}

/** Single-item queries need a variable; any value checks the schema. */
const VARIABLES: Record<string, Record<string, string>> = {
  PROJECT_BY_SLUG_QUERY: { slug: "schema-check" },
  REPORT_BY_SLUG_QUERY: { slug: "schema-check" },
  POST_BY_SLUG_QUERY: { slug: "schema-check" },
  PAGE_BY_URI_QUERY: { uri: "/about" },
};

const url = endpoint();
console.log(`Checking ${url}\n`);

let failures = 0;
for (const [name, query] of Object.entries(queries)) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: VARIABLES[name] ?? {} }),
  });
  const payload = (await response.json()) as {
    data?: Record<string, unknown>;
    errors?: { message: string }[];
  };
  const errors = [...new Set((payload.errors ?? []).map((e) => e.message))];

  if (errors.length) {
    failures++;
    console.log(`✗ ${name}`);
    errors.forEach((message) => console.log(`    ${message}`));
  } else if (name === "PAGE_BY_URI_QUERY" && !payload.data?.page) {
    console.log(`✓ ${name}  (but there is no page at /about yet: it will 404)`);
  } else {
    console.log(`✓ ${name}`);
  }
}

console.log(
  failures
    ? `\n${failures} quer${failures === 1 ? "y" : "ies"} rejected. Fields inside a type that doesn't exist yet aren't checked, so re-run after fixing these.`
    : "\nAll queries accepted. Safe to build against this CMS.",
);
process.exit(failures ? 1 : 0);
