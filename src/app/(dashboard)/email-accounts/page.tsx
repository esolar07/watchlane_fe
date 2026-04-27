import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmailAccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Email accounts
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Manage your connected mailboxes.
        </p>
      </div>

      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-[14px] font-medium">No mailboxes yet</h3>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Connect a mailbox from an organization to start tracking response
            times.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
