import Link from "next/link"
import { Card, CardContent, Box, Typography, Button } from "@mui/material"
import { ArrowBack, People } from "@mui/icons-material"

export default function UsersPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/admin/dashboard" style={{ textDecoration: "none", color: "#6b7280" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "#6b7280", "&:hover": { color: "#ef4444" } }}>
            <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2">Back to Dashboard</Typography>
          </Box>
        </Link>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and their access permissions.
        </Typography>
      </Box>

      <Card sx={{ backgroundColor: "#f9fafb", border: "2px dashed #d1d5db" }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <People sx={{ fontSize: 64, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            User Management Module
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This module will contain user creation, role assignment, permission management, and user activity monitoring
            features.
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
    </Box>
  )
}
