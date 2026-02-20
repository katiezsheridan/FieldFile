import { PropertyWithDetails } from "./types";

export const demoProperties: PropertyWithDetails[] = [
  {
    id: "prop-1",
    name: "Bark Springs",
    address: "210 Cuesta Pass, Driftwood, TX 78619",
    county: "Hays",
    state: "TX",
    acreage: 150,
    exemptionType: "wildlife",
    coordinates: { lat: 30.094967333215905, lng: -98.09069518780073 },
    activities: [
      {
        id: "act-1",
        propertyId: "prop-1",
        type: "birdhouses",
        name: "Nest Box Installation & Monitoring",
        description: "Install and maintain nest boxes for cavity-nesting birds",
        status: "complete",
        requiredEvidence: [
          { type: "photo", description: "Photos of installed nest boxes", required: true },
          { type: "gps", description: "GPS coordinates of each box", required: true },
          { type: "date", description: "Installation/inspection dates", required: true },
        ],
        documents: [
          { id: "doc-1", activityId: "act-1", type: "photo", name: "nestbox-north-pasture.jpg", url: "/demo/nestbox1.jpg", uploadedAt: "2024-03-15" },
          { id: "doc-2", activityId: "act-1", type: "photo", name: "nestbox-creek-area.jpg", url: "/demo/nestbox2.jpg", uploadedAt: "2024-03-15" },
        ],
        notes: "Installed 8 bluebird boxes along fence line",
        dueDate: "2025-02-01",
        completedDate: "2024-03-15",
        locations: [
          { lat: 30.2755, lng: -98.8725, label: "Box 1 - North Pasture" },
          { lat: 30.2748, lng: -98.8715, label: "Box 2 - Creek Area" },
        ],
      },
      {
        id: "act-2",
        propertyId: "prop-1",
        type: "feeders",
        name: "Supplemental Feeding",
        description: "Maintain feeders for wildlife during stress periods",
        status: "complete",
        requiredEvidence: [
          { type: "photo", description: "Photos of feeders", required: true },
          { type: "receipt", description: "Feed purchase receipts", required: true },
        ],
        documents: [
          { id: "doc-3", activityId: "act-2", type: "photo", name: "deer-feeder.jpg", url: "/demo/feeder1.jpg", uploadedAt: "2024-06-20" },
          { id: "doc-4", activityId: "act-2", type: "receipt", name: "feed-receipt-june.pdf", url: "/demo/receipt1.pdf", uploadedAt: "2024-06-22" },
        ],
        notes: "Protein feeders filled monthly",
        dueDate: "2025-02-01",
        completedDate: "2024-06-20",
      },
      {
        id: "act-3",
        propertyId: "prop-1",
        type: "water_sources",
        name: "Water Source Enhancement",
        description: "Maintain and improve water availability for wildlife",
        status: "in_progress",
        requiredEvidence: [
          { type: "photo", description: "Before/after photos of water sources", required: true },
          { type: "receipt", description: "Equipment/maintenance receipts", required: false },
        ],
        documents: [
          { id: "doc-5", activityId: "act-3", type: "photo", name: "pond-before.jpg", url: "/demo/pond1.jpg", uploadedAt: "2024-09-10" },
        ],
        notes: "Need to photograph completed pond work",
        dueDate: "2025-02-01",
      },
      {
        id: "act-4",
        propertyId: "prop-1",
        type: "census",
        name: "Wildlife Census",
        description: "Document wildlife populations on the property",
        status: "not_started",
        requiredEvidence: [
          { type: "photo", description: "Trail camera photos", required: true },
          { type: "date", description: "Observation dates and counts", required: true },
        ],
        documents: [],
        notes: "",
        dueDate: "2025-02-01",
      },
    ],
    filing: {
      id: "filing-1",
      propertyId: "prop-1",
      year: 2024,
      status: "draft",
    },
  },
  {
    id: "prop-2",
    name: "Bluebonnet Acres",
    address: "5678 Hill Country Lane, Dripping Springs, TX 78620",
    county: "Travis",
    state: "TX",
    acreage: 80,
    exemptionType: "wildlife",
    coordinates: { lat: 30.1902, lng: -98.0868 },
    activities: [
      {
        id: "act-5",
        propertyId: "prop-2",
        type: "native_planting",
        name: "Native Seed Planting",
        description: "Plant native grasses and wildflowers",
        status: "complete",
        requiredEvidence: [
          { type: "photo", description: "Photos of planted areas", required: true },
          { type: "receipt", description: "Seed purchase receipts", required: true },
        ],
        documents: [
          { id: "doc-6", activityId: "act-5", type: "photo", name: "native-planting.jpg", url: "/demo/planting1.jpg", uploadedAt: "2024-04-10" },
          { id: "doc-7", activityId: "act-5", type: "receipt", name: "seed-receipt.pdf", url: "/demo/receipt2.pdf", uploadedAt: "2024-04-05" },
        ],
        notes: "Planted 5 acres of native wildflower mix",
        dueDate: "2025-02-01",
        completedDate: "2024-04-10",
      },
      {
        id: "act-6",
        propertyId: "prop-2",
        type: "brush_management",
        name: "Brush Management",
        description: "Selective clearing to improve habitat",
        status: "complete",
        requiredEvidence: [
          { type: "photo", description: "Before/after photos", required: true },
        ],
        documents: [
          { id: "doc-8", activityId: "act-6", type: "photo", name: "brush-before.jpg", url: "/demo/brush1.jpg", uploadedAt: "2024-02-15" },
          { id: "doc-9", activityId: "act-6", type: "photo", name: "brush-after.jpg", url: "/demo/brush2.jpg", uploadedAt: "2024-02-20" },
        ],
        notes: "Created brush piles for wildlife cover",
        dueDate: "2025-02-01",
        completedDate: "2024-02-20",
      },
      {
        id: "act-7",
        propertyId: "prop-2",
        type: "birdhouses",
        name: "Nest Box Program",
        description: "Install and monitor nest boxes",
        status: "complete",
        requiredEvidence: [
          { type: "photo", description: "Photos of nest boxes", required: true },
          { type: "gps", description: "GPS locations", required: true },
        ],
        documents: [
          { id: "doc-10", activityId: "act-7", type: "photo", name: "nestboxes.jpg", url: "/demo/nestbox3.jpg", uploadedAt: "2024-03-01" },
        ],
        notes: "6 boxes installed, all documented",
        dueDate: "2025-02-01",
        completedDate: "2024-03-01",
        locations: [
          { lat: 30.1905, lng: -98.0870, label: "Box 1" },
          { lat: 30.1900, lng: -98.0865, label: "Box 2" },
        ],
      },
    ],
    filing: {
      id: "filing-2",
      propertyId: "prop-2",
      year: 2024,
      status: "ready_to_file",
    },
  },
];

export function getProperty(id: string): PropertyWithDetails | undefined {
  return demoProperties.find((p) => p.id === id);
}

export function getDeadlineDays(): number {
  return 45; // Demo: 45 days until filing deadline
}
