"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { useEffect } from "react";

// Fix Leaflet default marker icon issue in Next.js/webpack
// The default icons don't load properly due to how webpack handles assets
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom green icon for property center
const PropertyIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "property-marker",
});

interface PropertyMapProps {
  center: { lat: number; lng: number };
  propertyName: string;
  locations?: { lat: number; lng: number; label?: string }[];
}

export default function PropertyMap({
  center,
  propertyName,
  locations = [],
}: PropertyMapProps) {
  const position: LatLngExpression = [center.lat, center.lng];

  // Set default icon for all markers
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Center marker for property */}
      <Marker position={position} icon={PropertyIcon}>
        <Popup>
          <div className="text-sm">
            <strong style={{ color: "#4A7C59" }}>{propertyName}</strong>
            <p className="text-gray-500 text-xs mt-1">Property Center</p>
          </div>
        </Popup>
      </Marker>

      {/* Activity location markers */}
      {locations.map((location, index) => (
        <Marker
          key={`${location.lat}-${location.lng}-${index}`}
          position={[location.lat, location.lng]}
          icon={DefaultIcon}
        >
          <Popup>
            <div className="text-sm">
              <strong style={{ color: "#4A7C59" }}>
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
