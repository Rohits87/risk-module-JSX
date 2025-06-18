import Link from "next/link"
import { Button, Box, Typography } from "@mui/material"
import { Add, ArrowBack } from "@mui/icons-material"
import RiskProfileListClient from "@/components/admin/risk/risk-profile-list-client"

export default function RiskProfilesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/admin/dashboard" style={{ textDecoration: "none", color: "#6b7280" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "#6b7280", "&:hover": { color: "#ef4444" } }}>
            <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2">Back to Dashboard</Typography>
          </Box>
        </Link>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Risk Profiles Management
          </Typography>
          <Button
            component={Link}
            href="/admin/risk-profiles/new"
            variant="contained"
            startIcon={<Add />}
            sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
          >
            Add New Profile
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Define and manage reusable risk profiles for merchant accounts.
        </Typography>
      </Box>
      <RiskProfileListClient />
    </Box>
  )
}
