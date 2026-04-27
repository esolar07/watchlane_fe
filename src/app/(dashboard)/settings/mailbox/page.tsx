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
    const timer = setTimeout(() => router.replace("/organizations"), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-4">
      {connected ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <MailCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-[15px] font-semibold tracking-tight">
              Mailbox connected
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Redirecting to your organizations…
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Redirecting…
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Taking you to your organizations.
          </p>
        </div>
      )}
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function MailboxPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Suspense
        fallback={
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        }
      >
        <MailboxRedirect />
      </Suspense>
    </div>
  );
}
