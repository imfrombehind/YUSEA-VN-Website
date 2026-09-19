import Papa from "papaparse";

/**
 * Shape of /public/data/projects.csv.
 *
 * The map reads project locations from a static CSV (spec §1/§5) rather than
 * from WordPress. Keeping it static means the map renders without a CMS round
 * trip and stays cheap to cache. When WP becomes the source of truth, either
 * export this CSV from WP on publish, or point `loadProjectNodes` at
 * `getProjects()` — the `ProjectNode` shape is deliberately a subset of the
 * `Project` type so either source satisfies it.
 */
export type ProjectNode = {
  id: string;
  slug: string;
  title: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  status: "active" | "completed" | "planned";
  topic: string;
  summary: string;
};

const VALID_STATUSES = new Set(["active", "completed", "planned"]);

/** Rows with unusable coordinates are dropped rather than crashing the map. */
function isPlottable(node: ProjectNode): boolean {
  return (
    Number.isFinite(node.latitude) &&
    Number.isFinite(node.longitude) &&
    Math.abs(node.latitude) <= 90 &&
    Math.abs(node.longitude) <= 180
  );
}

export function parseProjectCsv(csv: string): ProjectNode[] {
  const { data, errors } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (errors.length) {
    console.warn("[projects-csv] parse warnings", errors.slice(0, 3));
  }

  return data
    .map((row): ProjectNode => {
      const status = (row.status ?? "").trim().toLowerCase();
      return {
        id: row.id?.trim() ?? "",
        slug: row.slug?.trim() ?? "",
        title: row.title?.trim() ?? "",
        city: row.city?.trim() ?? "",
        province: row.province?.trim() ?? "",
        latitude: Number.parseFloat(row.latitude),
        longitude: Number.parseFloat(row.longitude),
        status: (VALID_STATUSES.has(status) ? status : "active") as
          ProjectNode["status"],
        topic: row.topic?.trim() ?? "",
        summary: row.summary?.trim() ?? "",
      };
    })
    .filter(isPlottable);
}

export async function loadProjectNodes(
  url = "/data/projects.csv",
  signal?: AbortSignal,
): Promise<ProjectNode[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Could not load ${url}: ${res.status}`);
  }
  return parseProjectCsv(await res.text());
}

export function toGeoJson(nodes: ProjectNode[]) {
  return {
    type: "FeatureCollection" as const,
    features: nodes.map((node) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [node.longitude, node.latitude],
      },
      properties: { ...node },
    })),
  };
}
