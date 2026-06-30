// Common Texas wildlife shown as quick-pick tiles in the species picker. The
// illustrations live in /public/images/species/{slug}.svg and are a first-pass
// set meant to be swapped for final art. Anything not listed here can still be
// added via the picker's "type another" field, so this list does not need to be
// exhaustive.

export type SpeciesOption = { slug: string; label: string };

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { slug: "deer", label: "Deer" },
  { slug: "turkey", label: "Turkey" },
  { slug: "quail", label: "Quail" },
  { slug: "dove", label: "Dove" },
  { slug: "duck", label: "Ducks" },
  { slug: "rabbit", label: "Rabbit" },
  { slug: "hog", label: "Hogs" },
  { slug: "butterfly", label: "Pollinators" },
  { slug: "turtle", label: "Turtles" },
];
