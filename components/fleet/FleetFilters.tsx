"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FleetFilters as FleetFiltersType, BatteryType, DrivingStyle } from "@/types";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  filters: FleetFiltersType;
  onChange: (filters: FleetFiltersType) => void;
};

export function FleetFilters({ filters, onChange }: Props) {
  const update = (partial: Partial<FleetFiltersType>) => {
    onChange({ ...filters, ...partial });
  };

  const hasFilters = filters.search || filters.batteryType !== "all" || filters.drivingStyle !== "all" || filters.healthMin > 0 || filters.healthMax < 100;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
        <Input
          placeholder="Search vehicle ID or model..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-8 h-9 text-sm"
        />
      </div>
      <Select
        value={filters.batteryType}
        onValueChange={(v) => update({ batteryType: v as BatteryType | "all" })}
      >
        <SelectTrigger className="h-9 w-[130px] text-sm">
          <SelectValue placeholder="Battery type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="LFP">LFP</SelectItem>
          <SelectItem value="NMC">NMC</SelectItem>
          <SelectItem value="NCA">NCA</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.drivingStyle}
        onValueChange={(v) => update({ drivingStyle: v as DrivingStyle | "all" })}
      >
        <SelectTrigger className="h-9 w-[140px] text-sm">
          <SelectValue placeholder="Driving style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All styles</SelectItem>
          <SelectItem value="gentle">Gentle</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
          <SelectItem value="aggressive">Aggressive</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: "", batteryType: "all", drivingStyle: "all", healthMin: 0, healthMax: 100 })}
          className="h-9 text-xs"
        >
          <X size={14} className="mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
