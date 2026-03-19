"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { getAuthUrls } from "@/services/api";

export default function SignupPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  async function handleMicrosoftSignUp() {
    setError("");
    setIsLoading(true);
    try {
      const { microsoft } = await getAuthUrls();
      window.location.href = microsoft;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start sign up"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left side: Value + Trust ── */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-primary text-primary-foreground">
        <div className="flex flex-col justify-between w-full px-10 lg:px-12 xl:px-20 py-16">
          {/* Top content */}
          <div>
            <Image
              src="/logo.svg"
              alt="WatchLane"
              width={160}
              height={40}
              className="mb-10 brightness-0 invert"
              priority
            />

            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/60 mb-6">
              Email SLA Monitoring
            </p>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-6">
              Stop guessing.
              <br />
              Start measuring.
            </h1>

            <p className="text-base lg:text-lg text-primary-foreground/70 leading-relaxed max-w-lg mb-12">
              Watchlane tracks response times, surfaces SLA breaches, and shows
              exactly who owns every email thread — in real time.
            </p>

            {/* Value bullets */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/20">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium">Live SLA countdowns</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/20">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium">
                  Breach &amp; at-risk alerts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/20">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium">
                  Performance visibility by rep
                </span>
              </div>
            </div>
          </div>

          {/* Bottom trust signal */}
          <div className="flex items-center gap-2 text-xs text-primary-foreground/50">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Secure Microsoft authentication. No passwords stored.</span>
          </div>
        </div>
      </div>

      {/* ── Right side: Form ── */}
      <main className="flex w-full md:w-3/5 lg:w-1/2 items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 md:hidden">
            <Image
              src="/logo.svg"
              alt="WatchLane"
              width={140}
              height={36}
              priority
            />
          </div>

          {/* Mobile value proposition — visible below md */}
          <div className="mb-8 md:hidden">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Email SLA Monitoring
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground leading-snug mb-3">
              Stop guessing.<br />Start measuring.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track response times, surface SLA breaches, and see exactly who
              owns every thread — in real time.
            </p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Create your account
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in with your work Microsoft account
          </p>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <Button
            className="w-full h-11 text-sm font-medium"
            disabled={isLoading}
            onClick={handleMicrosoftSignUp}
          >
            {isLoading ? (
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
                  aria-hidden="true"
                >
                  <path d="M1 1h10v10H1z" fill="#F25022" />
                  <path d="M12 1h10v10H12z" fill="#7FBA00" />
                  <path d="M1 12h10v10H1z" fill="#00A4EF" />
                  <path d="M12 12h10v10H12z" fill="#FFB900" />
                </svg>
                Continue with Microsoft
              </span>
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            We&apos;ll never post or send emails on your behalf.
          </p>

          {/* Divider + login link */}
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
