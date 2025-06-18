"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Menu,
  MenuItem,
  Chip,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material"
import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  ToggleOff,
  ToggleOn,
  CheckCircle,
  Cancel,
  Warning,
  FilterList,
  Public,
  Security,
  SecurityUpdate,
} from "@mui/icons-material"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { getRiskProfilesAction, getCountriesAction } from "@/lib/actions"
import { USER_ROLE } from "@/lib/data"
import GlobalParameterModal from "./global-parameter-modal"

const statusOptions = ["Active", "Pending Approval", "Inactive", "Rejected"]

export default function RiskProfileListClient() {
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [countries, setCountries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [selectedProfileIds, setSelectedProfileIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [profilesData, countriesData] = await Promise.all([getRiskProfilesAction(), getCountriesAction()])
        setProfiles(profilesData)
        setCountries(countriesData)
      } catch (error) {
        toast.error("Failed to load data")
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      if (showPendingOnly) {
        return (
          profile.status === "Pending Approval" &&
          (profile.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.creator.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }

      const matchesSearch =
        profile.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.creator.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || profile.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [profiles, searchTerm, statusFilter, showPendingOnly])

  const pendingApprovalProfilesInView = useMemo(() => {
    return filteredProfiles.filter((p) => p.status === "Pending Approval")
  }, [filteredProfiles])

  useEffect(() => {
    setSelectedProfileIds([])
  }, [searchTerm, statusFilter, showPendingOnly])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProfileIds(pendingApprovalProfilesInView.map((p) => p.id))
    } else {
      setSelectedProfileIds([])
    }
  }

  const handleSelectSingle = (profileId, checked) => {
    if (checked) {
      setSelectedProfileIds((prev) => [...prev, profileId])
    } else {
      setSelectedProfileIds((prev) => prev.filter((id) => id !== profileId))
    }
  }

  const handleBulkAction = (action) => {
    if (selectedProfileIds.length === 0) return

    let reason = null
    if (action === "reject") {
      reason = prompt(`Enter reason for rejecting ${selectedProfileIds.length} profile(s):`)
      if (reason === null) return
    }

    const newStatus = action === "approve" ? "Active" : "Rejected"
    const updatedProfiles = profiles.map((p) => {
      if (selectedProfileIds.includes(p.id)) {
        return {
          ...p,
          status: newStatus,
          version: p.version + 1,
          auditLog: [
            ...(p.auditLog || []),
            {
              action: newStatus === "Active" ? "approved" : "rejected",
              userId: USER_ROLE === "Checker" ? "checker_user_id" : "super_admin_id",
              timestamp: new Date().toISOString(),
              newStatus,
              reason: reason || undefined,
            },
          ],
        }
      }
      return p
    })
    setProfiles(updatedProfiles)
    toast.success(`Profiles ${action === "approve" ? "Approved" : "Rejected"}`)
    setSelectedProfileIds([])
  }

  const handleStatusChange = (profileId, newStatus, reason) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? {
              ...p,
              status: newStatus,
              version: p.version + 1,
              auditLog: [
                ...(p.auditLog || []),
                {
                  action:
                    newStatus === "Active" ? "approved" : newStatus === "Rejected" ? "rejected" : "status_changed",
                  userId: USER_ROLE === "Checker" ? "checker_user_id" : "super_admin_id",
                  timestamp: new Date().toISOString(),
                  newStatus,
                  reason: reason,
                },
              ],
            }
          : p,
      ),
    )
    toast.success(`Profile ${newStatus === "Active" ? "Approved" : newStatus === "Rejected" ? "Rejected" : "Updated"}`)
  }

  const handleDelete = (profileId) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    toast.success("Profile Deleted")
  }

  const handleMenuClick = (event, profile) => {
    setAnchorEl(event.currentTarget)
    setSelectedProfile(profile)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProfile(null)
  }

  const canEdit = (status) =>
    (USER_ROLE === "Maker" && (status === "Pending Approval" || status === "Inactive" || status === "Rejected")) ||
    USER_ROLE === "Super-Admin"
  const canDelete = (status) =>
    (USER_ROLE === "Maker" && (status === "Pending Approval" || status === "Inactive" || status === "Rejected")) ||
    USER_ROLE === "Super-Admin"
  const canChangeStatus = (profile) => USER_ROLE === "Super-Admin"
  const canApproveReject = (status) => USER_ROLE === "Checker" || USER_ROLE === "Super-Admin"

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success"
      case "Pending Approval":
        return "warning"
      case "Inactive":
        return "default"
      case "Rejected":
        return "error"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
      case "Pending Approval":
        return <Warning sx={{ fontSize: 16, mr: 0.5 }} />
      case "Inactive":
        return <ToggleOff sx={{ fontSize: 16, mr: 0.5 }} />
      case "Rejected":
        return <Cancel sx={{ fontSize: 16, mr: 0.5 }} />
      default:
        return null
    }
  }

  const handleApplyGlobalParameter = (data) => {
    const { parameterType, values } = data
    if (values.length === 0) {
      toast.error("No Values Provided")
      return
    }

    let updatedCount = 0
    const updatedProfiles = profiles.map((profile) => {
      if (profile.status === "Active" || profile.status === "Inactive") {
        updatedCount++
        const newProfile = JSON.parse(JSON.stringify(profile))

        const existingValues = new Set(newProfile.parameters[parameterType] || [])
        values.forEach((value) => existingValues.add(value))
        newProfile.parameters[parameterType] = Array.from(existingValues)

        newProfile.version = (newProfile.version || 1) + 1
        newProfile.auditLog = [
          ...(newProfile.auditLog || []),
          {
            action: "updated",
            userId: "super_admin_id",
            timestamp: new Date().toISOString(),
            reason: `Global parameter update for ${parameterType}`,
          },
        ]
        if (newProfile.status === "Active") {
          newProfile.status = "Pending Approval"
        }
        return newProfile
      }
      return profile
    })

    setProfiles(updatedProfiles)
    toast.success(`Global Parameter Applied to ${updatedCount} profiles`)
    setIsGlobalModalOpen(false)
  }

  const showBulkActions =
    (showPendingOnly || statusFilter === "Pending Approval") &&
    selectedProfileIds.length > 0 &&
    (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin")

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <>
      <GlobalParameterModal
        isOpen={isGlobalModalOpen}
        onOpenChange={setIsGlobalModalOpen}
        onSubmit={handleApplyGlobalParameter}
        countries={countries}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Controls */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={showPendingOnly}
                    onChange={(e) => {
                      setShowPendingOnly(e.target.checked)
                      if (e.target.checked) {
                        setStatusFilter("Pending Approval")
                      } else {
                        setStatusFilter("All")
                      }
                    }}
                  />
                }
                label="Pending Authorization List"
              />
              <Button
                variant="contained"
                startIcon={<Public />}
                onClick={() => setIsGlobalModalOpen(true)}
                sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
              >
                Add to System Master List
              </Button>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                placeholder="Search by name or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250 }}
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    if (e.target.value !== "Pending Approval" && e.target.value !== "All") {
                      setShowPendingOnly(false)
                    } else if (e.target.value === "Pending Approval") {
                      setShowPendingOnly(true)
                    }
                  }}
                  disabled={showPendingOnly && statusFilter === "Pending Approval"}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Bulk Actions */}
            {showBulkActions && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">{selectedProfileIds.length} profile(s) selected</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Security />}
                    onClick={() => handleBulkAction("approve")}
                    color="success"
                  >
                    Approve Selected
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SecurityUpdate />}
                    onClick={() => handleBulkAction("reject")}
                    color="error"
                  >
                    Reject Selected
                  </Button>
                </Box>
              </Box>
            )}

            {/* Table */}
            {filteredProfiles.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <FilterList sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No risk profiles found.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {showPendingOnly
                    ? "There are no profiles pending authorization matching your search."
                    : "Try adjusting your search or filter criteria, or create a new profile."}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      {(showPendingOnly || statusFilter === "Pending Approval") &&
                      (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin") &&
                      pendingApprovalProfilesInView.length > 0 ? (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              pendingApprovalProfilesInView.length > 0 &&
                              selectedProfileIds.length === pendingApprovalProfilesInView.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </TableCell>
                      ) : (
                        <TableCell padding="checkbox"></TableCell>
                      )}
                      <TableCell>Profile Name</TableCell>
                      <TableCell>Creator</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id} selected={selectedProfileIds.includes(profile.id)}>
                        {(showPendingOnly || statusFilter === "Pending Approval") &&
                        (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin") ? (
                          <TableCell padding="checkbox">
                            {profile.status === "Pending Approval" ? (
                              <Checkbox
                                checked={selectedProfileIds.includes(profile.id)}
                                onChange={(e) => handleSelectSingle(profile.id, e.target.checked)}
                              />
                            ) : null}
                          </TableCell>
                        ) : (
                          <TableCell padding="checkbox"></TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {profile.profileName}
                          </Typography>
                        </TableCell>
                        <TableCell>{profile.creator}</TableCell>
                        <TableCell>{format(new Date(profile.createdDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(profile.status)}
                            label={profile.status}
                            color={getStatusColor(profile.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={(e) => handleMenuClick(e, profile)} endIcon={<MoreVert />}>
                            Actions
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem component={Link} href={`/admin/risk-profiles/${selectedProfile?.id}/view`} onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1 }} /> View
        </MenuItem>
        {selectedProfile && canEdit(selectedProfile.status) && (
          <MenuItem component={Link} href={`/admin/risk-profiles/${selectedProfile.id}/edit`} onClick={handleMenuClose}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {selectedProfile &&
          canApproveReject(selectedProfile.status) &&
          selectedProfile.status === "Pending Approval" && (
            <>
              <MenuItem
                onClick={() => {
                  handleStatusChange(selectedProfile.id, "Active")
                  handleMenuClose()
                }}
                sx={{ color: "success.main" }}
              >
                <CheckCircle sx={{ mr: 1 }} /> Approve
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const reason = prompt("Please provide a reason for rejection:")
                  if (reason !== null) {
                    handleStatusChange(selectedProfile.id, "Rejected", reason)
                  }
                  handleMenuClose()
                }}
                sx={{ color: "error.main" }}
              >
                <Cancel sx={{ mr: 1 }} /> Reject
              </MenuItem>
            </>
          )}
        {selectedProfile && canChangeStatus(selectedProfile) && selectedProfile.status === "Active" && (
          <MenuItem
            onClick={() => {
              handleStatusChange(selectedProfile.id, "Inactive")
              handleMenuClose()
            }}
          >
            <ToggleOff sx={{ mr: 1 }} /> Deactivate
          </MenuItem>
        )}
        {selectedProfile && canChangeStatus(selectedProfile) && selectedProfile.status === "Inactive" && (
          <MenuItem
            onClick={() => {
              handleStatusChange(selectedProfile.id, "Active")
              handleMenuClose()
            }}
          >
            <ToggleOn sx={{ mr: 1 }} /> Activate
          </MenuItem>
        )}
        {selectedProfile && canDelete(selectedProfile.status) && (
          <MenuItem
            onClick={() => {
              handleDelete(selectedProfile.id)
              handleMenuClose()
            }}
            sx={{ color: "error.main" }}
          >
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
