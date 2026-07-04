export type BatteryType = "LFP" | "NMC" | "NCA";

export type DrivingStyle = "conservative" | "moderate" | "aggressive";

export type Vehicle = {
  vehicle_id: string;
  vehicle_model: string;
  battery_type: BatteryType;
  battery_capacity: number;
  vehicle_age: number;
  vehicle_age_months: number;
  total_charging_cycle: number;
  avg_temp_c: number;
  fast_charge_ratio: number;
  avg_discharge_rate: number;
  driving_style: DrivingStyle;
  soh_percent: number;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertStatus = "unread" | "read" | "dismissed";

export type Alert = {
  id: string;
  vehicle_id: string;
  vehicle_model: string;
  severity: AlertSeverity;
  type: string;
  description: string;
  timestamp: string;
  status: AlertStatus;
};

export type HealthBucket = "0-20" | "21-40" | "41-60" | "61-80" | "81-100";

export type SortDirection = "asc" | "desc" | null;

export type FleetFilters = {
  search: string;
  batteryType: BatteryType | "all";
  drivingStyle: DrivingStyle | "all";
  healthMin: number;
  healthMax: number;
};
