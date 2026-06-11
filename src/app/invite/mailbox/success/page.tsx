import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MailboxConnectSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <BrandHeader />
        <SuccessCard />
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
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
  );
}

function SuccessCard() {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <SuccessIcon />
        <h1 className="text-xl font-semibold">Your mailbox is connected</h1>
        <SuccessBody />
      </CardContent>
    </Card>
  );
}

function SuccessIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
      <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
    </div>
  );
}

function SuccessBody() {
  return (
    <p className="text-sm text-muted-foreground">
      Thanks — you can close this tab. Watchlane is now monitoring your inbox on
      behalf of the team that invited you. You do not have a Watchlane account,
      and there&apos;s nothing else for you to do here.
    </p>
  );
}
