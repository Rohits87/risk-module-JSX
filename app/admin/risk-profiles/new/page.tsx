import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CreateRiskProfileForm from "@/components/admin/risk/create-risk-profile-form"
import { getCountries, getMerchants } from "@/lib/data"

export default async function NewRiskProfilePage() {
  const countries = await getCountries()
  const merchants = await getMerchants()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/risk-profiles" className="text-sm text-gray-500 hover:text-primary flex items-center mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Risk Profiles
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Risk Profile</h1>
        <p className="text-muted-foreground mt-1">Configure the details and parameters for the new risk profile.</p>
      </div>
      <CreateRiskProfileForm countries={countries} merchants={merchants} />
    </div>
  )
}
