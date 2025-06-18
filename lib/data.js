import { faker } from "@faker-js/faker"
import { RiskProfileStatuses, UserRoles } from "./types"

export const USER_ROLE = UserRoles.SUPER_ADMIN // Mock current user role

// Mock Master Lists
export const masterNegativeCountriesList = ["KP", "IR", "SY", "CU"]
export const masterNegativeBINsList = ["400000", "500000", "600000"]
export const masterNegativeIPsList = ["10.0.0.1", "192.168.0.1/24", "2001:db8::/32"]
export const masterNegativeDomainsList = ["risky-domain.com", "another-bad-site.org"]

const createMockRiskProfileParameters = () => ({
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

const createMockRiskProfile = (id, statusOverride) => {
  const statusCycle = [
    RiskProfileStatuses.PENDING_APPROVAL,
    RiskProfileStatuses.ACTIVE,
    RiskProfileStatuses.INACTIVE,
    RiskProfileStatuses.REJECTED,
  ]
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
      ...(status !== RiskProfileStatuses.PENDING_APPROVAL
        ? [{ action: "submitted", userId: "user_abc", timestamp: faker.date.past({ years: 1 }).toISOString() }]
        : []),
      ...(status === RiskProfileStatuses.ACTIVE
        ? [{ action: "approved", userId: "checker_xyz", timestamp: faker.date.recent().toISOString() }]
        : []),
    ],
  }
}

const mockCountriesData = [
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

const mockMerchantsData = Array.from({ length: 20 }, (_, i) => ({
  id: `merchant_${i + 1}`,
  name: faker.company.name(),
}))

export const mockCountries = mockCountriesData
export const mockMerchants = mockMerchantsData
export const mockRiskProfiles = Array.from({ length: 15 }, (_, i) => createMockRiskProfile(i + 1))
