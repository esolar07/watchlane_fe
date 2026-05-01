"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { getAuthUrls } from "@/services/api";

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const shouldRedirect = !authLoading && isAuthenticated;

  useEffect(() => {
    if (shouldRedirect) router.replace("/dashboard");
  }, [shouldRedirect, router]);

  if (shouldRedirect) return null;

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
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in with your Outlook account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                disabled={isLoading}
                onClick={handleOutlookSignIn}
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
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
