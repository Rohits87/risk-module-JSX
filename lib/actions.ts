"use server"

import type { RiskProfile, Country, Merchant } from "./types"
import { faker } from "@faker-js/faker"

export const USER_ROLE = "Super-Admin" // Mock current user role

// Mock Master Lists
export const masterNegativeCountriesList: string[] = ["KP", "IR", "SY", "CU"]
export const masterNegativeBINsList: string[] = ["400000", "500000", "600000"]
export const masterNegativeIPsList: string[] = ["10.0.0.1", "192.168.0.1/24", "2001:db8::/32"]
export const masterNegativeDomainsList: string[] = ["risky-domain.com", "another-bad-site.org"]

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

const createMockRiskProfile = (id: number): RiskProfile => {
  const statusCycle = ["Pending Approval", "Active", "Inactive", "Rejected"] as const
  const status = statusCycle[id % statusCycle.length]

  return {
    id: faker.string.uuid(),
    profileName: faker.company.catchPhraseNoun() + ` Profile ${id}`,
    creator: faker.person.fullName(),
    createdDate: faker.date.past({ years: 1 }).toISOString(),
    status: status,
    description: faker.lorem.sentence(),
    parameters: {
      negativeCountries: faker.helpers.arrayElements(
        mockCountriesData.map((c) => c.code),
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
    },
    assignedMerchants: faker.helpers.arrayElements(
      mockMerchantsData.map((m) => m.id),
      faker.number.int({ min: 0, max: 3 }),
    ),
    version: faker.number.int({ min: 1, max: 5 }),
    auditLog: [{ action: "created", userId: "user_abc", timestamp: faker.date.past({ years: 1 }).toISOString() }],
  }
}

const mockRiskProfiles: RiskProfile[] = Array.from({ length: 15 }, (_, i) => createMockRiskProfile(i + 1))

export async function getRiskProfilesAction(): Promise<RiskProfile[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockRiskProfiles), 500))
}

export async function getCountriesAction(): Promise<Country[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockCountriesData), 100))
}

export async function getMerchantsAction(): Promise<Merchant[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockMerchantsData), 100))
}
