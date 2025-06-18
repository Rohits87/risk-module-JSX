import Link from "next/link"
import { ArrowBack } from "@mui/icons-material"
import { Box, Typography, Button } from "@mui/material"
import { mockRiskProfiles } from "../../../../lib/actions.js"

export async function generateStaticParams() {
  return mockRiskProfiles.map((profile) => ({
    id: profile.id.toString(),
  }))
}

export default function ViewRiskProfilePage({ params }) {
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
          View Risk Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Profile ID: {params.id}
        </Typography>
      </Box>

      <Box sx={{ p: 4, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          View Profile Page
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This page will display detailed information about the risk profile including all parameters, assigned
          merchants, audit logs, and configuration details.
        </Typography>
        <Button
          component={Link}
          href={`/admin/risk-profiles/${params.id}/edit`}
          variant="contained"
          sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
        >
          Edit Profile
        </Button>
      </Box>
    </Box>
  )
}