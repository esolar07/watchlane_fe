import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailAccountsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Manage your email accounts here.
        </p>
      </CardContent>
    </Card>
  );
}
