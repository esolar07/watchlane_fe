import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Configure your account preferences.
        </p>
      </div>

      <Card className="gap-0 py-0 shadow-none">
        <CardHeader className="border-b border-border px-5 py-3.5">
          <CardTitle className="text-[13px] font-semibold">Account</CardTitle>
          <CardDescription className="text-[12px]">
            Settings related to your personal account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-[13px] text-muted-foreground">
            Account settings coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
