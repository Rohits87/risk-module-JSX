export type RiskProfileStatus = "Active" | "Pending Approval" | "Inactive" | "Rejected"

export interface AuditLogEntry {
  action: "created" | "submitted" | "approved" | "rejected" | "updated" | "status_changed"
  userId: string
  timestamp: string // ISO date string
  reason?: string
  previousStatus?: RiskProfileStatus
  newStatus?: RiskProfileStatus
  changes?: Partial<RiskProfileParameters> // For 'updated' action
}

export interface CardConfigParameters {
  retentionDuration?: number // seconds
  maxDebitAmount?: number
  maxCreditAmount?: number
  minTransactionAmount?: number
  maxTransactionCount?: number
}

export interface IPConfigParameters {
  retentionDuration?: number // seconds
  maxTransactionCount?: number
}

export interface TerminalConfigParameters {
  maxFloorLimitAmount?: number
  retentionDuration?: number // seconds
  maxFloorLimitTransactionCount?: number
  maxProcessingAmount?: number
  maxCreditProcessingAmount?: number
  enableAutoInactivate?: boolean
}

export interface RiskProfileParameters {
  // General parameters (existing)
  negativeCountries: string[]
  negativeBINs: string[] // Stored as array, but textarea might take string
  negativeIPs: string[] // Stored as array
  declinedCardThreshold?: {
    retentionWindow: number // in minutes
    maxDeclineCount: number
  }
  negativeDomains: string[] // Stored as array

  // New specific configurations
  cardConfig?: CardConfigParameters
  ipConfig?: IPConfigParameters
  terminalConfig?: TerminalConfigParameters
}

export interface RiskProfile {
  id: string
  profileName: string
  description?: string
  creator: string // User ID or name
  createdDate: string // ISO date string
  status: RiskProfileStatus
  parameters: RiskProfileParameters
  assignedMerchants: string[] // Array of merchant IDs
  version: number
  auditLog?: AuditLogEntry[]
}

export interface Country {
  code: string // ISO country code e.g. "US"
  name: string // e.g. "United States"
}

export interface Merchant {
  id: string
  name: string
}

export type UserRole = "Maker" | "Checker" | "Super-Admin"
