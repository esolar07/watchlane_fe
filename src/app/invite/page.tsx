"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInviteUrl } from "@/services/api";

export default function InvitePage() {
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
          err instanceof Error ? err.message : "Invalid or expired invite link"
        );
      })
      .finally(() => setIsLoading(false));
  }, [code]);

  function handleJoin() {
    setIsRedirecting(true);
    window.location.href = oauthUrl;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/logo.svg"
            alt="WatchLane"
            width={300}
            height={300}
            className="mx-auto mb-4 rounded-xl"
            priority
          />
        </div>

        <Card className="shadow-lg">
          {isLoading ? (
            <CardContent className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </CardContent>
          ) : error ? (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Invalid Invite</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => (window.location.href = "/login")}
                >
                  Go to login
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">
                  You&apos;ve been invited
                </CardTitle>
                <CardDescription>
                  Join <span className="font-medium text-foreground">{orgName}</span> on
                  WatchLane
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{orgName}</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll join as a member
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={isRedirecting}
                  onClick={handleJoin}
                >
                  {isRedirecting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Redirecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
