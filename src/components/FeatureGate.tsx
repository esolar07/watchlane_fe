"use client";

import type { ReactNode } from "react";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { BooleanFeatureKey } from "@/types/entitlements";

interface FeatureGateProps {
  feature: BooleanFeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { hasFeature } = useEntitlements();
  return hasFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
