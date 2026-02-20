"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface ActivityPinsProps {
  locations: { lat: number; lng: number; label?: string }[];
}

// Custom marker icon using field-forest color
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-activity-marker",
    html: `
      <div style="
        background-color: #4A7C59;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function ActivityPins({ locations }: ActivityPinsProps) {
  const customIcon = createCustomIcon();

  return (
    <>
      {locations.map((location, index) => (
        <Marker
          key={`${location.lat}-${location.lng}-${index}`}
          position={[location.lat, location.lng]}
          icon={customIcon}
        >
          {location.label && (
            <Popup>
              <div className="text-sm">
                <strong style={{ color: "#4A7C59" }}>{location.label}</strong>
                <p className="text-gray-500 text-xs mt-1">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </>
  );
}
