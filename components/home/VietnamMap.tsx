"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadProjectNodes, toGeoJson, type ProjectNode } from "@/lib/projects-csv";
import type { MapLabels } from "@/lib/cms/types";

/**
 * Interactive vector map of Viet Nam, plotting project locations parsed
 * client-side from a static CSV (spec §5).
 *
 * Library choice: MapLibre GL, not Mapbox GL. Same API surface and vector
 * rendering, but no access token, so this works without provisioning keys.
 * To move to Mapbox later: swap the import for `mapbox-gl`, set
 * `mapboxgl.accessToken`, and point `style` at a Mapbox style URL. Nothing
 * else in this file needs to change.
 */

const SOURCE_ID = "yusea-projects";
const BOUNDS: [[number, number], [number, number]] = [
  [99.5, 6.5],
  [112.5, 24.5],
];

const STATUS_COLORS: Record<ProjectNode["status"], string> = {
  active: "#f26640",
  completed: "#242456",
  planned: "#ffd450",
};

const STATUSES = Object.keys(STATUS_COLORS) as ProjectNode["status"][];

export function VietnamMap({ labels }: { labels: MapLabels }) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);

  const [nodes, setNodes] = useState<ProjectNode[]>([]);
  const [selected, setSelected] = useState<ProjectNode | null>(null);
  const [error, setError] = useState(false);

  /* 1. Parse the CSV. */
  useEffect(() => {
    const controller = new AbortController();

    loadProjectNodes(undefined, controller.signal)
      .then(setNodes)
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        console.error("[VietnamMap] CSV load failed", err);
        setError(true);
      });

    return () => controller.abort();
  }, []);

  /* 2. Build the map once. */
  useEffect(() => {
    if (!container.current || map.current) return;

    const instance = new MapLibreMap({
      container: container.current,
      // Token-free vector basemap. Muted on purpose: the project nodes,
      // not the basemap, should carry the visual weight.
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      bounds: BOUNDS,
      fitBoundsOptions: { padding: 40 },
      maxBounds: [
        [92, 0],
        [120, 30],
      ],
      minZoom: 3.5,
      maxZoom: 10,
      attributionControl: { compact: true },
    });

    instance.addControl(
      new NavigationControl({ showCompass: false }),
      "top-right",
    );
    instance.on("error", (e: { error?: unknown }) => {
      console.error("[VietnamMap] maplibre error", e?.error ?? e);
    });

    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  /* 3. Push nodes onto the map whenever either becomes ready. */
  useEffect(() => {
    const instance = map.current;
    if (!instance || nodes.length === 0) return;

    const geojson = toGeoJson(nodes);

    const draw = () => {
      if (instance.getSource(SOURCE_ID)) {
        (instance.getSource(SOURCE_ID) as GeoJSONSource).setData(geojson);
        return;
      }

      instance.addSource(SOURCE_ID, { type: "geojson", data: geojson });

      // Halo, so nodes stay legible against any basemap tone.
      instance.addLayer({
        id: `${SOURCE_ID}-halo`,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 10, 9, 22],
          "circle-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      instance.addLayer({
        id: `${SOURCE_ID}-node`,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 6, 9, 14],
          "circle-color": [
            "match",
            ["get", "status"],
            "active",
            STATUS_COLORS.active,
            "completed",
            STATUS_COLORS.completed,
            "planned",
            STATUS_COLORS.planned,
            STATUS_COLORS.active,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      const layer = `${SOURCE_ID}-node`;

      instance.on("click", layer, (e: MapLayerMouseEvent) => {
        const props = e.features?.[0]?.properties as ProjectNode | undefined;
        if (props) setSelected(props);
      });
      instance.on("mouseenter", layer, () => {
        instance.getCanvas().style.cursor = "pointer";
      });
      instance.on("mouseleave", layer, () => {
        instance.getCanvas().style.cursor = "";
      });
    };

    if (instance.isStyleLoaded()) {
      draw();
    } else {
      instance.once("load", draw);
    }
  }, [nodes]);

  return (
    <div className="grid gap-px bg-line lg:grid-cols-[1fr_360px]">
      <div className="relative min-h-[420px] bg-paper lg:min-h-[620px]">
        <div ref={container} className="absolute inset-0" />

        {error && labels.errorText ? (
          <p className="absolute inset-x-0 bottom-0 bg-navy px-4 py-3 text-sm text-white">
            {labels.errorText}
          </p>
        ) : null}

        <ul className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap gap-3 bg-paper/95 px-4 py-3">
          {STATUSES.map((status) => (
            <li key={status} className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-muted">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full ring-2 ring-white"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              {labels.status[status]}
            </li>
          ))}
        </ul>
      </div>

      {/* The map is not the only way to reach this content: the same nodes are
          listed here, which keeps the section usable by keyboard and by
          screen readers, and if the basemap fails to load. */}
      <div className="max-h-[620px] overflow-y-auto bg-paper">
        <h3 className="sticky top-0 z-10 border-b border-line bg-paper px-6 py-4 text-sm tracking-[0.14em] text-navy">
          {(nodes.length === 1 ? labels.countOne : labels.countOther).replace(
            "{count}",
            String(nodes.length),
          )}
        </h3>

        <ul>
          {nodes.map((node) => {
            const isSelected = selected?.id === node.id;
            return (
              <li key={node.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(node);
                    map.current?.flyTo({
                      center: [node.longitude, node.latitude],
                      zoom: 8,
                      duration: 900,
                    });
                  }}
                  className={`w-full px-6 py-5 text-left transition-colors hover:bg-sky ${
                    isSelected ? "bg-sky" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[node.status] }}
                    />
                    <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-faint">
                      {node.province}
                    </span>
                  </span>
                  <span className="mt-2 block font-display text-lg font-bold uppercase leading-tight text-navy">
                    {node.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-snug text-muted">
                    {node.summary}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
