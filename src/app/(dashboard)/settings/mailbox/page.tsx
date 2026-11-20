"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// OAuth success lands here. /teams refetches every team's mailboxes on mount.
function MailboxRedirect() {
  const router = useRouter();
  const connected = useSearchParams().get("connected") === "true";
  useEffect(() => {
    if (connected) toast.success("Mailbox connected", { id: "mailbox-connected" });
    router.replace("/teams");
  }, [connected, router]);
  return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
}

export default function MailboxPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Suspense fallback={null}>
        <MailboxRedirect />
      </Suspense>
    </div>
  );
}
