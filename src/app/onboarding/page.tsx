"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/components/AuthProvider";
import { useWorkspace } from "@/hooks/useWorkspace";
import { completeOnboarding } from "@/services/api";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useMe();
  const { refetch: refetchAuth } = useAuth();
  const { refetch: refetchWorkspaces, selectWorkspace } = useWorkspace();
  const [step, setStep] = useState<Step>(1);
  const [profileName, setProfileName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.onboardingCompletedAt) {
      router.replace("/dashboard");
      return;
    }
    if (!profileName) setProfileName(user.name ?? "");
  }, [user, isLoading, router, profileName]);

  function goNext(next: Step) {
    setStep(next);
    setErrorMessage(null);
  }

  async function handleFinalSubmit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!teamName.trim()) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await completeOnboarding({
        profileName: profileName.trim() || undefined,
        workspaceName: workspaceName.trim(),
        teamName: teamName.trim(),
      });
      await refetchAuth();
      await refetchWorkspaces();
      selectWorkspace(result.workspace.id);
      router.replace(`/teams/${result.team.id}`);
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Failed to complete onboarding.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !user || user.onboardingCompletedAt) {
    return <Loading />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {step} of 3</p>
          <CardTitle>{stepTitle(step)}</CardTitle>
          <CardDescription>{stepDescription(step)}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <ProfileStep
              profileName={profileName}
              setProfileName={setProfileName}
              onNext={() => goNext(2)}
            />
          )}
          {step === 2 && (
            <WorkspaceStep
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              onBack={() => goNext(1)}
              onNext={() => goNext(3)}
            />
          )}
          {step === 3 && (
            <TeamStep
              teamName={teamName}
              setTeamName={setTeamName}
              onBack={() => goNext(2)}
              onSubmit={handleFinalSubmit}
              submitting={submitting}
              errorMessage={errorMessage}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function stepTitle(step: Step) {
  if (step === 1) return "What should we call you?";
  if (step === 2) return "Name your workspace";
  return "Create your first team";
}

function stepDescription(step: Step) {
  if (step === 1) return "Your display name across Watchlane.";
  if (step === 2) return "Workspaces own your teams and billing.";
  return "A team is a department inside the workspace.";
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ProfileStep({
  profileName,
  setProfileName,
  onNext,
}: {
  profileName: string;
  setProfileName: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        if (profileName.trim()) onNext();
      }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input
          id="display-name"
          value={profileName}
          onChange={(changeEvent) => setProfileName(changeEvent.target.value)}
          placeholder="Jane Doe"
          autoFocus
        />
      </div>
      <Button type="submit" className="w-full" disabled={!profileName.trim()}>
        Continue
      </Button>
    </form>
  );
}

function WorkspaceStep({
  workspaceName,
  setWorkspaceName,
  onBack,
  onNext,
}: {
  workspaceName: string;
  setWorkspaceName: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        if (workspaceName.trim()) onNext();
      }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          value={workspaceName}
          onChange={(changeEvent) => setWorkspaceName(changeEvent.target.value)}
          placeholder="Acme Corp"
          autoFocus
        />
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={!workspaceName.trim()}>Continue</Button>
      </div>
    </form>
  );
}

function TeamStep({
  teamName,
  setTeamName,
  onBack,
  onSubmit,
  submitting,
  errorMessage,
}: {
  teamName: string;
  setTeamName: (value: string) => void;
  onBack: () => void;
  onSubmit: (submitEvent: FormEvent) => void;
  submitting: boolean;
  errorMessage: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="team-name">Team name</Label>
        <Input
          id="team-name"
          value={teamName}
          onChange={(changeEvent) => setTeamName(changeEvent.target.value)}
          placeholder="Customer Support"
          autoFocus
        />
      </div>
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>Back</Button>
        <Button type="submit" disabled={submitting || !teamName.trim()}>
          {submitting ? "Finishing…" : "Finish"}
        </Button>
      </div>
    </form>
  );
}
