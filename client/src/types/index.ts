// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Role and Permission Types
export const UserRole = {
  LANDOWNER: 'landowner',
  CO_OWNER: 'co_owner',
  PROPERTY_MANAGER: 'property_manager',
  RANCH_HAND: 'ranch_hand',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const Permission = {
  VIEW: 'view',
  UPLOAD: 'upload',
  EDIT: 'edit',
  SUBMIT: 'submit',
  ADMIN: 'admin',
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

export interface PropertyUserRole {
  id: string;
  userId: string;
  propertyId: string;
  role: UserRole;
  permissions: Permission[];
}

// Property Types
export interface Property {
  id: string;
  name: string;
  address: string;
  state: string;
  acreage: number;
  county: string;
  ownerId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Wildlife Activity Types
export const WildlifeActivityType = {
  BIRDHOUSE: 'birdhouse',
  HABITAT_MANAGEMENT: 'habitat_management',
  FOOD_PLOT: 'food_plot',
  PREDATOR_CONTROL: 'predator_control',
  WILDLIFE_SURVEY: 'wildlife_survey',
  EROSION_CONTROL: 'erosion_control',
  FENCING: 'fencing',
} as const;

export type WildlifeActivityType = typeof WildlifeActivityType[keyof typeof WildlifeActivityType];

export const ActivityStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;

export type ActivityStatus = typeof ActivityStatus[keyof typeof ActivityStatus];

export interface Activity {
  id: string;
  propertyId: string;
  type: WildlifeActivityType;
  name: string;
  description: string;
  status: ActivityStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityRecord {
  id: string;
  activityId: string;
  completedDate: Date;
  notes?: string;
  weather?: string;
  hoursSpent?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document and Photo Types
export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  activityRecordId?: string;
  filingId?: string;
}

export interface Photo extends Document {
  thumbnailUrl?: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}

// Filing Types
export const FilingStatus = {
  DRAFT: 'draft',
  READY_TO_FILE: 'ready_to_file',
  FILED: 'filed',
  ACCEPTED: 'accepted',
  NEEDS_FOLLOW_UP: 'needs_follow_up',
} as const;

export type FilingStatus = typeof FilingStatus[keyof typeof FilingStatus];

export const FilingMethod = {
  ONLINE: 'online',
  MAIL: 'mail',
  COUNTY_PORTAL: 'county_portal',
} as const;

export type FilingMethod = typeof FilingMethod[keyof typeof FilingMethod];

export interface Filing {
  id: string;
  propertyId: string;
  year: number;
  status: FilingStatus;
  method?: FilingMethod;
  filedDate?: Date;
  acceptedDate?: Date;
  confirmationNumber?: string;
  filedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Field Notes Types
export interface FieldNote {
  id: string;
  activityId: string;
  content: string;
  weather?: string;
  delays?: string;
  actionItems?: ActionItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionItem {
  description: string;
  dueDate?: Date;
  completed: boolean;
}

// Map Pin Types
export interface MapPin {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  type: string; // e.g., 'birdhouse', 'water_source', 'fence'
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Types
export const SubscriptionTier = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
} as const;

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
}

export interface PropertyFormData {
  name: string;
  address: string;
  state: string;
  county: string;
  acreage: number;
}

// Dashboard Types
export interface DashboardStats {
  totalProperties: number;
  activeActivities: number;
  completedThisYear: number;
  upcomingDeadlines: number;
}

export interface PropertyProgress {
  propertyId: string;
  propertyName: string;
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
  nextDeadline?: Date;
}
