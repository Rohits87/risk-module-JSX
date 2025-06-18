import Link from "next/link"
import { Box, Typography, Button } from "@mui/material"
import { Home } from "@mui/icons-material"

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "6rem", fontWeight: "bold", color: "#ef4444", mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button
        component={Link}
        href="/admin/risk-profiles"
        variant="contained"
        startIcon={<Home />}
        sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
      >
        Go to Risk Profiles
      </Button>
    </Box>
  )
}
