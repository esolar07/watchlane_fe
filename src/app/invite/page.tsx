"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Building2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInviteUrl } from "@/services/api";

function InviteContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [orgName, setOrgName] = useState("");
  const [oauthUrl, setOauthUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!code) {
      setError("No invite code provided.");
      setIsLoading(false);
      return;
    }
    getInviteUrl(code)
      .then((data) => {
        setOrgName(data.organizationName);
        setOauthUrl(data.url);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Invalid or expired invite link",
        );
      })
      .finally(() => setIsLoading(false));
  }, [code]);

  function handleJoin() {
    setIsRedirecting(true);
    window.location.href = oauthUrl;
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-7">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-7">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          </span>
          <h1 className="text-[16px] font-semibold tracking-tight">
            Invalid invite
          </h1>
        </div>
        <p className="mb-5 text-[13px] text-muted-foreground">{error}</p>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => (window.location.href = "/login")}
        >
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold tracking-tight">
          You&apos;ve been invited
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Join{" "}
          <span className="font-medium text-foreground">{orgName}</span> on
          WatchLane.
        </p>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[13.5px] font-medium leading-none">{orgName}</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            You&apos;ll join as a member.
          </p>
        </div>
      </div>

      <Button
        className="h-10 w-full"
        disabled={isRedirecting}
        onClick={handleJoin}
      >
        {isRedirecting ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Redirecting…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 23 23"
              fill="none"
            >
              <path d="M1 1h10v10H1z" fill="#F25022" />
              <path d="M12 1h10v10H12z" fill="#7FBA00" />
              <path d="M1 12h10v10H1z" fill="#00A4EF" />
              <path d="M12 12h10v10H12z" fill="#FFB900" />
            </svg>
            Continue with Outlook
          </span>
        )}
      </Button>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-10 flex justify-center">
          <Image
            src="/logo.svg"
            alt="WatchLane"
            width={56}
            height={56}
            className="rounded-md"
            priority
          />
        </div>
        <Suspense
          fallback={
            <div className="rounded-lg border border-border bg-card p-7">
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            </div>
          }
        >
          <InviteContent />
        </Suspense>
      </div>
    </div>
  );
}
