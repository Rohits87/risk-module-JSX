// Remove TypeScript types and export as regular objects/constants

export const RiskProfileStatuses = {
  ACTIVE: "Active",
  PENDING_APPROVAL: "Pending Approval",
  INACTIVE: "Inactive",
  REJECTED: "Rejected",
}

export const UserRoles = {
  MAKER: "Maker",
  CHECKER: "Checker",
  SUPER_ADMIN: "Super-Admin",
}

export const AuditActions = {
  CREATED: "created",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  UPDATED: "updated",
  STATUS_CHANGED: "status_changed",
}
