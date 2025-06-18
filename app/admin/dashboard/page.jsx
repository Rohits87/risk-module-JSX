import Link from "next/link"
import { Card, CardContent, Box, Typography, Button } from "@mui/material"
import { Security } from "@mui/icons-material"

export default function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Touras Admin Panel.
        </Typography>
      </Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Security sx={{ color: "#ef4444", fontSize: 32 }} />
            <Typography variant="h5" component="h2">
              Risk Management Module
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Manage and configure risk profiles for your merchants to prevent fraud and operational loss.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            You can create, view, edit, and assign risk profiles from the risk management section. This is the primary
            module currently active.
          </Typography>
          <Button
            component={Link}
            href="/admin/risk-profiles"
            variant="contained"
            sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
          >
            Go to Risk Profiles
          </Button>
        </CardContent>
      </Card>
      <Card sx={{ backgroundColor: "#f9fafb", border: "2px dashed #d1d5db" }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Other Modules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Other modules like Analytics, User Management, and Merchant Management are currently placeholders.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
