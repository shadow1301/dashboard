import type { Alert } from "@/types";
import { calculateHealthScore, getAlertSeverity } from "@/lib/predictions";
import { vehicles } from "./vehicles";

const alertTypes = [
  "High degradation rate detected",
  "Temperature excursion above threshold",
  "Fast-charge ratio exceeds recommended limit",
  "Discharge rate consistently high",
  "Cycle count nearing end-of-life estimate",
  "Capacity fade accelerating",
  "Internal resistance increasing",
  "Charging efficiency declining",
];

function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  for (const vehicle of vehicles) {
    const score = calculateHealthScore(vehicle);
    const severity = getAlertSeverity(score);

    if (severity === "info") continue;

    const daysAgo = severity === "critical"
      ? Math.floor(Math.random() * 3)
      : Math.floor(Math.random() * 10) + 2;

    const alertDate = new Date(now);
    alertDate.setDate(alertDate.getDate() - daysAgo);

    const typeIndex = Math.floor(Math.random() * alertTypes.length);

    alerts.push({
      id: `alert-${vehicle.vehicle_id}`,
      vehicle_id: vehicle.vehicle_id,
      vehicle_model: vehicle.vehicle_model,
      severity,
      type: alertTypes[typeIndex],
      description: `Health score for ${vehicle.vehicle_id} (${vehicle.vehicle_model}) dropped to ${score}%. ${severity === "critical" ? "Immediate attention required." : "Schedule inspection soon."}`,
      timestamp: alertDate.toISOString(),
      status: severity === "critical" ? "unread" : "read",
    });
  }

  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return alerts.slice(0, 50);
}

export const alerts: Alert[] = generateAlerts();
