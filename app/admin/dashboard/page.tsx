import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the Touras Admin Panel.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>Risk Management Module</CardTitle>
          </div>
          <CardDescription>
            Manage and configure risk profiles for your merchants to prevent fraud and operational loss.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You can create, view, edit, and assign risk profiles from the risk management section. This is the primary
            module currently active.
          </p>
          <Link href="/admin/risk-profiles">
            <Button>Go to Risk Profiles</Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="bg-muted/40 border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Other Modules</CardTitle>
          <CardDescription>
            Other modules like Analytics, User Management, and Merchant Management are currently placeholders.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
