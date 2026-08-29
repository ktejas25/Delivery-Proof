export interface DashboardSummary {
  totalDeliveries: number;
  totalDeliveriesChange: number;
  todayDeliveries: number;
  todayCompleted: number;
  todayRemaining: number;
  todayFailed: number;
  todayDisputed: number;
  completedDeliveries: number;
  completionRate: number;
  completedChange: number;
  failedDeliveries: number;
  failureRate: number;
  failedChange: number;
  disputedDeliveries: number;
  disputeSeverity: 'high' | 'normal';
  disputedChange: number;
  revenue: number;
  revenueChange: number;
  currency: string;
  currencySymbol: string;
  customers: number;
  customerChange: number;
  activeUsers?: number;
  totalUsers?: number;
  driversOnline: number;
  totalDrivers: number;
  driversOnDelivery: number;
  driversOffline: number;
}

export interface PerformanceMetrics {
  completionRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  onTimeRate: number;
  proofVerificationRate: number;
  avgVerificationScore: number;
}

export interface ProofsSummary {
  total: number;
  verified: number;
  pendingAI: number;
  failed: number;
  disputed: number;
  verificationRate: number;
}

export interface DisputesSummary {
  total: number;
  new: number;
  underReview: number;
  resolved: number;
  highPriority: number;
}

export interface SystemHealthItem {
  name: string;
  status: 'Operational' | 'Degraded' | 'Warning' | 'Offline';
  latency: string;
  uptime: string;
}

export interface AttentionRequiredSummary {
  activeDisputes: number;
  highPriorityDisputes: number;
  failedProofs: number;
  failedDeliveries: number;
  systemWarnings: number;
}

export interface FleetSnapshot {
  totalDrivers: number;
  driversOnline: number;
  totalVehicles: number;
  activeTrackers: number;
  avgSpeed: number;
  speedUnit: string;
}

export interface FleetVehicle {
  driverId: number;
  driverName: string;
  driverPhone?: string;
  vehicleType: string;
  licensePlate: string;
  status: 'available' | 'on_delivery' | 'offline' | 'break';
  speed: number;
  location: {
    lat: number;
    lng: number;
  };
  lastUpdated?: string;
}

export interface FleetOverview {
  activeVehicles: number;
  liveTrackers: number;
  averageVelocity: number;
  velocityUnit: string;
  congestion: {
    level: string;
    location: string;
    delayRiskPercent: number;
  };
  totalDrivers: number;
  onlineDriversCount: number;
  onDeliveryCount: number;
  vehicles: FleetVehicle[];
}

export interface DashboardOverview {
  summary: DashboardSummary;
  performance: PerformanceMetrics;
  proofs: ProofsSummary;
  disputes: DisputesSummary;
  systemHealth?: SystemHealthItem[];
  attentionRequired?: AttentionRequiredSummary;
  fleetSnapshot?: FleetSnapshot;
  fleet: FleetOverview | FleetSnapshot;
}

export interface DeliveryTrendPoint {
  date: string;
  label: string;
  total: number;
  completed: number;
  failed: number;
  disputed: number;
}

export interface DriverLeaderboardItem {
  driverId: number;
  uuid: string;
  name: string;
  vehicleType: string;
  deliveries: number;
  completionRate: number;
  proofScore: number;
  rating: number;
  status: 'available' | 'on_delivery' | 'offline';
  rank: number;
}

export interface AIInsightItem {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
  status: string;
  timestamp: string;
  category: 'security' | 'traffic' | 'weather' | 'forecast' | 'quality';
}

export interface RecentActivityItem {
  id: string | number;
  type: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  action: string;
  orderNumber?: string;
  deliveryUuid?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface SearchResults {
  deliveries: Array<{
    id: number;
    uuid: string;
    orderNumber: string;
    status: string;
    customerName: string;
    customerAddress: string;
    scheduledTime: string;
  }>;
  drivers: Array<{
    id: number;
    uuid: string;
    name: string;
    vehicleType: string;
    licenseNumber: string;
    rating: number;
  }>;
  customers: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    totalOrders: number;
  }>;
  disputes: Array<{
    id: number;
    uuid: string;
    reason: string;
    status: string;
    fraudScore: number;
    orderNumber: string;
  }>;
}
