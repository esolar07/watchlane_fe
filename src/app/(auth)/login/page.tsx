"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { getAuthUrls } from "@/services/api";

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  async function handleOutlookSignIn() {
    setError("");
    setIsLoading(true);
    try {
      const { microsoft } = await getAuthUrls();
      window.location.href = microsoft;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start sign in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
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

        <div className="rounded-lg border border-border bg-card p-7">
          <div className="mb-6">
            <h1 className="text-[18px] font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sign in with your Outlook account to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full h-10"
            disabled={isLoading}
            onClick={handleOutlookSignIn}
          >
            {isLoading ? (
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
                Sign in with Outlook
              </span>
            )}
          </Button>

          <p className="mt-4 text-center text-[11.5px] text-muted-foreground">
            Secure Microsoft authentication. No passwords stored.
          </p>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
