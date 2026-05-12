"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { humanizeFeatureKey } from "@/types/plan";
import {
  subscribeToUpgradePrompts,
  type UpgradePromptDetail,
} from "@/lib/upgradeBus";

export function UpgradeModal() {
  const router = useRouter();
  const [detail, setDetail] = useState<UpgradePromptDetail | null>(null);

  useEffect(() => {
    return subscribeToUpgradePrompts((next) => setDetail(next));
  }, []);

  function handleClose(open: boolean) {
    if (!open) setDetail(null);
  }

  function handleViewPlans() {
    setDetail(null);
    router.push("/pricing");
  }

  if (!detail) return null;
  const featureLabel = detail.feature ? humanizeFeatureKey(detail.feature) : null;

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade required</DialogTitle>
          <DialogDescription>
            {featureLabel
              ? `Your current plan doesn't include enough ${featureLabel}.`
              : "Your current plan doesn't support this action."}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{detail.message}</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            Close
          </Button>
          <Button onClick={handleViewPlans}>View plans</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
