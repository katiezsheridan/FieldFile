"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/StepIndicator";
import WizardStep from "@/components/onboarding/WizardStep";

// Texas zip code to county mapping (common Hill Country / Central Texas zips)
const texasZipToCounty: Record<string, string> = {
  // Travis County
  "78701": "Travis", "78702": "Travis", "78703": "Travis", "78704": "Travis", "78705": "Travis",
  "78712": "Travis", "78717": "Travis", "78719": "Travis", "78721": "Travis", "78722": "Travis",
  "78723": "Travis", "78724": "Travis", "78725": "Travis", "78726": "Travis", "78727": "Travis",
  "78728": "Travis", "78729": "Travis", "78730": "Travis", "78731": "Travis", "78732": "Travis",
  "78733": "Travis", "78734": "Travis", "78735": "Travis", "78736": "Travis", "78737": "Travis",
  "78738": "Travis", "78739": "Travis", "78741": "Travis", "78742": "Travis", "78744": "Travis",
  "78745": "Travis", "78746": "Travis", "78747": "Travis", "78748": "Travis", "78749": "Travis",
  "78750": "Travis", "78751": "Travis", "78752": "Travis", "78753": "Travis", "78754": "Travis",
  "78756": "Travis", "78757": "Travis", "78758": "Travis", "78759": "Travis",
  // Hays County
  "78610": "Hays", "78619": "Hays", "78620": "Hays", "78640": "Hays", "78666": "Hays",
  "78676": "Hays",
  // Williamson County
  "78613": "Williamson", "78626": "Williamson", "78628": "Williamson", "78633": "Williamson",
  "78634": "Williamson", "78641": "Williamson", "78642": "Williamson", "78664": "Williamson",
  "78665": "Williamson", "78681": "Williamson",
  // Gillespie County
  "78624": "Gillespie", "78631": "Gillespie", "78671": "Gillespie",
  // Blanco County
  "78606": "Blanco", "78636": "Blanco", "78663": "Blanco",
  // Burnet County
  "78608": "Burnet", "78609": "Burnet", "78611": "Burnet", "78639": "Burnet", "78654": "Burnet",
  // Comal County
  "78130": "Comal", "78132": "Comal", "78133": "Comal", "78163": "Comal",
  // Kendall County
  "78004": "Kendall", "78006": "Kendall", "78015": "Kendall",
  // Kerr County
  "78024": "Kerr", "78025": "Kerr", "78028": "Kerr", "78029": "Kerr",
  // Bexar County
  "78201": "Bexar", "78202": "Bexar", "78203": "Bexar", "78204": "Bexar", "78205": "Bexar",
  "78206": "Bexar", "78207": "Bexar", "78208": "Bexar", "78209": "Bexar", "78210": "Bexar",
  "78211": "Bexar", "78212": "Bexar", "78213": "Bexar", "78214": "Bexar", "78215": "Bexar",
  "78216": "Bexar", "78217": "Bexar", "78218": "Bexar", "78219": "Bexar", "78220": "Bexar",
  "78221": "Bexar", "78222": "Bexar", "78223": "Bexar", "78224": "Bexar", "78225": "Bexar",
  "78226": "Bexar", "78227": "Bexar", "78228": "Bexar", "78229": "Bexar", "78230": "Bexar",
  "78231": "Bexar", "78232": "Bexar", "78233": "Bexar", "78234": "Bexar", "78235": "Bexar",
  "78236": "Bexar", "78237": "Bexar", "78238": "Bexar", "78239": "Bexar", "78240": "Bexar",
  "78241": "Bexar", "78242": "Bexar", "78243": "Bexar", "78244": "Bexar", "78245": "Bexar",
  "78246": "Bexar", "78247": "Bexar", "78248": "Bexar", "78249": "Bexar", "78250": "Bexar",
  "78251": "Bexar", "78252": "Bexar", "78253": "Bexar", "78254": "Bexar", "78255": "Bexar",
  "78256": "Bexar", "78257": "Bexar", "78258": "Bexar", "78259": "Bexar", "78260": "Bexar",
  "78261": "Bexar", "78263": "Bexar", "78264": "Bexar", "78266": "Bexar",
  // Bastrop County
  "78602": "Bastrop", "78612": "Bastrop", "78617": "Bastrop", "78621": "Bastrop", "78653": "Bastrop",
  "78659": "Bastrop",
  // Caldwell County
  "78616": "Caldwell", "78622": "Caldwell", "78644": "Caldwell", "78648": "Caldwell", "78655": "Caldwell",
  // Llano County
  "78607": "Llano", "78643": "Llano", "78672": "Llano",
  // Mason County
  "76856": "Mason", "76869": "Mason",
  // Real County
  "78873": "Real", "78880": "Real",
  // Bandera County
  "78003": "Bandera", "78055": "Bandera", "78063": "Bandera",
  // Medina County
  "78009": "Medina", "78016": "Medina", "78023": "Medina", "78039": "Medina", "78052": "Medina",
  "78056": "Medina", "78057": "Medina", "78059": "Medina", "78066": "Medina",
  // Uvalde County
  "78801": "Uvalde", "78802": "Uvalde", "78838": "Uvalde",
  // Edwards County (78880 is shared with Real County)
  // Kimble County
  "76849": "Kimble",
  // Sutton County
  "76950": "Sutton",
};

// Activity options for wildlife management interests
const activityOptions = [
  {
    id: "nest_boxes",
    label: "Nest Boxes",
    description: "Install and maintain boxes for birds, bats, or other wildlife",
  },
  {
    id: "supplemental_feeding",
    label: "Supplemental Feeding",
    description: "Feeders, food plots, and native browse management",
  },
  {
    id: "water_sources",
    label: "Water Sources",
    description: "Ponds, troughs, and drip systems for wildlife",
  },
  {
    id: "brush_management",
    label: "Brush Management",
    description: "Clearing, selective trimming, and prescribed burns",
  },
  {
    id: "native_planting",
    label: "Native Planting",
    description: "Establishing native grasses, forbs, and trees",
  },
  {
    id: "census_surveys",
    label: "Census/Surveys",
    description: "Wildlife counts, camera traps, and population monitoring",
  },
];

// Team member role options
const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "co_owner", label: "Co-owner" },
  { value: "property_manager", label: "Property Manager" },
  { value: "ranch_hand", label: "Ranch Hand" },
];

// Steps vary based on whether user has a plan or not
const getSteps = (hasPlan: string) => {
  if (hasPlan === "no") {
    return ["Welcome", "Location", "Details", "Plan Status", "Quiz", "Recommendations", "Team", "Review", "Complete"];
  }
  return ["Welcome", "Location", "Details", "Plan Status", "Activities", "Team", "Review", "Complete"];
};

type TeamMember = {
  name: string;
  email: string;
  role: string;
};

type SignupFormData = {
  ownerName: string;
  ownerEmail: string;
  propertyName: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  acreage: number | "";
  exemptionType: "wildlife" | "agriculture" | "";
  // Plan status
  hasPlan: "yes" | "no" | "";
  // Quiz answers (for those without a plan)
  involvementLevel: "minimal" | "moderate" | "hands_on" | "";
  budgetLevel: "low" | "medium" | "high" | "";
  propertyFeatures: string[];
  // Activities
  activitiesInterested: string[];
  teamMembers: TeamMember[];
};

// Activity recommendations based on involvement and budget
type ActivityRecommendation = {
  id: string;
  label: string;
  description: string;
  involvement: ("minimal" | "moderate" | "hands_on")[];
  budget: ("low" | "medium" | "high")[];
  features?: string[];
  // Educational content
  whyItMatters: string;
  tips: string[];
  estimatedCost: string;
  timeCommitment: string;
  bestFor: string[];
};

const activityRecommendations: ActivityRecommendation[] = [
  {
    id: "nest_boxes",
    label: "Nest Boxes",
    description: "Install and maintain boxes for birds, bats, or other wildlife",
    involvement: ["minimal", "moderate"],
    budget: ["low", "medium"],
    whyItMatters: "Many native bird species have lost natural nesting cavities due to habitat loss. Nest boxes provide critical shelter for cavity-nesting birds like bluebirds, purple martins, and screech owls, helping maintain healthy populations on your property.",
    tips: [
      "Place boxes 5-15 feet high facing away from prevailing winds",
      "Clean boxes annually in late winter before nesting season",
      "Space boxes at least 100 feet apart to reduce competition"
    ],
    estimatedCost: "$25-75 per box, minimal ongoing costs",
    timeCommitment: "2-4 hours for installation, 1 hour/year maintenance",
    bestFor: ["Bluebirds", "Purple martins", "Screech owls", "Wood ducks", "Bats"],
  },
  {
    id: "supplemental_feeding",
    label: "Supplemental Feeding",
    description: "Feeders, food plots, and native browse management",
    involvement: ["moderate", "hands_on"],
    budget: ["medium", "high"],
    whyItMatters: "Supplemental feeding helps wildlife survive stress periods like drought, harsh winters, and fawning/nesting seasons. Strategic feeding can improve deer antler quality, increase quail populations, and support wildlife through tough times.",
    tips: [
      "Use protein feeders in spring/summer, corn in fall/winter",
      "Place feeders near cover but with clear sightlines for safety",
      "Rotate food plot locations to prevent soil depletion"
    ],
    estimatedCost: "$500-2,000/year for feed and equipment",
    timeCommitment: "2-4 hours/month to maintain feeders and plots",
    bestFor: ["White-tailed deer", "Wild turkey", "Quail", "Dove", "Songbirds"],
  },
  {
    id: "water_sources",
    label: "Water Sources",
    description: "Ponds, troughs, and drip systems for wildlife",
    involvement: ["minimal", "moderate", "hands_on"],
    budget: ["medium", "high"],
    features: ["has_water"],
    whyItMatters: "Water is often the limiting factor for wildlife in Texas. Reliable water sources attract and sustain diverse species, especially during summer droughts. Even small water features can dramatically increase wildlife activity on your property.",
    tips: [
      "Add escape ramps to troughs so small animals don't drown",
      "Place water sources near cover but visible from a distance",
      "Consider solar-powered pumps for remote locations"
    ],
    estimatedCost: "$200-500 for troughs, $2,000-10,000+ for ponds",
    timeCommitment: "1-2 hours/month to check and maintain",
    bestFor: ["All wildlife species", "Especially critical for deer", "Turkey", "Quail", "Songbirds"],
  },
  {
    id: "brush_management",
    label: "Brush Management",
    description: "Clearing, selective trimming, and prescribed burns",
    involvement: ["hands_on"],
    budget: ["medium", "high"],
    features: ["has_brush"],
    whyItMatters: "Strategic brush management creates diverse habitat structure that different species need. Brush piles provide escape cover, selective clearing improves food plant growth, and prescribed burns regenerate native grasses and forbs.",
    tips: [
      "Create brush piles from cleared material for wildlife cover",
      "Leave 20-30% brush cover for nesting and escape routes",
      "Consult with a wildlife biologist before major clearing"
    ],
    estimatedCost: "$100-300/acre for mechanical clearing",
    timeCommitment: "Significant initial effort, then seasonal maintenance",
    bestFor: ["Quail", "White-tailed deer", "Wild turkey", "Songbirds", "Small mammals"],
  },
  {
    id: "native_planting",
    label: "Native Planting",
    description: "Establishing native grasses, forbs, and trees",
    involvement: ["moderate", "hands_on"],
    budget: ["low", "medium", "high"],
    whyItMatters: "Native plants are the foundation of healthy wildlife habitat. They provide food (seeds, fruits, browse) and cover that wildlife have evolved to depend on. Native plantings also require less water and maintenance than non-native alternatives.",
    tips: [
      "Plant in fall for best establishment in Texas",
      "Use local seed sources adapted to your region",
      "Mix grasses with forbs for maximum wildlife benefit"
    ],
    estimatedCost: "$50-200/acre for seed, more for transplants",
    timeCommitment: "4-8 hours for planting, seasonal monitoring first year",
    bestFor: ["Pollinators", "Songbirds", "Quail", "Deer", "Small mammals"],
  },
  {
    id: "census_surveys",
    label: "Census/Surveys",
    description: "Wildlife counts, camera traps, and population monitoring",
    involvement: ["minimal", "moderate"],
    budget: ["low", "medium"],
    whyItMatters: "You can't manage what you don't measure. Regular wildlife surveys help you track population trends, assess the effectiveness of your management practices, and document the wildlife diversity on your property for your exemption report.",
    tips: [
      "Use trail cameras at water sources and travel corridors",
      "Conduct spotlight surveys in late summer for deer counts",
      "Keep consistent survey schedules for comparable data"
    ],
    estimatedCost: "$50-150 per trail camera, free for visual surveys",
    timeCommitment: "2-4 hours/month to check cameras and record observations",
    bestFor: ["Documenting all species", "Required for exemption reporting", "Tracking management success"],
  },
];

// Property feature options for the quiz
const propertyFeatureOptions = [
  { id: "has_water", label: "Pond, creek, or water source" },
  { id: "has_brush", label: "Brush or wooded areas" },
  { id: "has_open", label: "Open pasture or grassland" },
  { id: "has_wildlife", label: "Existing wildlife presence" },
];

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    ownerName: "",
    ownerEmail: "",
    propertyName: "",
    address1: "",
    address2: "",
    city: "",
    county: "",
    state: "",
    zip: "",
    acreage: "",
    exemptionType: "",
    hasPlan: "",
    involvementLevel: "",
    budgetLevel: "",
    propertyFeatures: [],
    activitiesInterested: [],
    teamMembers: [],
  });
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);

  const toggleExpanded = (activityId: string) => {
    setExpandedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required";
    // Check for @ followed by domain with at least one dot
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email (e.g., name@example.com)";
    return null;
  };

  const validateStep = (stepName: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepName) {
      case "Welcome":
        if (!formData.ownerName.trim()) {
          newErrors.ownerName = "Name is required";
        }
        const emailError = validateEmail(formData.ownerEmail);
        if (emailError) {
          newErrors.ownerEmail = emailError;
        }
        break;

      case "Location":
        if (!formData.address1.trim()) {
          newErrors.address1 = "Address is required";
        }
        if (!formData.zip.trim()) {
          newErrors.zip = "Zip code is required";
        } else if (!/^\d{5}$/.test(formData.zip)) {
          newErrors.zip = "Please enter a valid 5-digit zip code";
        }
        if (!formData.city.trim()) {
          newErrors.city = "City is required";
        }
        if (!formData.state.trim()) {
          newErrors.state = "State is required";
        }
        break;

      case "Details":
        if (!formData.propertyName.trim()) {
          newErrors.propertyName = "Property name is required";
        }
        if (!formData.acreage && formData.acreage !== 0) {
          newErrors.acreage = "Acreage is required";
        } else if (isNaN(Number(formData.acreage))) {
          newErrors.acreage = "Acreage must be a valid number";
        } else if (Number(formData.acreage) <= 0) {
          newErrors.acreage = "Acreage must be greater than 0";
        }
        if (!formData.exemptionType) {
          newErrors.exemptionType = "Please select an exemption type";
        }
        break;

      case "Plan Status":
        if (!formData.hasPlan) {
          newErrors.hasPlan = "Please select an option";
        }
        break;

      case "Quiz":
        if (!formData.involvementLevel) {
          newErrors.involvementLevel = "Please select your involvement level";
        }
        if (!formData.budgetLevel) {
          newErrors.budgetLevel = "Please select your budget level";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get steps based on whether user has a plan
  const steps = getSteps(formData.hasPlan);

  // Get recommended activities based on quiz answers - always returns at least 3
  const getRecommendedActivities = () => {
    if (!formData.involvementLevel || !formData.budgetLevel) return [];

    // First, get activities that match both involvement and budget
    const matchingActivities = activityRecommendations.filter((activity) => {
      const matchesInvolvement = activity.involvement.includes(formData.involvementLevel as "minimal" | "moderate" | "hands_on");
      const matchesBudget = activity.budget.includes(formData.budgetLevel as "low" | "medium" | "high");
      return matchesInvolvement && matchesBudget;
    });

    // Sort by property feature match
    const sortedMatching = matchingActivities.sort((a, b) => {
      const aHasFeature = a.features?.some((f) => formData.propertyFeatures.includes(f)) ? 1 : 0;
      const bHasFeature = b.features?.some((f) => formData.propertyFeatures.includes(f)) ? 1 : 0;
      return bHasFeature - aHasFeature;
    });

    // If we have at least 3, return them
    if (sortedMatching.length >= 3) {
      return sortedMatching;
    }

    // Otherwise, add more activities until we have at least 3
    const remaining = activityRecommendations.filter(
      (activity) => !sortedMatching.includes(activity)
    );

    // Sort remaining by property feature match
    const sortedRemaining = remaining.sort((a, b) => {
      const aHasFeature = a.features?.some((f) => formData.propertyFeatures.includes(f)) ? 1 : 0;
      const bHasFeature = b.features?.some((f) => formData.propertyFeatures.includes(f)) ? 1 : 0;
      return bHasFeature - aHasFeature;
    });

    const neededCount = 3 - sortedMatching.length;
    return [...sortedMatching, ...sortedRemaining.slice(0, neededCount)];
  };

  const togglePropertyFeature = (featureId: string) => {
    setFormData((prev) => ({
      ...prev,
      propertyFeatures: prev.propertyFeatures.includes(featureId)
        ? prev.propertyFeatures.filter((id) => id !== featureId)
        : [...prev.propertyFeatures, featureId],
    }));
  };

  // Get current step name for conditional rendering
  const currentStepName = steps[currentStep - 1];

  // Navigate to a step by name
  const goToStep = (stepName: string) => {
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  // Helper to get involvement level label
  const getInvolvementLabel = (value: string) => {
    const labels: Record<string, string> = {
      minimal: "Minimal involvement",
      moderate: "Moderate involvement",
      hands_on: "Hands-on",
    };
    return labels[value] || value;
  };

  // Helper to get budget level label
  const getBudgetLabel = (value: string) => {
    const labels: Record<string, string> = {
      low: "Budget-friendly (under $500/year)",
      medium: "Moderate ($500 - $2,000/year)",
      high: "Full investment ($2,000+/year)",
    };
    return labels[value] || value;
  };

  // Team member form state
  const [newMember, setNewMember] = useState<TeamMember>({
    name: "",
    email: "",
    role: "property_manager",
  });

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateStep(currentStepName)) {
      return; // Don't proceed if validation fails
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors when moving to next step
    } else {
      // Complete - redirect to dashboard
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Look up city, state, and county from zip code
  const handleZipChange = async (zip: string) => {
    updateFormData("zip", zip);

    // Only lookup when we have a 5-digit zip
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      setIsLoadingZip(true);
      try {
        // Use zippopotam.us for city/state lookup
        const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (response.ok) {
          const data = await response.json();
          const place = data.places?.[0];
          if (place) {
            // Look up county from our Texas mapping
            const county = texasZipToCounty[zip] || "";

            setFormData((prev) => ({
              ...prev,
              city: place["place name"] || "",
              state: place.state || "",
              county: county,
            }));

            // If no county found, set error
            if (!county) {
              setErrors((prev) => ({
                ...prev,
                county: "County not found. Please enter manually.",
              }));
            } else {
              setErrors((prev) => ({ ...prev, county: "" }));
            }
          }
        } else {
          // API failed but we might still have county data
          const county = texasZipToCounty[zip] || "";
          setFormData((prev) => ({
            ...prev,
            county: county,
          }));
          if (!county) {
            setErrors((prev) => ({
              ...prev,
              county: "County not found. Please enter manually.",
            }));
          }
        }
      } catch (error) {
        // API failed but try local county lookup
        const county = texasZipToCounty[zip] || "";
        setFormData((prev) => ({
          ...prev,
          county: county,
        }));
        if (!county) {
          setErrors((prev) => ({
            ...prev,
            county: "County not found. Please enter manually.",
          }));
        }
        console.log("Zip lookup failed:", error);
      } finally {
        setIsLoadingZip(false);
      }
    }
  };

  const toggleActivity = (activityId: string) => {
    setFormData((prev) => ({
      ...prev,
      activitiesInterested: prev.activitiesInterested.includes(activityId)
        ? prev.activitiesInterested.filter((id) => id !== activityId)
        : [...prev.activitiesInterested, activityId],
    }));
  };

  const addTeamMember = () => {
    if (newMember.name && newMember.email) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { ...newMember }],
      }));
      setNewMember({ name: "", email: "", role: "property_manager" });
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const getActivityLabel = (id: string) => {
    return activityOptions.find((a) => a.id === id)?.label || id;
  };

  const getRoleLabel = (value: string) => {
    return roleOptions.find((r) => r.value === value)?.label || value;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)]">
      {/* Step indicator */}
      <div className="mb-12">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="flex-1">
        {/* Step: Welcome */}
        {currentStepName === "Welcome" && (
          <WizardStep
            title="Let's get your property set up"
            description="We'll guide you through registering your property for wildlife tax exemption filing. First, tell us a bit about yourself."
            onNext={handleNext}
            onBack={handleBack}
            isFirst
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="ownerName"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => {
                    updateFormData("ownerName", e.target.value);
                    if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: "" }));
                  }}
                  placeholder="John Smith"
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                    errors.ownerName ? "border-red-400" : "border-field-wheat"
                  }`}
                />
                {errors.ownerName && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.ownerName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ownerEmail"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={(e) => {
                    updateFormData("ownerEmail", e.target.value);
                    if (errors.ownerEmail) setErrors((prev) => ({ ...prev, ownerEmail: "" }));
                  }}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                    errors.ownerEmail ? "border-red-400" : "border-field-wheat"
                  }`}
                />
                {errors.ownerEmail && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.ownerEmail}</p>
                )}
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step: Location */}
        {currentStepName === "Location" && (
          <WizardStep
            title="Where is your property located?"
            description="Enter your property's address and zip code."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6">
              {/* Address Line 1 */}
              <div>
                <label
                  htmlFor="address1"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address1"
                  value={formData.address1}
                  onChange={(e) => {
                    updateFormData("address1", e.target.value);
                    if (errors.address1) setErrors((prev) => ({ ...prev, address1: "" }));
                  }}
                  placeholder="1234 Ranch Road"
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                    errors.address1 ? "border-red-400" : "border-field-wheat"
                  }`}
                />
                {errors.address1 && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.address1}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label
                  htmlFor="address2"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Address Line 2 <span className="text-field-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="address2"
                  value={formData.address2}
                  onChange={(e) => updateFormData("address2", e.target.value)}
                  placeholder="Suite 100, Building A, etc."
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
                />
              </div>

              {/* Zip Code */}
              <div>
                <label
                  htmlFor="zip"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Zip Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => {
                      handleZipChange(e.target.value.replace(/\D/g, "").slice(0, 5));
                      if (errors.zip) setErrors((prev) => ({ ...prev, zip: "" }));
                    }}
                    placeholder="78701"
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                      errors.zip ? "border-red-400" : "border-field-wheat"
                    }`}
                  />
                  {isLoadingZip && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-field-forest/30 border-t-field-forest rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {errors.zip && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.zip}</p>
                )}
              </div>

              {/* City, State, County - Auto-populated */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-field-ink mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => {
                      updateFormData("city", e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    placeholder="Austin"
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                      errors.city ? "border-red-400" : "border-field-wheat"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-field-ink mb-2"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => {
                      updateFormData("state", e.target.value);
                      if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                    }}
                    placeholder="Texas"
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                      errors.state ? "border-red-400" : "border-field-wheat"
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="county"
                    className="block text-sm font-medium text-field-ink mb-2"
                  >
                    County
                  </label>
                  <input
                    type="text"
                    id="county"
                    value={formData.county}
                    onChange={(e) => {
                      updateFormData("county", e.target.value);
                      if (errors.county) setErrors((prev) => ({ ...prev, county: "" }));
                    }}
                    placeholder="Travis"
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                      errors.county ? "border-red-400" : "border-field-wheat"
                    }`}
                  />
                  {errors.county && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.county}</p>
                  )}
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step: Details */}
        {currentStepName === "Details" && (
          <WizardStep
            title="Tell us about your property"
            description="Property details help us prepare your wildlife management plan."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="propertyName"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Property Name
                </label>
                <input
                  type="text"
                  id="propertyName"
                  value={formData.propertyName}
                  onChange={(e) => {
                    updateFormData("propertyName", e.target.value);
                    if (errors.propertyName) setErrors((prev) => ({ ...prev, propertyName: "" }));
                  }}
                  placeholder="Hill Country Ranch"
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                    errors.propertyName ? "border-red-400" : "border-field-wheat"
                  }`}
                />
                {errors.propertyName && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.propertyName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="acreage"
                  className="block text-sm font-medium text-field-ink mb-2"
                >
                  Total Acreage
                </label>
                <input
                  type="number"
                  id="acreage"
                  value={formData.acreage}
                  onChange={(e) => {
                    updateFormData(
                      "acreage",
                      e.target.value ? Number(e.target.value) : ""
                    );
                    if (errors.acreage) setErrors((prev) => ({ ...prev, acreage: "" }));
                  }}
                  placeholder="150"
                  min="0.01"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors ${
                    errors.acreage ? "border-red-400" : "border-field-wheat"
                  }`}
                />
                {errors.acreage && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.acreage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-field-ink mb-3">
                  Current Exemption Type
                </label>
                {errors.exemptionType && (
                  <p className="mb-2 text-sm text-red-500">{errors.exemptionType}</p>
                )}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateFormData("exemptionType", "wildlife");
                      if (errors.exemptionType) setErrors((prev) => ({ ...prev, exemptionType: "" }));
                    }}
                    className={`
                      w-full p-5 rounded-xl border-2 text-left transition-all
                      ${
                        formData.exemptionType === "wildlife"
                          ? "border-field-forest bg-field-forest/5"
                          : "border-field-wheat hover:border-field-sage bg-white"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-field-ink">
                          Wildlife Management
                        </h3>
                        <p className="text-sm text-field-ink/60 mt-0.5">
                          Property currently has or is transitioning to wildlife exemption
                        </p>
                      </div>
                      <div
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${
                            formData.exemptionType === "wildlife"
                              ? "border-field-forest bg-field-forest"
                              : "border-field-wheat"
                          }
                        `}
                      >
                        {formData.exemptionType === "wildlife" && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateFormData("exemptionType", "agriculture");
                      if (errors.exemptionType) setErrors((prev) => ({ ...prev, exemptionType: "" }));
                    }}
                    className={`
                      w-full p-5 rounded-xl border-2 text-left transition-all
                      ${
                        formData.exemptionType === "agriculture"
                          ? "border-field-forest bg-field-forest/5"
                          : "border-field-wheat hover:border-field-sage bg-white"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-field-ink">
                          Agriculture
                        </h3>
                        <p className="text-sm text-field-ink/60 mt-0.5">
                          Property has agricultural exemption (ag, timber, etc.)
                        </p>
                      </div>
                      <div
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${
                            formData.exemptionType === "agriculture"
                              ? "border-field-forest bg-field-forest"
                              : "border-field-wheat"
                          }
                        `}
                      >
                        {formData.exemptionType === "agriculture" && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step: Plan Status - Do you have an existing wildlife plan? */}
        {currentStepName === "Plan Status" && (
          <WizardStep
            title="Do you have a wildlife management plan?"
            description="Let us know if you already have a plan or if you need help creating one."
            onNext={handleNext}
            onBack={handleBack}
          >
            {errors.hasPlan && (
              <p className="mb-4 text-sm text-red-500">{errors.hasPlan}</p>
            )}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  updateFormData("hasPlan", "yes");
                  if (errors.hasPlan) setErrors((prev) => ({ ...prev, hasPlan: "" }));
                }}
                className={`
                  w-full p-6 rounded-xl border-2 text-left transition-all
                  ${
                    formData.hasPlan === "yes"
                      ? "border-field-forest bg-field-forest/5"
                      : "border-field-wheat hover:border-field-sage bg-white"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-field-ink">
                      Yes, I have an existing plan
                    </h3>
                    <p className="text-sm text-field-ink/60 mt-1">
                      I know what activities I'm tracking and just need help organizing and filing
                    </p>
                  </div>
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${
                        formData.hasPlan === "yes"
                          ? "border-field-forest bg-field-forest"
                          : "border-field-wheat"
                      }
                    `}
                  >
                    {formData.hasPlan === "yes" && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateFormData("hasPlan", "no");
                  if (errors.hasPlan) setErrors((prev) => ({ ...prev, hasPlan: "" }));
                }}
                className={`
                  w-full p-6 rounded-xl border-2 text-left transition-all
                  ${
                    formData.hasPlan === "no"
                      ? "border-field-forest bg-field-forest/5"
                      : "border-field-wheat hover:border-field-sage bg-white"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-field-ink">
                      No, I need help creating one
                    </h3>
                    <p className="text-sm text-field-ink/60 mt-1">
                      I'm new to wildlife exemptions and need guidance on which activities to pursue
                    </p>
                  </div>
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${
                        formData.hasPlan === "no"
                          ? "border-field-forest bg-field-forest"
                          : "border-field-wheat"
                      }
                    `}
                  >
                    {formData.hasPlan === "no" && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {formData.hasPlan === "no" && (
              <div className="mt-6 p-4 bg-field-sage/10 rounded-lg border border-field-sage/30">
                <p className="text-sm text-field-ink">
                  Great! We'll ask you a few questions to recommend the best activities for your property and situation.
                </p>
              </div>
            )}
          </WizardStep>
        )}

        {/* Step: Quiz - For users without a plan */}
        {currentStepName === "Quiz" && (
          <WizardStep
            title="Let's find the right activities for you"
            description="Answer a few questions so we can recommend wildlife management activities that fit your lifestyle and budget."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-8">
              {/* Involvement Level */}
              <div>
                <h3 className="text-base font-medium text-field-ink mb-4">
                  How hands-on do you want to be?
                </h3>
                {errors.involvementLevel && (
                  <p className="mb-2 text-sm text-red-500">{errors.involvementLevel}</p>
                )}
                <div className="space-y-3">
                  {[
                    {
                      value: "minimal",
                      label: "Minimal involvement",
                      description: "Set it and forget it - occasional check-ins only",
                    },
                    {
                      value: "moderate",
                      label: "Moderate involvement",
                      description: "Regular seasonal activities, a few hours per month",
                    },
                    {
                      value: "hands_on",
                      label: "Hands-on",
                      description: "Active management - I enjoy working on the land regularly",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        updateFormData("involvementLevel", option.value as "minimal" | "moderate" | "hands_on");
                        if (errors.involvementLevel) setErrors((prev) => ({ ...prev, involvementLevel: "" }));
                      }}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all
                        ${
                          formData.involvementLevel === option.value
                            ? "border-field-forest bg-field-forest/5"
                            : "border-field-wheat hover:border-field-sage bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                            ${
                              formData.involvementLevel === option.value
                                ? "border-field-forest bg-field-forest"
                                : "border-field-wheat"
                            }
                          `}
                        >
                          {formData.involvementLevel === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-field-ink">{option.label}</p>
                          <p className="text-sm text-field-ink/60">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Level */}
              <div>
                <h3 className="text-base font-medium text-field-ink mb-4">
                  What's your annual budget for wildlife management?
                </h3>
                {errors.budgetLevel && (
                  <p className="mb-2 text-sm text-red-500">{errors.budgetLevel}</p>
                )}
                <div className="space-y-3">
                  {[
                    {
                      value: "low",
                      label: "Budget-friendly",
                      description: "Under $500/year - minimal equipment and supplies",
                    },
                    {
                      value: "medium",
                      label: "Moderate investment",
                      description: "$500 - $2,000/year - standard equipment and regular supplies",
                    },
                    {
                      value: "high",
                      label: "Full investment",
                      description: "$2,000+/year - premium equipment and professional services",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        updateFormData("budgetLevel", option.value as "low" | "medium" | "high");
                        if (errors.budgetLevel) setErrors((prev) => ({ ...prev, budgetLevel: "" }));
                      }}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all
                        ${
                          formData.budgetLevel === option.value
                            ? "border-field-forest bg-field-forest/5"
                            : "border-field-wheat hover:border-field-sage bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                            ${
                              formData.budgetLevel === option.value
                                ? "border-field-forest bg-field-forest"
                                : "border-field-wheat"
                            }
                          `}
                        >
                          {formData.budgetLevel === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-field-ink">{option.label}</p>
                          <p className="text-sm text-field-ink/60">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Features */}
              <div>
                <h3 className="text-base font-medium text-field-ink mb-4">
                  What features does your property have? <span className="font-normal text-field-ink/60">(select all that apply)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {propertyFeatureOptions.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => togglePropertyFeature(feature.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${
                          formData.propertyFeatures.includes(feature.id)
                            ? "border-field-forest bg-field-forest/5"
                            : "border-field-wheat hover:border-field-sage bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0
                            ${
                              formData.propertyFeatures.includes(feature.id)
                                ? "border-field-forest bg-field-forest"
                                : "border-field-wheat"
                            }
                          `}
                        >
                          {formData.propertyFeatures.includes(feature.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm font-medium text-field-ink">{feature.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step: Recommendations - Show recommended activities based on quiz */}
        {currentStepName === "Recommendations" && (
          <WizardStep
            title="Recommended activities for your property"
            description="Based on your answers, here are the wildlife management activities we recommend. Select the ones you'd like to track."
            onNext={handleNext}
            onBack={handleBack}
          >
            {/* Explainer box */}
            <div className="mb-6 p-4 bg-field-sage/10 rounded-lg border border-field-sage/30">
              <h4 className="text-sm font-medium text-field-ink mb-1">Why these activities?</h4>
              <p className="text-sm text-field-ink/70">
                We've filtered activities based on your {formData.involvementLevel === "minimal" ? "minimal" : formData.involvementLevel === "moderate" ? "moderate" : "hands-on"} involvement preference and {formData.budgetLevel === "low" ? "budget-friendly" : formData.budgetLevel === "medium" ? "moderate" : "full investment"} budget. Click "Learn more" on any activity to understand why it matters and get practical tips.
              </p>
            </div>

            <div className="space-y-4">
              {getRecommendedActivities().length > 0 ? (
                <>
                  {getRecommendedActivities().map((activity) => {
                    const isExpanded = expandedActivities.includes(activity.id);
                    const isSelected = formData.activitiesInterested.includes(activity.id);

                    return (
                      <div
                        key={activity.id}
                        className={`
                          rounded-xl border-2 overflow-hidden transition-all
                          ${isSelected ? "border-field-forest bg-field-forest/5" : "border-field-wheat bg-white"}
                        `}
                      >
                        {/* Main card - clickable to select */}
                        <button
                          type="button"
                          onClick={() => toggleActivity(activity.id)}
                          className="w-full p-5 text-left"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`
                                w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                                ${isSelected ? "border-field-forest bg-field-forest" : "border-field-wheat"}
                              `}
                            >
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-medium text-field-ink">{activity.label}</h3>
                                {activity.features?.some((f) => formData.propertyFeatures.includes(f)) && (
                                  <span className="text-xs bg-field-sage/20 text-field-forest px-2 py-0.5 rounded-full">Great fit</span>
                                )}
                              </div>
                              <p className="text-sm text-field-ink/60 mt-0.5">{activity.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-field-ink/50">
                                <span>{activity.estimatedCost}</span>
                                <span>{activity.timeCommitment}</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Learn more toggle */}
                        <div className="px-5 pb-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(activity.id);
                            }}
                            className="text-sm text-field-forest hover:text-field-forest/80 flex items-center gap-1"
                          >
                            {isExpanded ? "Show less" : "Learn more"}
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-field-wheat/50 bg-field-cream/50">
                            {/* Why it matters */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-field-ink mb-1">Why it matters</h4>
                              <p className="text-sm text-field-ink/70">{activity.whyItMatters}</p>
                            </div>

                            {/* Tips */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-field-ink mb-2">Tips for success</h4>
                              <ul className="space-y-1.5">
                                {activity.tips.map((tip, index) => (
                                  <li key={index} className="text-sm text-field-ink/70 flex items-start gap-2">
                                    <span className="text-field-forest mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Best for */}
                            <div>
                              <h4 className="text-sm font-medium text-field-ink mb-2">Best for</h4>
                              <div className="flex flex-wrap gap-2">
                                {activity.bestFor.map((species, index) => (
                                  <span key={index} className="text-xs bg-field-wheat/50 text-field-ink/70 px-2 py-1 rounded-full">
                                    {species}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <p className="mt-4 text-sm text-field-ink/60">
                    Selected: {formData.activitiesInterested.length} activities
                  </p>
                </>
              ) : (
                <div className="text-center py-8 text-field-ink/60">
                  <p>Please complete the quiz to see recommendations.</p>
                </div>
              )}
            </div>
          </WizardStep>
        )}

        {/* Step: Activities - For users WITH an existing plan */}
        {currentStepName === "Activities" && (
          <WizardStep
            title="What activities interest you?"
            description="Select the wildlife management activities you'd like to track on your property. You can change these later."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-3">
              {activityOptions.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => toggleActivity(activity.id)}
                  className={`
                    w-full p-5 rounded-xl border-2 text-left transition-all
                    ${
                      formData.activitiesInterested.includes(activity.id)
                        ? "border-field-forest bg-field-forest/5"
                        : "border-field-wheat hover:border-field-sage bg-white"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                        ${
                          formData.activitiesInterested.includes(activity.id)
                            ? "border-field-forest bg-field-forest"
                            : "border-field-wheat"
                        }
                      `}
                    >
                      {formData.activitiesInterested.includes(activity.id) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-field-ink">
                        {activity.label}
                      </h3>
                      <p className="text-sm text-field-ink/60 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm text-field-ink/60">
              Selected: {formData.activitiesInterested.length} of{" "}
              {activityOptions.length} activities
            </p>
          </WizardStep>
        )}

        {/* Step: Team */}
        {currentStepName === "Team" && (
          <WizardStep
            title="Add team members"
            description="Invite others to help manage your property. They'll be able to log activities and upload photos. You can skip this for now."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel={formData.teamMembers.length > 0 ? "Continue" : "Skip for now"}
          >
            <div className="space-y-6">
              {/* Add member form */}
              <div className="p-6 bg-white rounded-xl border border-field-wheat">
                <h3 className="text-sm font-medium text-field-ink mb-4">
                  Add a team member
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="memberName"
                        className="block text-sm font-medium text-field-ink/70 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="memberName"
                        value={newMember.name}
                        onChange={(e) =>
                          setNewMember((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="memberEmail"
                        className="block text-sm font-medium text-field-ink/70 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="memberEmail"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="jane@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="memberRole"
                        className="block text-sm font-medium text-field-ink/70 mb-1"
                      >
                        Role
                      </label>
                      <select
                        id="memberRole"
                        value={newMember.role}
                        onChange={(e) =>
                          setNewMember((prev) => ({ ...prev, role: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-field-wheat bg-white text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/20 focus:border-field-forest transition-colors"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      disabled={!newMember.name || !newMember.email}
                      className="px-6 py-2.5 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Team members list */}
              {formData.teamMembers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-field-ink mb-3">
                    Team members ({formData.teamMembers.length})
                  </h3>
                  <div className="space-y-2">
                    {formData.teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-field-wheat"
                      >
                        <div>
                          <p className="font-medium text-field-ink">{member.name}</p>
                          <p className="text-sm text-field-ink/60">
                            {member.email} - {getRoleLabel(member.role)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-sm text-field-earth hover:text-field-earth/80 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </WizardStep>
        )}

        {/* Step: Review */}
        {currentStepName === "Review" && (
          <WizardStep
            title="Review your information"
            description="Make sure everything looks right before we set up your property."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Create my property"
          >
            <div className="space-y-4">
              {/* Owner Info */}
              <div className="p-5 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-field-ink/60 font-medium">
                      Account Owner
                    </p>
                    <p className="text-lg text-field-ink mt-1">
                      {formData.ownerName || "Not provided"}
                    </p>
                    <p className="text-sm text-field-ink/60">
                      {formData.ownerEmail || "No email"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep("Welcome")}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="p-5 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-field-ink/60 font-medium">Location</p>
                    <p className="text-lg text-field-ink mt-1">
                      {formData.address1 || "No address provided"}
                    </p>
                    {formData.address2 && (
                      <p className="text-field-ink">{formData.address2}</p>
                    )}
                    <p className="text-sm text-field-ink/60">
                      {formData.city && `${formData.city}, `}
                      {formData.state} {formData.zip}
                    </p>
                    {formData.county && (
                      <p className="text-sm text-field-ink/60">
                        {formData.county} County
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep("Location")}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-field-ink/60 font-medium">
                      Property Details
                    </p>
                    <p className="text-lg text-field-ink mt-1">
                      {formData.propertyName || "Unnamed property"}
                    </p>
                    <p className="text-sm text-field-ink/60">
                      {formData.acreage ? `${formData.acreage} acres` : "Acreage not set"}
                      {formData.exemptionType &&
                        ` - ${formData.exemptionType === "wildlife" ? "Wildlife" : "Agriculture"} exemption`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep("Details")}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Quiz Preferences - Only shown if user took the quiz */}
              {formData.hasPlan === "no" && formData.involvementLevel && formData.budgetLevel && (
                <div className="p-5 bg-white rounded-xl border border-field-wheat">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-field-ink/60 font-medium">
                        Your Preferences
                      </p>
                      <p className="text-field-ink mt-1">
                        {getInvolvementLabel(formData.involvementLevel)}
                      </p>
                      <p className="text-sm text-field-ink/60">
                        {getBudgetLabel(formData.budgetLevel)}
                      </p>
                      {formData.propertyFeatures.length > 0 && (
                        <p className="text-sm text-field-ink/60 mt-1">
                          Property features: {formData.propertyFeatures.map(f =>
                            propertyFeatureOptions.find(opt => opt.id === f)?.label
                          ).filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep("Quiz")}
                      className="text-sm text-field-forest hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Activities */}
              <div className="p-5 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-field-ink/60 font-medium">
                      Activities of Interest ({formData.activitiesInterested.length})
                    </p>
                    {formData.activitiesInterested.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {formData.activitiesInterested.map((id) => (
                          <li key={id} className="text-field-ink">
                            {getActivityLabel(id)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-field-ink/60 mt-1">No activities selected</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(formData.hasPlan === "no" ? "Recommendations" : "Activities")}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Team */}
              <div className="p-5 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-field-ink/60 font-medium">
                      Team Members ({formData.teamMembers.length})
                    </p>
                    {formData.teamMembers.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {formData.teamMembers.map((member, index) => (
                          <li key={index} className="text-field-ink">
                            {member.name}{" "}
                            <span className="text-field-ink/60">
                              ({getRoleLabel(member.role)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-field-ink/60 mt-1">
                        No team members added yet
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep("Team")}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step: Complete */}
        {currentStepName === "Complete" && (
          <WizardStep
            title="Welcome to FieldFile!"
            description="Your property has been set up and is ready to go."
            onNext={handleNext}
            onBack={handleBack}
            isLast
            nextLabel="Go to Dashboard"
          >
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-field-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-field-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-field-ink mb-2">
                {formData.propertyName || "Your property"} is ready
              </h2>
              <p className="text-field-ink/60 max-w-md mx-auto">
                Start tracking your wildlife management activities and building your
                annual report.
              </p>

              <div className="mt-8 p-6 bg-field-wheat/30 rounded-xl max-w-md mx-auto">
                <h3 className="text-sm font-medium text-field-ink mb-3">
                  What happens next?
                </h3>
                <ul className="text-sm text-field-ink/70 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">1.</span>
                    <span>Explore your dashboard and property overview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">2.</span>
                    <span>Log your first wildlife activity with photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">3.</span>
                    <span>
                      We'll help you compile your annual report when it's time
                    </span>
                  </li>
                </ul>
              </div>

              {formData.teamMembers.length > 0 && (
                <p className="mt-6 text-sm text-field-ink/60">
                  We'll send invitations to your {formData.teamMembers.length} team
                  member{formData.teamMembers.length > 1 ? "s" : ""} shortly.
                </p>
              )}
            </div>
          </WizardStep>
        )}
      </div>
    </div>
  );
}
