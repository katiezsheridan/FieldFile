"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { useState } from "react";

const PropertyIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:4px;">
    <img src="/images/activities/icons/house.png" style="width:24px;height:24px;object-fit:contain;" />
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

const ObservationIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#B64F2F;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: "",
});

interface Props {
  propertyCenter: { lat: number; lng: number } | null;
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number } | null) => void;
  // Where to initially frame the map, when that differs from the property
  // center (e.g. a live GPS pin). The house marker always sits at
  // propertyCenter and never tracks `value`. Defaults to propertyCenter.
  mapCenter?: { lat: number; lng: number } | null;
}

function ClickHandler({ onPick }: { onPick: (c: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function CensusLocationPicker({
  propertyCenter,
  value,
  onChange,
  mapCenter,
}: Props) {
  // Initial view only (Leaflet ignores later center changes): prefer an
  // explicit mapCenter, else the property, else an existing pin, else a
  // Texas-wide fallback so the map never gets NaN coordinates.
  const framed =
    mapCenter ?? propertyCenter ?? value ?? { lat: 31.0, lng: -99.5 };
  const center: LatLngExpression = [framed.lat, framed.lng];

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: "320px", width: "100%" }}
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

      {propertyCenter && (
        <Marker
          position={[propertyCenter.lat, propertyCenter.lng]}
          icon={PropertyIcon}
        />
      )}

      <ClickHandler onPick={onChange} />

      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={ObservationIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const p = m.getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
