"use client";

import { Badge } from "@/components/ui/badge";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { LimitFeatureKey } from "@/types/entitlements";
import type { Entitlements } from "@/types/entitlements";

interface LimitBadgeProps {
  feature: LimitFeatureKey;
  current?: number;
  label?: string;
}

function readUsageFor(entitlements: Entitlements, feature: LimitFeatureKey): number {
  if (feature === "mailbox_limit") return entitlements.usage.mailboxes_used;
  if (feature === "org_limit") return entitlements.usage.orgs_used;
  return 0;
}

export function LimitBadge({ feature, current, label }: LimitBadgeProps) {
  const { entitlements } = useEntitlements();
  if (!entitlements) return null;
  const limit = entitlements.features[feature];
  const usedCount = current ?? readUsageFor(entitlements, feature);
  const valueLabel = limit === null ? `${usedCount} / Unlimited` : `${usedCount} / ${limit}`;
  return (
    <Badge variant="outline" className="text-xs font-medium">
      {label ? `${label}: ${valueLabel}` : valueLabel}
    </Badge>
  );
}
