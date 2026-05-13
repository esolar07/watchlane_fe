"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MailCheck } from "lucide-react";

function MailboxRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "true";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/teams");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-4">
      {connected ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Mailbox connected</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Redirecting to your teams...
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-lg font-semibold">Redirecting...</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Taking you to your teams.
          </p>
        </div>
      )}
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function MailboxPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        }
      >
        <MailboxRedirect />
      </Suspense>
    </div>
  );
}
