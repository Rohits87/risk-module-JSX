import type { RiskProfile, Country, Merchant, UserRole, RiskProfileStatus, RiskProfileParameters } from "./types"
import { faker } from "@faker-js/faker"

export const USER_ROLE: UserRole = "Super-Admin" // Mock current user role. Change to "Maker" or "Checker" to test UI.

// Mock Master Lists - In a real system, these would be managed globally
export const masterNegativeCountriesList: string[] = ["KP", "IR", "SY", "CU"] // North Korea, Iran, Syria, Cuba
export const masterNegativeBINsList: string[] = ["400000", "500000", "600000"]
export const masterNegativeIPsList: string[] = ["10.0.0.1", "192.168.0.1/24", "2001:db8::/32"]
export const masterNegativeDomainsList: string[] = ["risky-domain.com", "another-bad-site.org"]

const createMockRiskProfileParameters = (): RiskProfileParameters => ({
  negativeCountries: faker.helpers.arrayElements(
    mockCountries.map((c) => c.code),
    faker.number.int({ min: 0, max: 3 }),
  ),
  negativeBINs: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () =>
    faker.finance.creditCardNumber("######"),
  ),
  negativeIPs: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.internet.ip()),
  declinedCardThreshold: faker.datatype.boolean(0.7)
    ? {
        retentionWindow: faker.helpers.arrayElement([30, 60, 120, 240]),
        maxDeclineCount: faker.number.int({ min: 2, max: 5 }),
      }
    : undefined,
  negativeDomains: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.internet.domainName()),
  cardConfig: faker.datatype.boolean(0.8)
    ? {
        retentionDuration: faker.helpers.arrayElement([3600, 86400, 604800]),
        maxDebitAmount: faker.number.int({ min: 100, max: 5000 }),
        maxCreditAmount: faker.number.int({ min: 500, max: 10000 }),
        minTransactionAmount: faker.number.int({ min: 1, max: 50 }),
        maxTransactionCount: faker.number.int({ min: 5, max: 50 }),
      }
    : undefined,
  ipConfig: faker.datatype.boolean(0.7)
    ? {
        retentionDuration: faker.helpers.arrayElement([600, 1800, 3600]),
        maxTransactionCount: faker.number.int({ min: 10, max: 100 }),
      }
    : undefined,
  terminalConfig: faker.datatype.boolean(0.6)
    ? {
        maxFloorLimitAmount: faker.number.int({ min: 100, max: 1000 }),
        retentionDuration: faker.helpers.arrayElement([1800, 3600, 7200]),
        maxFloorLimitTransactionCount: faker.number.int({ min: 3, max: 10 }),
        maxProcessingAmount: faker.number.int({ min: 5000, max: 50000 }),
        maxCreditProcessingAmount: faker.number.int({ min: 2000, max: 25000 }),
        enableAutoInactivate: faker.datatype.boolean(),
      }
    : undefined,
})

const createMockRiskProfile = (id: number, statusOverride?: RiskProfileStatus): RiskProfile => {
  const statusCycle: RiskProfileStatus[] = ["Pending Approval", "Active", "Inactive", "Rejected"]
  const status = statusOverride || statusCycle[id % statusCycle.length]

  return {
    id: faker.string.uuid(),
    profileName: faker.company.catchPhraseNoun() + ` Profile ${id}`,
    creator: faker.person.fullName(),
    createdDate: faker.date.past({ years: 1 }).toISOString(),
    status: status,
    description: faker.lorem.sentence(),
    parameters: createMockRiskProfileParameters(),
    assignedMerchants: faker.helpers.arrayElements(
      mockMerchants.map((m) => m.id),
      faker.number.int({ min: 0, max: 3 }),
    ),
    version: faker.number.int({ min: 1, max: 5 }),
    auditLog: [
      { action: "created", userId: "user_abc", timestamp: faker.date.past({ years: 1 }).toISOString() },
      ...(status !== "Pending Approval"
        ? [{ action: "submitted", userId: "user_abc", timestamp: faker.date.past({ years: 1 }).toISOString() } as const]
        : []),
      ...(status === "Active"
        ? [{ action: "approved", userId: "checker_xyz", timestamp: faker.date.recent().toISOString() } as const]
        : []),
    ],
  }
}

const mockCountriesData: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "RU", name: "Russia" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "PK", name: "Pakistan" },
  { code: "KP", name: "North Korea" },
  { code: "IR", name: "Iran" },
  { code: "SY", name: "Syria" },
  { code: "CU", name: "Cuba" },
]

const mockMerchantsData: Merchant[] = Array.from({ length: 20 }, (_, i) => ({
  id: `merchant_${i + 1}`,
  name: faker.company.name(),
}))

export const mockCountries: Country[] = mockCountriesData
export const mockMerchants: Merchant[] = mockMerchantsData

const mockRiskProfiles: RiskProfile[] = Array.from({ length: 15 }, (_, i) => createMockRiskProfile(i + 1))

export async function getRiskProfiles(): Promise<RiskProfile[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockRiskProfiles), 500))
}

export async function getCountries(): Promise<Country[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockCountries), 100))
}

export async function getMerchants(): Promise<Merchant[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockMerchants), 100))
}
