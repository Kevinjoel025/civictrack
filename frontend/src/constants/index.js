export const APP_NAME = "LetsFix";
export const APP_TAGLINE = "Report. Track. Resolve.";

export const MAP_CENTER = [17.5449, 78.3995]; // Bachupally, Hyderabad
export const MAP_DEFAULT_ZOOM = 14;

export const ISSUE_TYPES = [
  { value: "pothole",     label: "Pothole",     color: "#EF4444", icon: "🕳️", bg: "#FEE2E2" },
  { value: "garbage",     label: "Garbage",     color: "#F59E0B", icon: "🗑️", bg: "#FFFBEB" },
  { value: "streetlight", label: "Streetlight", color: "#8B5CF6", icon: "💡", bg: "#F5F3FF" },
  { value: "drainage",    label: "Drainage",    color: "#3B82F6", icon: "🌊", bg: "#EFF6FF" },
  { value: "other",       label: "Other",       color: "#6B7280", icon: "📋", bg: "#F3F4F6" },
];

export const STATUS_COLORS = {
  submitted:    "#6B7280",
  assigned:     "#2563EB",
  acknowledged: "#7C3AED",
  in_progress:  "#D97706",
  resolved:     "#16A34A",
  rejected:     "#DC2626",
  delayed:      "#EA580C",
};

export const STATUS_LABELS = {
  submitted:    "Submitted",
  assigned:     "Assigned",
  acknowledged: "Acknowledged",
  in_progress:  "In Progress",
  resolved:     "Resolved",
  rejected:     "Rejected",
  delayed:      "Delayed",
};

export const SLA_HOURS = {
  pothole:     72,
  garbage:     24,
  streetlight: 48,
  drainage:    48,
  other:       96,
};

// Order used in the status timeline
export const STATUS_ORDER = [
  'submitted',
  'assigned',
  'acknowledged',
  'in_progress',
  'resolved'
];

// Radius options for the map filter (values in meters)
export const RADIUS_OPTIONS = [
  { value: 2000, label: '2 km' },
  { value: 1000, label: '1 km' },
  { value: 500,  label: '500 m' },
  { value: 200,  label: '200 m' }
];

// Duplicate detection radius (meters)
export const DUPLICATE_RADIUS_METERS = 50;