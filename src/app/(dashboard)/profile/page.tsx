"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { useMe } from "@/hooks/useMe";
import { updateMe } from "@/services/api";

export default function ProfilePage() {
  const { user, isLoading, refetch } = useMe();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (user) setName(user.name ?? "");
  }, [user]);

  async function handleSubmit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateMe({ name: trimmed });
      await refetch();
      setSavedAt(Date.now());
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Display name</CardTitle>
          <CardDescription>Visible to everyone you share workspaces with.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Name</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(changeEvent) => setName(changeEvent.target.value)}
                disabled={saving}
              />
            </div>
            <ReadOnlyField label="Email" value={user.email} />
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving || !name.trim() || name.trim() === user.name}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {savedAt && <span className="text-xs text-muted-foreground">Saved.</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
