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
      setError(err instanceof Error ? err.message : "Failed to start sign up");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left: pitch ── */}
      <aside className="hidden border-r border-border bg-muted/30 md:flex md:w-2/5 lg:w-1/2">
        <div className="flex w-full flex-col justify-between px-10 py-14 lg:px-14 xl:px-20">
          <div>
            <Image
              src="/logo.svg"
              alt="WatchLane"
              width={36}
              height={36}
              className="mb-12 rounded-md"
              priority
            />

            <p className="mb-5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Email SLA monitoring
            </p>
            <h1 className="mb-5 text-[36px] font-semibold leading-[1.1] tracking-tight lg:text-[40px]">
              Stop guessing.
              <br />
              Start measuring.
            </h1>
            <p className="mb-12 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              WatchLane tracks response times, surfaces SLA breaches, and shows
              exactly who owns every email thread — in real time.
            </p>

            <ul className="space-y-3.5">
              {[
                { icon: Clock, label: "Live SLA countdowns" },
                { icon: AlertTriangle, label: "Breach & at-risk alerts" },
                { icon: BarChart3, label: "Performance visibility by rep" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <Icon className="h-3.5 w-3.5 text-foreground" />
                  </span>
                  <span className="text-[13.5px] font-medium">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>
              Secure Microsoft authentication. No passwords stored.
            </span>
          </div>
        </div>
      </aside>

      {/* ── Right: form ── */}
      <main className="flex w-full items-center justify-center px-6 sm:px-12 md:w-3/5 lg:w-1/2">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 md:hidden">
            <Image
              src="/logo.svg"
              alt="WatchLane"
              width={36}
              height={36}
              className="rounded-md"
              priority
            />
          </div>

          {/* Mobile pitch */}
          <div className="mb-8 md:hidden">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Email SLA monitoring
            </p>
            <h1 className="mb-2 text-[24px] font-semibold leading-tight tracking-tight">
              Stop guessing. Start measuring.
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Track response times, surface SLA breaches, see thread ownership.
            </p>
          </div>

          <h2 className="text-[18px] font-semibold tracking-tight">
            Create your account
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Sign in with your work Microsoft account.
          </p>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-5 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            className="mt-6 h-10 w-full"
            disabled={isLoading}
            onClick={handleMicrosoftSignUp}
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

          <p className="mt-3 text-[11.5px] text-muted-foreground">
            We&apos;ll never post or send emails on your behalf.
          </p>

          <div className="mt-10 border-t border-border pt-5 text-center text-[12.5px] text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
