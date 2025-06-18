import Link from "next/link"
import { ArrowBack } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"

export default function EditRiskProfilePage({ params }) {
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
          Edit Risk Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Profile ID: {params.id}
        </Typography>
      </Box>

      <Box sx={{ p: 4, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Edit Profile Page
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page will contain the same form as the create page but pre-populated with existing profile data. Users
          can modify parameters, reassign merchants, and submit changes for approval.
        </Typography>
      </Box>
    </Box>
  )
}
