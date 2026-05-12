import Link from "next/link";
import { listPlans } from "@/services/api";
import { PricingClient } from "./pricing-client";

export default async function PricingPage() {
  const { plans } = await listPlans();
  const sortedPlans = [...plans].sort((leftPlan, rightPlan) => leftPlan.sortOrder - rightPlan.sortOrder);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to dashboard
        </Link>
      </div>
      <header className="mt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Plans &amp; pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Pick the plan that fits your team. Switch or cancel anytime.
        </p>
      </header>
      <PricingClient plans={sortedPlans} />
    </div>
  );
}
