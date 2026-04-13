"use client";

import { useRouter } from "next/navigation";

type Entry = { name: string; tell: string };
type Section = { title: string; intro?: string; entries: Entry[] };

const SECTIONS: Section[] = [
  {
    title: "Deer",
    intro:
      "Three deer species you'll see in the Texas Hill Country. The key is antler shape, tail, and coat pattern.",
    entries: [
      {
        name: "White-tailed Deer",
        tell:
          "Main beam antlers with tines pointing up off a single beam. Tail is brown on top, bright white underneath — flashes white when alarmed. Most common Hill Country deer.",
      },
      {
        name: "Mule Deer",
        tell:
          "Antlers fork — each beam splits into two, and each of those forks again. Large mule-like ears. Tail is white with a black tip. Rare east of the Edwards Plateau; more common in far west Texas.",
      },
      {
        name: "Axis Deer",
        tell:
          "Reddish coat with bright white spots year-round (adults keep spots, unlike whitetail fawns). Antlers have three points — one forward brow tine and a forked main beam. Introduced; common on exotic ranches.",
      },
    ],
  },
  {
    title: "Quail",
    entries: [
      {
        name: "Northern Bobwhite",
        tell:
          "Small, round. Males have a bold white throat and white eye stripe; females are buff/tan in the same spots. Whistles the clear \"bob-WHITE\" call. Most common Hill Country quail.",
      },
      {
        name: "Scaled Quail",
        tell:
          "Gray overall with a scaly pattern on chest and back. White cottony crest on the head (hence \"cotton top\"). Drier western edges of Hill Country.",
      },
    ],
  },
  {
    title: "Turkey",
    entries: [
      {
        name: "Rio Grande Turkey",
        tell:
          "Tail feathers tipped buff/tan (not white). The Hill Country turkey — by far the most common.",
      },
      {
        name: "Eastern Turkey",
        tell:
          "Tail feathers tipped chocolate-brown. Heavier, darker overall. East Texas, only occasional in the Hill Country.",
      },
    ],
  },
  {
    title: "Doves",
    entries: [
      {
        name: "Mourning Dove",
        tell:
          "Slim, long pointed tail. Soft \"coo-OO-oo\" call. Wings whistle on takeoff.",
      },
      {
        name: "White-winged Dove",
        tell:
          "Chunkier with a bold white stripe along the folded wing. Square-ish tail. Call sounds like \"who cooks for you.\"",
      },
    ],
  },
  {
    title: "Predators",
    entries: [
      {
        name: "Coyote",
        tell: "Dog-like, gray-tan, bushy tail held low when running. ~35–45 lb.",
      },
      {
        name: "Grey Fox",
        tell:
          "Much smaller than coyote (~10 lb). Salt-and-pepper gray back, rusty sides, black-tipped tail. Only NA canid that climbs trees.",
      },
      {
        name: "Bobcat",
        tell:
          "Short \"bobbed\" tail (~5 in), tufted ears, spotted coat. Much smaller than a mountain lion.",
      },
    ],
  },
];

export default function SpeciesIdGuidePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-field-ink mb-2">
          Hill Country Species ID
        </h1>
        <p className="text-field-ink/70 mb-8">
          Quick field tells for the wildlife you're most likely to see while doing a census
          in the Texas Hill Country. One or two features per species — enough to log with
          confidence.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="bg-white border border-field-wheat rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-field-ink mb-2">
                {section.title}
              </h2>
              {section.intro && (
                <p className="text-sm text-field-ink/70 mb-4">{section.intro}</p>
              )}
              <ul className="space-y-4">
                {section.entries.map((e) => (
                  <li key={e.name}>
                    <p className="font-semibold text-field-ink">{e.name}</p>
                    <p className="text-sm text-field-ink/80 mt-1">{e.tell}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-xs text-field-ink/50 mt-8">
          When you're unsure, log the category (e.g. "Bird → Other") and add a note —
          you can refine later from a photo.
        </p>
      </div>
    </div>
  );
}
