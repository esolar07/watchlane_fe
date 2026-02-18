"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, ShieldAlert, Clock, Timer, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { getDashboardSummary, type DashboardSummary } from "@/services/api";

export default function DashboardPage() {
  const { organizations } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setIsLoading(false));
  }, []);

  const hasOrgs = organizations.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasOrgs) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No organization yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create or join an organization to start using WatchLane.
              </p>
            </div>
            <Button asChild>
              <Link href="/organizations">Go to Organizations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { title: "Covered", value: summary?.coveredCount ?? 0, icon: ShieldCheck },
    { title: "Uncovered", value: summary?.uncoveredCount ?? 0, icon: ShieldAlert },
    { title: "Avg Response Time", value: `${summary?.avgResponseTimeMinutes ?? 0}m`, icon: Clock },
    { title: "Oldest Uncovered", value: `${summary?.oldestUncoveredMinutes ?? 0}m`, icon: Timer },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Key metrics">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No activity yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Events will appear here as you use WatchLane.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
