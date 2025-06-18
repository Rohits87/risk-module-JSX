import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowLeft } from "lucide-react"
import RiskProfileListClient from "@/components/admin/risk/risk-profile-list-client"
import { getRiskProfilesAction, getCountriesAction } from "@/lib/actions"

export default async function RiskProfilesPage() {
  const profiles = await getRiskProfilesAction()
  const countries = await getCountriesAction()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-primary flex items-center mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Risk Profiles Management</h1>
          <Link href="/admin/risk-profiles/new">
            <Button className="mt-2 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Profile
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground mt-1">Define and manage reusable risk profiles for merchant accounts.</p>
      </div>
      <RiskProfileListClient initialProfiles={profiles} countries={countries} />
    </div>
  )
}
