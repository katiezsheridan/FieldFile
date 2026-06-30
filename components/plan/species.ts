// Common Texas wildlife shown as quick-pick tiles in the species picker,
// organized into logical groups. Illustrations live in
// /public/images/species/{slug}.svg. Anything not listed can still be added via
// the picker's "type another" field.
//
// `aliases` lets a typed term resolve to the right tile: typing "duck",
// "mallard", or "waterfowl" all select the Ducks tile rather than creating a
// loose chip. Keep aliases lowercase.

export type SpeciesOption = {
  slug: string;
  label: string;
  aliases?: string[];
};

export type SpeciesGroup = {
  label: string;
  species: SpeciesOption[];
};

export const SPECIES_GROUPS: SpeciesGroup[] = [
  {
    label: "Game animals",
    species: [
      {
        slug: "deer",
        label: "Deer",
        aliases: [
          "whitetail",
          "whitetail deer",
          "white-tailed deer",
          "white tailed deer",
          "mule deer",
          "buck",
          "doe",
          "fawn",
        ],
      },
      {
        slug: "hog",
        label: "Hogs",
        aliases: [
          "hog",
          "feral hog",
          "feral hogs",
          "wild hog",
          "pig",
          "wild pig",
          "boar",
          "javelina",
        ],
      },
      {
        slug: "turkey",
        label: "Turkey",
        aliases: ["turkeys", "wild turkey", "rio grande turkey"],
      },
      {
        slug: "quail",
        label: "Quail",
        aliases: ["bobwhite", "bobwhite quail", "blue quail", "scaled quail"],
      },
      {
        slug: "dove",
        label: "Dove",
        aliases: ["doves", "mourning dove", "white-winged dove", "whitewing"],
      },
      {
        slug: "duck",
        label: "Ducks",
        aliases: [
          "duck",
          "waterfowl",
          "mallard",
          "teal",
          "wood duck",
          "goose",
          "geese",
        ],
      },
    ],
  },
  {
    label: "Songbirds & pollinators",
    species: [
      {
        slug: "songbird",
        label: "Songbirds",
        aliases: [
          "songbird",
          "bird",
          "birds",
          "cardinal",
          "painted bunting",
          "bunting",
          "warbler",
          "sparrow",
          "wren",
          "finch",
        ],
      },
      {
        slug: "butterfly",
        label: "Pollinators",
        aliases: [
          "pollinator",
          "butterfly",
          "butterflies",
          "bee",
          "bees",
          "monarch",
          "moth",
        ],
      },
    ],
  },
  {
    label: "Small mammals",
    species: [
      {
        slug: "rabbit",
        label: "Rabbit",
        aliases: ["rabbits", "cottontail", "bunny", "jackrabbit", "hare"],
      },
      {
        slug: "fox",
        label: "Fox",
        aliases: ["foxes", "gray fox", "grey fox", "red fox"],
      },
    ],
  },
  {
    label: "Reptiles",
    species: [
      {
        slug: "turtle",
        label: "Turtles",
        aliases: ["turtle", "tortoise", "terrapin"],
      },
      {
        slug: "snake",
        label: "Snakes",
        aliases: ["snake", "rattlesnake", "rat snake", "bullsnake", "kingsnake"],
      },
    ],
  },
];

// Flat list for matching and custom-chip detection.
export const SPECIES_OPTIONS: SpeciesOption[] = SPECIES_GROUPS.flatMap(
  (g) => g.species
);

const norm = (s: string) => s.trim().toLowerCase();

// Does a stored value correspond to this tile (by label or any alias)?
export function speciesMatches(value: string, option: SpeciesOption): boolean {
  return (
    norm(option.label) === norm(value) ||
    (option.aliases?.some((a) => norm(a) === norm(value)) ?? false)
  );
}

// Find the tile a typed term resolves to, if any.
export function findSpeciesOption(term: string): SpeciesOption | undefined {
  return SPECIES_OPTIONS.find((o) => speciesMatches(term, o));
}
