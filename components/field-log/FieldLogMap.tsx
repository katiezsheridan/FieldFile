"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  PRACTICE_CATEGORY_COLORS,
  practiceCategoryLabel,
} from "@/lib/field-log";
import type { FieldLogEntry, PracticeCategory } from "@/lib/types";

export type MapEntry = FieldLogEntry & { photoUrl?: string | null };

// A colored dot per practice category — Leaflet divIcons take an explicit color,
// so this draws straight from PRACTICE_CATEGORY_COLORS (same hue as the legend).
function categoryIcon(category: PracticeCategory) {
  const color = PRACTICE_CATEGORY_COLORS[category] ?? "#495336";
  return L.divIcon({
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
    className: "",
  });
}

const PropertyCenterIcon = L.divIcon({
  html: `<div style="width:40px;height:40px;background:white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:5px;">
    <img src="/images/activities/icons/house.png" style="width:26px;height:26px;object-fit:contain;" />
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: "",
});

// Frame the view to the data: a single marker gets a fixed zoom, several get a
// fitted bounds. Runs whenever the point set changes (e.g. filters applied).
function FitToData({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

function shortDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

interface Props {
  entries: MapEntry[];
  center?: { lat: number; lng: number } | null;
  propertyName?: string;
  propertyId?: string;
  height?: number;
  // Draw a translucent GPS-accuracy circle around each located pin (detail view).
  showAccuracy?: boolean;
  // Whether marker popups link through to the entry detail page (overview view).
  linkToDetail?: boolean;
}

// A read-only map of field-log entries, one colored pin per practice category.
// Used both for the property-wide overview (many pins, links to detail) and the
// single-entry detail map (one pin + accuracy circle).
export default function FieldLogMap({
  entries,
  center,
  propertyName,
  propertyId,
  height = 420,
  showAccuracy = false,
  linkToDetail = true,
}: Props) {
  const located = useMemo(
    () => entries.filter((e) => e.latitude != null && e.longitude != null),
    [entries]
  );

  const points = useMemo<[number, number][]>(() => {
    const pts = located.map(
      (e) => [e.latitude as number, e.longitude as number] as [number, number]
    );
    if (center) pts.push([center.lat, center.lng]);
    return pts;
  }, [located, center]);

  const initial: LatLngExpression = center
    ? [center.lat, center.lng]
    : located[0]
      ? [located[0].latitude as number, located[0].longitude as number]
      : [31.0, -99.5]; // Texas, as a last resort when nothing is located

  return (
    <MapContainer
      center={initial}
      zoom={14}
      scrollWheelZoom
      style={{ height, width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution=""
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
      />

      <FitToData points={points} />

      {center && (
        <Marker position={[center.lat, center.lng]} icon={PropertyCenterIcon}>
          {propertyName && (
            <Tooltip direction="top" offset={[0, -20]}>
              <strong>{propertyName}</strong>
            </Tooltip>
          )}
        </Marker>
      )}

      {showAccuracy &&
        located.map(
          (e) =>
            e.gpsAccuracyMeters != null && (
              <Circle
                key={`acc-${e.id}`}
                center={[e.latitude as number, e.longitude as number]}
                radius={e.gpsAccuracyMeters}
                pathOptions={{
                  color: PRACTICE_CATEGORY_COLORS[e.practiceCategory],
                  weight: 1,
                  fillOpacity: 0.12,
                }}
              />
            )
        )}

      {located.map((e) => (
        <Marker
          key={e.id}
          position={[e.latitude as number, e.longitude as number]}
          icon={categoryIcon(e.practiceCategory)}
        >
          <Popup>
            <div className="text-sm" style={{ minWidth: 150 }}>
              <strong style={{ color: "#322B2A" }}>
                {practiceCategoryLabel(e.practiceCategory)}
              </strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {shortDate(e.capturedAt || e.createdAt)}
              </p>
              {e.note && (
                <p className="text-gray-600 text-xs mt-1">{e.note}</p>
              )}
              {linkToDetail && propertyId && (
                <Link
                  href={`/properties/${propertyId}/field-log/${e.id}`}
                  className="inline-block mt-2 text-xs font-medium"
                  style={{ color: "#495336" }}
                >
                  View details →
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
