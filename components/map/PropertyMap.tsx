"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { useEffect } from "react";

// Activity icon images mapped to types
const ACTIVITY_ICONS: Record<string, string> = {
  feeders: "/images/activities/icons/feeding.png",
  water_sources: "/images/activities/icons/water.png",
  birdhouses: "/images/activities/icons/shelters.png",
  census: "/images/activities/icons/census.png",
  brush_management: "/images/activities/icons/habitat.png",
  native_planting: "/images/activities/icons/erosion.png",
  predator_management: "/images/activities/icons/predator.png",
};

function getActivityIcon(type?: string) {
  const iconSrc = type && ACTIVITY_ICONS[type];
  if (iconSrc) {
    return L.divIcon({
      html: `<div style="width:40px;height:40px;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:4px;">
        <img src="${iconSrc}" style="width:28px;height:28px;object-fit:contain;" />
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
      className: "",
    });
  }
  // Fallback green circle
  return L.divIcon({
    html: `<div style="width:32px;height:32px;background:#495336;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    className: "",
  });
}

// Property center icon (larger, distinct)
const PropertyCenterIcon = L.divIcon({
  html: `<div style="width:48px;height:48px;background:white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:6px;">
    <img src="/images/activities/icons/house.png" style="width:32px;height:32px;object-fit:contain;" />
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -26],
  className: "",
});

interface ActivityLocation {
  lat: number;
  lng: number;
  label?: string;
  activityType?: string;
}

interface PropertyMapProps {
  center: { lat: number; lng: number };
  propertyName: string;
  locations?: ActivityLocation[];
}

export default function PropertyMap({
  center,
  propertyName,
  locations = [],
}: PropertyMapProps) {
  const position: LatLngExpression = [center.lat, center.lng];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
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

      {/* Center marker for property — always shows name label */}
      <Marker position={position} icon={PropertyCenterIcon}>
        <Tooltip
          permanent
          direction="top"
          offset={[0, -22]}
          className="property-tooltip"
        >
          <strong>{propertyName}</strong>
        </Tooltip>
        <Popup>
          <div className="text-sm">
            <strong style={{ color: "#495336" }}>{propertyName}</strong>
            <p className="text-gray-500 text-xs mt-1">Property Center</p>
          </div>
        </Popup>
      </Marker>

      {/* Activity location markers */}
      {locations.map((location, index) => (
        <Marker
          key={`${location.lat}-${location.lng}-${index}`}
          position={[location.lat, location.lng]}
          icon={getActivityIcon(location.activityType)}
        >
          <Tooltip direction="top" offset={[0, -16]}>
            {location.label || `Location ${index + 1}`}
          </Tooltip>
          <Popup>
            <div className="text-sm">
              <strong style={{ color: "#495336" }}>
                {location.label || `Location ${index + 1}`}
              </strong>
              <p className="text-gray-500 text-xs mt-1">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
