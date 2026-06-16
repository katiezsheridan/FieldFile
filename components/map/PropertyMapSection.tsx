"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PropertyWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import MapWrapper from "@/components/map/MapWrapper";

interface PropertyMapSectionProps {
  property: PropertyWithDetails;
  // Called after a location/property coordinate change so the parent refetches.
  onChange: () => void;
}

// The property map as a self-contained section: the Leaflet map plus the
// add-location and correct-location forms and the activity legend.
export default function PropertyMapSection({
  property,
  onChange,
}: PropertyMapSectionProps) {
  const [open, setOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionLat, setCorrectionLat] = useState("");
  const [correctionLng, setCorrectionLng] = useState("");
  const [correctionAddress, setCorrectionAddress] = useState("");
  const [correcting, setCorrecting] = useState(false);

  // Collect all activity locations for the map
  const activityPins = property.activities.flatMap((activity) =>
    (activity.locations || []).map((loc) => ({
      ...loc,
      label: loc.label || activity.name,
      activityType: activity.type,
    }))
  );

  // Default map center: property coordinates, first pin, or central Texas
  const mapCenter =
    property.coordinates.lat && property.coordinates.lng
      ? property.coordinates
      : activityPins.length > 0
      ? { lat: activityPins[0].lat, lng: activityPins[0].lng }
      : { lat: 30.25, lng: -97.75 };

  const handleAddLocation = async () => {
    if (!selectedActivity || !lat || !lng) return;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;

    setSaving(true);

    const activity = property.activities.find((a) => a.id === selectedActivity);
    if (!activity) {
      setSaving(false);
      return;
    }

    const newLocation = {
      lat: parsedLat,
      lng: parsedLng,
      label: label || activity.name,
    };

    const updatedLocations = [...(activity.locations || []), newLocation];

    const { error } = await supabase
      .from("activities")
      .update({
        locations: updatedLocations,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedActivity);

    setSaving(false);

    if (!error) {
      setLat("");
      setLng("");
      setLabel("");
      setSelectedActivity("");
      setShowAddForm(false);
      onChange();
    }
  };

  const handleCorrectLocation = async () => {
    setCorrecting(true);

    let newLat = parseFloat(correctionLat);
    let newLng = parseFloat(correctionLng);

    // If they entered an address instead of coordinates, geocode it
    if (correctionAddress && (isNaN(newLat) || isNaN(newLng))) {
      try {
        const query = encodeURIComponent(
          `${correctionAddress}, ${property.county} County, TX`
        );
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
        );
        const data = await res.json();
        if (data.length > 0) {
          newLat = parseFloat(data[0].lat);
          newLng = parseFloat(data[0].lon);
        } else {
          setCorrecting(false);
          return;
        }
      } catch {
        setCorrecting(false);
        return;
      }
    }

    if (isNaN(newLat) || isNaN(newLng)) {
      setCorrecting(false);
      return;
    }

    const { error } = await supabase
      .from("properties")
      .update({ lat: newLat, lng: newLng, updated_at: new Date().toISOString() })
      .eq("id", property.id);

    setCorrecting(false);

    if (!error) {
      setCorrectionLat("");
      setCorrectionLng("");
      setCorrectionAddress("");
      setShowCorrectionForm(false);
      onChange();
    }
  };

  return (
    <section className="bg-white border border-field-wheat rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4",
          open && "border-b border-field-wheat/50"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 text-left"
        >
          <svg
            className={cn(
              "w-5 h-5 text-field-earth transition-transform duration-200",
              open && "rotate-90"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          <span>
            <span className="block text-xl font-semibold text-field-ink">
              Property Map
            </span>
            <span className="block text-sm text-field-ink/60">
              {activityPins.length}{" "}
              {activityPins.length === 1 ? "location" : "locations"} marked
            </span>
          </span>
        </button>
        {open && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCorrectionForm(!showCorrectionForm);
                if (showAddForm) setShowAddForm(false);
              }}
              className="px-4 py-2 border border-field-wheat text-field-ink text-sm font-medium rounded-lg hover:bg-field-mist transition-colors"
            >
              {showCorrectionForm ? "Cancel" : "Correct location"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showCorrectionForm) setShowCorrectionForm(false);
              }}
              className="px-4 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90 transition-colors"
            >
              {showAddForm ? "Cancel" : "+ Add Location"}
            </button>
          </div>
        )}
      </div>

      {open && (
        <>
          {/* collapsible body */}

      {/* Correct property location form */}
      {showCorrectionForm && (
        <div className="px-6 py-4 border-b border-field-wheat/50">
          <p className="text-sm font-medium text-field-ink mb-3">
            Update your property&apos;s map location
          </p>
          <div className="max-w-3xl flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Re-enter address
              </label>
              <input
                type="text"
                value={correctionAddress}
                onChange={(e) => setCorrectionAddress(e.target.value)}
                placeholder="e.g. 210 Cuesta Pass, Driftwood, TX"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <span className="text-sm text-field-ink/40 pb-2">or</span>
            <div className="w-32">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={correctionLat}
                onChange={(e) => setCorrectionLat(e.target.value)}
                placeholder="30.2500"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={correctionLng}
                onChange={(e) => setCorrectionLng(e.target.value)}
                placeholder="-97.7500"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <button
              onClick={handleCorrectLocation}
              disabled={(!correctionAddress && (!correctionLat || !correctionLng)) || correcting}
              className="px-5 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {correcting ? "Updating..." : "Update location"}
            </button>
          </div>
          <p className="text-xs text-field-ink/40 mt-3">
            Enter a full street address to re-geocode, or paste exact GPS coordinates from Google/Apple Maps.
          </p>
        </div>
      )}

      {/* Add location form */}
      {showAddForm && (
        <div className="px-6 py-4 border-b border-field-wheat/50">
          <div className="max-w-4xl flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Activity
              </label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              >
                <option value="">Select an activity</option>
                {property.activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="30.2500"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-97.7500"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-field-ink mb-1">
                Label{" "}
                <span className="text-field-ink/40 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. North feeder"
                className="w-full px-3 py-2 border border-field-wheat rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/20"
              />
            </div>
            <button
              onClick={handleAddLocation}
              disabled={!selectedActivity || !lat || !lng || saving}
              className="px-5 py-2 bg-field-forest text-white text-sm font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Add pin"}
            </button>
          </div>
          <p className="text-xs text-field-ink/40 mt-3">
            To find GPS coordinates: open Google Maps or Apple Maps, long-press
            on the exact location, and copy the coordinates shown.
          </p>
        </div>
      )}

      {/* Map */}
      <div className="h-[480px]">
        <MapWrapper
          center={mapCenter}
          propertyName={property.name}
          locations={activityPins}
        />
      </div>

      {/* Activity legend */}
      {activityPins.length > 0 && (
        <div className="px-6 py-3 border-t border-field-wheat/50">
          <div className="flex flex-wrap gap-4 text-sm">
            {property.activities
              .filter((a) => a.locations && a.locations.length > 0)
              .map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        {
                          feeders: "#B8860B",
                          water_sources: "#2E86C1",
                          birdhouses: "#8B4513",
                          census: "#6C3483",
                          brush_management: "#27AE60",
                          native_planting: "#1E8449",
                          predator_management: "#C0392B",
                        }[a.type] || "#495336",
                    }}
                  />
                  <span className="text-field-ink/70">
                    {a.name} ({a.locations?.length})
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
        </>
      )}
    </section>
  );
}
