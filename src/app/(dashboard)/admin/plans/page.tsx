"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import {
  adminListPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminPutPlanFeatures,
  adminCreatePrice,
  adminUpdatePrice,
  adminDeletePrice,
} from "@/services/api";
import {
  decodeFeatureValue,
  humanizeFeatureKey,
  type Plan,
  type PlanPrice,
  type PriceInterval,
} from "@/types/plan";
import type {
  LimitFeatureKey,
  BooleanFeatureKey,
} from "@/types/entitlements";

const LIMIT_FEATURE_KEYS: LimitFeatureKey[] = ["mailbox_limit", "org_limit", "history_days"];
const BOOLEAN_FEATURE_KEYS: BooleanFeatureKey[] = ["weekly_reports", "folder_monitoring", "priority_support"];

export default function AdminPlansPage() {
  const { isSuperAdmin, isLoading: isAuthLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminListPlans();
      setPlans(response.plans);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadPlans();
  }, [isSuperAdmin, loadPlans]);

  if (isAuthLoading) return <LoadingState />;
  if (!isSuperAdmin) return <NotFoundState />;
  if (isLoading && plans.length === 0) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans (admin)</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and price plans.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New plan
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3">
        {plans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            isExpanded={expandedId === plan.id}
            onToggle={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
            onChanged={loadPlans}
          />
        ))}
      </div>

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={loadPlans} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function NotFoundState() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <h2 className="text-lg font-semibold">Not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This page does not exist.</p>
      </CardContent>
    </Card>
  );
}

interface PlanRowProps {
  plan: Plan;
  isExpanded: boolean;
  onToggle: () => void;
  onChanged: () => Promise<void>;
}

function PlanRow({ plan, isExpanded, onToggle, onChanged }: PlanRowProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await adminDeletePlan(plan.id);
      await onChanged();
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : "Cannot delete: plan may be in use");
    }
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <div>
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <CardDescription className="text-xs">
                {plan.slug} · sort {plan.sortOrder} · {plan.isActive ? "active" : "inactive"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <PlanMetaEditor plan={plan} onChanged={onChanged} />
          <FeaturesEditor plan={plan} onChanged={onChanged} />
          <PricesEditor plan={plan} onChanged={onChanged} />
        </CardContent>
      )}
    </Card>
  );
}

interface PlanMetaEditorProps {
  plan: Plan;
  onChanged: () => Promise<void>;
}

function PlanMetaEditor({ plan, onChanged }: PlanMetaEditorProps) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description ?? "");
  const [sortOrder, setSortOrder] = useState(plan.sortOrder);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await adminUpdatePlan(plan.id, { name, description, sortOrder, isActive });
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label className="text-xs">Name</Label>
        <Input value={name} onChange={(changeEvent) => setName(changeEvent.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Sort order</Label>
        <Input
          type="number"
          value={sortOrder}
          onChange={(changeEvent) => setSortOrder(Number(changeEvent.target.value))}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label className="text-xs">Description</Label>
        <Input value={description} onChange={(changeEvent) => setDescription(changeEvent.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={setIsActive} id={`active-${plan.id}`} />
        <Label htmlFor={`active-${plan.id}`} className="text-xs">Active</Label>
      </div>
      <div className="flex items-end justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save plan"}
        </Button>
      </div>
    </div>
  );
}

interface FeaturesEditorProps {
  plan: Plan;
  onChanged: () => Promise<void>;
}

function FeaturesEditor({ plan, onChanged }: FeaturesEditorProps) {
  const initial = buildFeatureState(plan);
  const [limits, setLimits] = useState(initial.limits);
  const [unlimited, setUnlimited] = useState(initial.unlimited);
  const [booleans, setBooleans] = useState(initial.booleans);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, number | boolean | null> = {};
      for (const key of LIMIT_FEATURE_KEYS) {
        payload[key] = unlimited[key] ? null : limits[key];
      }
      for (const key of BOOLEAN_FEATURE_KEYS) {
        payload[key] = booleans[key];
      }
      await adminPutPlanFeatures(plan.id, payload);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">Features</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {LIMIT_FEATURE_KEYS.map((key) => (
          <div key={key} className="rounded-md border bg-muted/20 p-3">
            <Label className="text-xs">{humanizeFeatureKey(key)}</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={limits[key]}
                disabled={unlimited[key]}
                onChange={(changeEvent) => setLimits({ ...limits, [key]: Number(changeEvent.target.value) })}
                className="w-28"
              />
              <Checkbox
                id={`unlimited-${plan.id}-${key}`}
                checked={unlimited[key]}
                onCheckedChange={(checked) => setUnlimited({ ...unlimited, [key]: Boolean(checked) })}
              />
              <Label htmlFor={`unlimited-${plan.id}-${key}`} className="text-xs">Unlimited</Label>
            </div>
          </div>
        ))}
        {BOOLEAN_FEATURE_KEYS.map((key) => (
          <div key={key} className="flex items-center justify-between rounded-md border bg-muted/20 p-3">
            <Label htmlFor={`bool-${plan.id}-${key}`} className="text-xs">{humanizeFeatureKey(key)}</Label>
            <Switch
              id={`bool-${plan.id}-${key}`}
              checked={booleans[key]}
              onCheckedChange={(checked) => setBooleans({ ...booleans, [key]: Boolean(checked) })}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save features"}
        </Button>
      </div>
    </section>
  );
}

function buildFeatureState(plan: Plan) {
  const limits = { mailbox_limit: 0, org_limit: 0, history_days: 0 };
  const unlimited = { mailbox_limit: false, org_limit: false, history_days: false };
  const booleans = { weekly_reports: false, folder_monitoring: false, priority_support: false };
  for (const feature of plan.features) {
    const decoded = decodeFeatureValue(feature.key, feature.value);
    if (isLimitKey(feature.key)) {
      if (decoded === null) unlimited[feature.key] = true;
      else if (typeof decoded === "number") limits[feature.key] = decoded;
    } else if (isBooleanKey(feature.key) && typeof decoded === "boolean") {
      booleans[feature.key] = decoded;
    }
  }
  return { limits, unlimited, booleans };
}

function isLimitKey(key: string): key is LimitFeatureKey {
  return (LIMIT_FEATURE_KEYS as readonly string[]).includes(key);
}

function isBooleanKey(key: string): key is BooleanFeatureKey {
  return (BOOLEAN_FEATURE_KEYS as readonly string[]).includes(key);
}

interface PricesEditorProps {
  plan: Plan;
  onChanged: () => Promise<void>;
}

function PricesEditor({ plan, onChanged }: PricesEditorProps) {
  const [addOpen, setAddOpen] = useState(false);

  async function handleDelete(priceId: string) {
    if (!window.confirm("Delete this price?")) return;
    await adminDeletePrice(plan.id, priceId);
    await onChanged();
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Prices</h3>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add price
        </Button>
      </div>
      {plan.prices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prices yet.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {plan.prices.map((price) => (
            <PriceRow
              key={price.id}
              planId={plan.id}
              price={price}
              onChanged={onChanged}
              onDelete={() => handleDelete(price.id)}
            />
          ))}
        </ul>
      )}
      <AddPriceDialog
        planId={plan.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={onChanged}
      />
    </section>
  );
}

interface PriceRowProps {
  planId: string;
  price: PlanPrice;
  onChanged: () => Promise<void>;
  onDelete: () => Promise<void>;
}

function PriceRow({ planId, price, onChanged, onDelete }: PriceRowProps) {
  const [unitAmount, setUnitAmount] = useState(price.unitAmount);
  const [stripePriceId, setStripePriceId] = useState(price.stripePriceId);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await adminUpdatePrice(planId, price.id, { unitAmount, stripePriceId });
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center">
      <Badge variant="outline" className="text-xs">{price.interval}</Badge>
      <Input
        type="number"
        value={unitAmount}
        onChange={(changeEvent) => setUnitAmount(Number(changeEvent.target.value))}
        className="sm:w-32"
      />
      <span className="text-xs text-muted-foreground">
        {(unitAmount / 100).toLocaleString("en-US", { style: "currency", currency: price.currency.toUpperCase() })}
      </span>
      <Input
        value={stripePriceId}
        onChange={(changeEvent) => setStripePriceId(changeEvent.target.value)}
        placeholder="price_…"
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete price">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </li>
  );
}

interface AddPriceDialogProps {
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => Promise<void>;
}

function AddPriceDialog({ planId, open, onOpenChange, onAdded }: AddPriceDialogProps) {
  const [interval, setInterval] = useState<PriceInterval>("MONTH");
  const [unitAmount, setUnitAmount] = useState(0);
  const [currency, setCurrency] = useState("usd");
  const [stripePriceId, setStripePriceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setInterval("MONTH");
    setUnitAmount(0);
    setCurrency("usd");
    setStripePriceId("");
    setErrorMessage(null);
  }

  async function handleSubmit() {
    setSaving(true);
    setErrorMessage(null);
    try {
      await adminCreatePrice(planId, { interval, unitAmount, currency, stripePriceId });
      await onAdded();
      reset();
      onOpenChange(false);
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Failed to create price");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (!nextOpen) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add price</DialogTitle>
          <DialogDescription>Stripe price configuration for this plan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Interval</Label>
            <Select value={interval} onValueChange={(nextValue) => setInterval(nextValue as PriceInterval)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTH">Monthly</SelectItem>
                <SelectItem value="YEAR">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Unit amount (cents)</Label>
            <Input
              type="number"
              value={unitAmount}
              onChange={(changeEvent) => setUnitAmount(Number(changeEvent.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {(unitAmount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() || "USD" })}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Currency</Label>
            <Input value={currency} onChange={(changeEvent) => setCurrency(changeEvent.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Stripe price ID</Label>
            <Input
              placeholder="price_…"
              value={stripePriceId}
              onChange={(changeEvent) => setStripePriceId(changeEvent.target.value)}
            />
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !stripePriceId.trim()}>
            {saving ? "Saving…" : "Add price"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}

function CreatePlanDialog({ open, onOpenChange, onCreated }: CreatePlanDialogProps) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setSlug("");
    setName("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
    setErrorMessage(null);
  }

  async function handleSubmit() {
    setSaving(true);
    setErrorMessage(null);
    try {
      await adminCreatePlan({ slug, name, description, sortOrder, isActive });
      await onCreated();
      reset();
      onOpenChange(false);
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (!nextOpen) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create plan</DialogTitle>
          <DialogDescription>New plans start inactive — toggle isActive when ready.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Slug</Label>
            <Input value={slug} onChange={(changeEvent) => setSlug(changeEvent.target.value)} placeholder="pro_plus" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(changeEvent) => setName(changeEvent.target.value)} placeholder="Pro Plus" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={(changeEvent) => setDescription(changeEvent.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Sort order</Label>
            <Input type="number" value={sortOrder} onChange={(changeEvent) => setSortOrder(Number(changeEvent.target.value))} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="create-active" />
            <Label htmlFor="create-active" className="text-xs">Active</Label>
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !slug.trim() || !name.trim()}>
            {saving ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
