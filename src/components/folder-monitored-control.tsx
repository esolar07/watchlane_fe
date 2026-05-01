"use client";

import { Check, Minus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MonitoredState = boolean | null;

interface MonitoredControlProps {
  value: MonitoredState;
  effective: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange: (next: MonitoredState) => void;
}

function nextState(current: MonitoredState): MonitoredState {
  if (current === null) return true;
  if (current === true) return false;
  return null;
}

function stateLabel(value: MonitoredState, effective: boolean): string {
  if (value === true) return "Monitored";
  if (value === false) return "Not monitored";
  return effective
    ? "Inheriting: monitored"
    : "Inheriting: not monitored";
}

export function FolderMonitoredControl({
  value,
  effective,
  disabled,
  loading,
  onChange,
}: MonitoredControlProps) {
  const label = stateLabel(value, effective);

  const styles =
    value === true
      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50"
      : value === false
      ? "bg-muted text-muted-foreground border-border"
      : effective
      ? "bg-green-50 text-green-700/80 italic border-green-200/60 dark:bg-green-900/15 dark:text-green-400/80"
      : "bg-muted/60 text-muted-foreground italic border-dashed";

  const Icon =
    loading ? Loader2 : value === true ? Check : value === false ? X : Minus;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value === true ? "true" : value === false ? "false" : "mixed"}
      aria-label={`Monitoring: ${label}. Click to change.`}
      onClick={() => !disabled && !loading && onChange(nextState(value))}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        styles,
      )}
      title={
        disabled
          ? "This folder cannot be edited"
          : "Click to cycle: inherit → monitored → not monitored"
      }
    >
      <Icon
        className={cn("h-3 w-3 shrink-0", loading && "animate-spin")}
      />
      <span>{label}</span>
    </button>
  );
}
