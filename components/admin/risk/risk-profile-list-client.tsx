"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  ListFilter,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import type { Country, RiskProfile, RiskProfileStatus } from "@/lib/types"
import { USER_ROLE } from "@/lib/constants"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import GlobalParameterModal from "./global-parameter-modal"

interface RiskProfileListClientProps {
  initialProfiles: RiskProfile[]
  countries: Country[]
}

const statusOptions: RiskProfileStatus[] = ["Active", "Pending Approval", "Inactive", "Rejected"]

export default function RiskProfileListClient({ initialProfiles, countries }: RiskProfileListClientProps) {
  const { toast } = useToast()
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false)
  const [profiles, setProfiles] = useState<RiskProfile[]>(initialProfiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RiskProfileStatus | "All">("All")
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([])

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProfileIds(pendingApprovalProfilesInView.map((p) => p.id))
    } else {
      setSelectedProfileIds([])
    }
  }

  const handleSelectSingle = (profileId: string, checked: boolean) => {
    if (checked) {
      setSelectedProfileIds((prev) => [...prev, profileId])
    } else {
      setSelectedProfileIds((prev) => prev.filter((id) => id !== profileId))
    }
  }

  const handleBulkAction = (action: "approve" | "reject") => {
    if (selectedProfileIds.length === 0) return

    let reason: string | null = null
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
    toast({
      title: `Profiles ${action === "approve" ? "Approved" : "Rejected"}`,
      description: `${selectedProfileIds.length} profile(s) have been ${
        action === "approve" ? "approved" : "rejected"
      }.`,
    })
    setSelectedProfileIds([])
  }

  const handleStatusChange = (profileId: string, newStatus: RiskProfileStatus, reason?: string) => {
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
    toast({
      title: `Profile ${newStatus === "Active" ? "Approved" : newStatus === "Rejected" ? "Rejected" : "Status Updated"}`,
      description: `Profile "${profiles.find((p) => p.id === profileId)?.profileName}" is now ${newStatus}.`,
    })
  }

  const handleDelete = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    toast({
      title: "Profile Deleted",
      description: `Profile "${profiles.find((p) => p.id === profileId)?.profileName}" has been deleted.`,
      variant: "destructive",
    })
  }

  const canEdit = (status: RiskProfileStatus) =>
    (USER_ROLE === "Maker" && (status === "Pending Approval" || status === "Inactive" || status === "Rejected")) ||
    USER_ROLE === "Super-Admin"
  const canDelete = (status: RiskProfileStatus) =>
    (USER_ROLE === "Maker" && (status === "Pending Approval" || status === "Inactive" || status === "Rejected")) ||
    USER_ROLE === "Super-Admin"
  const canChangeStatus = (profile: RiskProfile) => USER_ROLE === "Super-Admin"
  const canApproveReject = (status: RiskProfileStatus) => USER_ROLE === "Checker" || USER_ROLE === "Super-Admin"

  const getStatusBadgeVariant = (status: RiskProfileStatus) => {
    switch (status) {
      case "Active":
        return "default"
      case "Pending Approval":
        return "secondary"
      case "Inactive":
        return "secondary"
      case "Rejected":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: RiskProfileStatus) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
      case "Pending Approval":
        return <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
      case "Inactive":
        return <ToggleLeft className="mr-2 h-4 w-4 text-gray-500" />
      case "Rejected":
        return <XCircle className="mr-2 h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const handleApplyGlobalParameter = (data: {
    parameterType: "negativeCountries" | "negativeBINs" | "negativeIPs" | "negativeDomains"
    values: string[]
  }) => {
    const { parameterType, values } = data
    if (values.length === 0) {
      toast({
        title: "No Values Provided",
        description: "Please enter or select at least one value to apply.",
        variant: "destructive",
      })
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
    toast({
      title: "Global Parameter Applied",
      description: `Added ${values.length} value(s) to ${updatedCount} profiles. Affected active profiles are now 'Pending Approval'.`,
    })
    setIsGlobalModalOpen(false)
  }

  const showBulkActions =
    (showPendingOnly || statusFilter === "Pending Approval") &&
    selectedProfileIds.length > 0 &&
    (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin")

  return (
    <>
      <GlobalParameterModal
        isOpen={isGlobalModalOpen}
        onOpenChange={setIsGlobalModalOpen}
        onSubmit={handleApplyGlobalParameter}
        countries={countries}
      />
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="pending-authorization"
              checked={showPendingOnly}
              onCheckedChange={(checked) => {
                setShowPendingOnly(checked)
                if (checked) {
                  setStatusFilter("Pending Approval")
                } else {
                  setStatusFilter("All")
                }
              }}
            />
            <Label htmlFor="pending-authorization" className="text-sm font-medium">
              Pending Authorization List
            </Label>
          </div>
          <Button onClick={() => setIsGlobalModalOpen(true)} className="w-full sm:w-auto">
            <Globe className="mr-2 h-4 w-4" />
            Add to System Master List
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <Input
            placeholder="Search by name or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as RiskProfileStatus | "All")
              if (value !== "Pending Approval" && value !== "All") {
                setShowPendingOnly(false)
              } else if (value === "Pending Approval") {
                setShowPendingOnly(true)
              }
            }}
            disabled={showPendingOnly && statusFilter === "Pending Approval"}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showBulkActions && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md border flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-sm font-medium">{selectedProfileIds.length} profile(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("approve")}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Approve Selected
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("reject")}>
                <ShieldX className="mr-2 h-4 w-4" /> Reject Selected
              </Button>
            </div>
          </div>
        )}

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ListFilter className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-semibold">No risk profiles found.</p>
            <p className="text-sm">
              {showPendingOnly
                ? "There are no profiles pending authorization matching your search."
                : "Try adjusting your search or filter criteria, or create a new profile."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {(showPendingOnly || statusFilter === "Pending Approval") &&
                (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin") &&
                pendingApprovalProfilesInView.length > 0 ? (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        pendingApprovalProfilesInView.length > 0 &&
                        selectedProfileIds.length === pendingApprovalProfilesInView.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                      aria-label="Select all pending profiles"
                    />
                  </TableHead>
                ) : (
                  <TableHead className="w-[50px]"></TableHead>
                )}
                <TableHead>Profile Name</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  data-state={selectedProfileIds.includes(profile.id) ? "selected" : undefined}
                >
                  {(showPendingOnly || statusFilter === "Pending Approval") &&
                  (USER_ROLE === "Checker" || USER_ROLE === "Super-Admin") ? (
                    <TableCell>
                      {profile.status === "Pending Approval" ? (
                        <Checkbox
                          checked={selectedProfileIds.includes(profile.id)}
                          onCheckedChange={(checked) => handleSelectSingle(profile.id, Boolean(checked))}
                          aria-label={`Select profile ${profile.profileName}`}
                        />
                      ) : null}
                    </TableCell>
                  ) : (
                    <TableCell></TableCell>
                  )}
                  <TableCell className="font-medium">{profile.profileName}</TableCell>
                  <TableCell>{profile.creator}</TableCell>
                  <TableCell>{format(new Date(profile.createdDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(profile.status)}
                      className="capitalize flex items-center w-fit"
                    >
                      {getStatusIcon(profile.status)}
                      {profile.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/risk-profiles/${profile.id}/view`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        {canEdit(profile.status) && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/risk-profiles/${profile.id}/edit`} className="flex items-center">
                              <Edit3 className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canApproveReject(profile.status) && profile.status === "Pending Approval" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(profile.id, "Active")}
                              className="text-green-600 focus:text-green-700 focus:bg-green-50 flex items-center"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const reason = prompt("Please provide a reason for rejection:")
                                if (reason !== null) {
                                  handleStatusChange(profile.id, "Rejected", reason)
                                }
                              }}
                              className="text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {canChangeStatus(profile) && profile.status === "Active" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(profile.id, "Inactive")}
                            className="flex items-center"
                          >
                            <ToggleLeft className="mr-2 h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                        )}
                        {canChangeStatus(profile) && profile.status === "Inactive" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(profile.id, "Active")}
                            className="flex items-center"
                          >
                            <ToggleRight className="mr-2 h-4 w-4" /> Activate
                          </DropdownMenuItem>
                        )}
                        {canDelete(profile.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(profile.id)}
                              className="text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}