export type DatePreset = "today" | "7d" | "30d" | "90d";

export interface DatePresetOption {
  value: DatePreset;
  label: string;
}

export const datePresetOptions: DatePresetOption[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function getDateRange(preset: DatePreset): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (preset === "7d") start.setDate(start.getDate() - 6);
  if (preset === "30d") start.setDate(start.getDate() - 29);
  if (preset === "90d") start.setDate(start.getDate() - 89);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
