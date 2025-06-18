import Link from "next/link"
import { ArrowBack } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import CreateRiskProfileForm from "@/components/admin/risk/create-risk-profile-form"

export default function NewRiskProfilePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/admin/risk-profiles" style={{ textDecoration: "none", color: "#6b7280" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "#6b7280", "&:hover": { color: "#ef4444" } }}>
            <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2">Back to Risk Profiles</Typography>
          </Box>
        </Link>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          Create New Risk Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure the details and parameters for the new risk profile.
        </Typography>
      </Box>
      <CreateRiskProfileForm />
    </Box>
  )
}
