/**
 * WPGraphQL transport.
 *
 * Nothing here runs until WORDPRESS_GRAPHQL_URL is set — see lib/cms/index.ts,
 * which falls back to fixtures while the CMS is still being built.
 */

export class CmsError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message);
    this.name = "CmsError";
  }
}

type QueryOptions = {
  variables?: Record<string, unknown>;
  /** ISR window in seconds. Spec §3 calls for 3600 on standard pages. */
  revalidate?: number;
  /** Cache tags, so /api/revalidate can purge precisely. */
  tags?: string[];
};

export async function wpQuery<T>(
  query: string,
  { variables, revalidate = 3600, tags = [] }: QueryOptions = {},
): Promise<T> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

  if (!endpoint) {
    throw new CmsError(
      "WORDPRESS_GRAPHQL_URL is not set. Data calls should not reach the " +
        "transport layer while the site is running on fixtures.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Optional: only needed for previewing drafts or private fields.
  if (process.env.WORDPRESS_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WORDPRESS_AUTH_TOKEN}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags },
  });

  if (!response.ok) {
    throw new CmsError(
      `WPGraphQL responded ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    throw new CmsError(
      `WPGraphQL returned errors: ${payload.errors
        .map((e) => e.message)
        .join("; ")}`,
      payload.errors,
    );
  }

  if (!payload.data) {
    throw new CmsError("WPGraphQL returned no data.");
  }

  return payload.data;
}
