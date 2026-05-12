"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  decodeFeatureValue,
  humanizeFeatureKey,
  type Plan,
  type PlanPrice,
  type PriceInterval,
} from "@/types/plan";

interface PricingClientProps {
  plans: Plan[];
}

function findPrice(prices: PlanPrice[], interval: PriceInterval): PlanPrice | null {
  return prices.find((price) => price.interval === interval) ?? null;
}

function formatPrice(price: PlanPrice): string {
  const amount = price.unitAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function formatFeatureLine(key: string, raw: string): string {
  const decoded = decodeFeatureValue(key, raw);
  const label = humanizeFeatureKey(key);
  if (typeof decoded === "boolean") return label;
  if (decoded === null) return `Unlimited ${label.toLowerCase()}`;
  return `${decoded} ${label.toLowerCase()}`;
}

export function PricingClient({ plans }: PricingClientProps) {
  const [interval, setInterval] = useState<PriceInterval>("MONTH");
  const { entitlements } = useEntitlements();
  const currentSlug = entitlements?.plan.slug ?? null;

  return (
    <div className="mt-10 space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="interval-toggle" className="text-sm">Monthly</Label>
        <Switch
          id="interval-toggle"
          checked={interval === "YEAR"}
          onCheckedChange={(checked) => setInterval(checked ? "YEAR" : "MONTH")}
        />
        <Label htmlFor="interval-toggle" className="text-sm">Yearly</Label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = findPrice(plan.prices, interval);
          const isCurrent = plan.slug === currentSlug;
          const renderableFeatures = plan.features.filter((feature) => {
            const decoded = decodeFeatureValue(feature.key, feature.value);
            if (typeof decoded === "boolean") return decoded;
            return true;
          });
          return (
            <Card key={plan.id} className={isCurrent ? "border-primary ring-2 ring-primary/30" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current plan</Badge>}
                </div>
                <CardDescription>{plan.description ?? ""}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {price ? (
                    <p className="text-3xl font-bold">
                      {formatPrice(price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}/ {interval === "MONTH" ? "month" : "year"}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Contact sales</p>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {renderableFeatures.map((feature) => (
                    <li key={feature.key} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{formatFeatureLine(feature.key, feature.value)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={isCurrent} variant={isCurrent ? "outline" : "default"}>
                  {isCurrent ? "Current plan" : "Choose plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
