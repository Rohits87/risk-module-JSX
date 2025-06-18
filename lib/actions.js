"use server"

export const USER_ROLE = "Super-Admin" // Mock current user role

// Mock Master Lists
export const masterNegativeCountriesList = ["KP", "IR", "SY", "CU"]
export const masterNegativeBINsList = ["400000", "500000", "600000"]
export const masterNegativeIPsList = ["10.0.0.1", "192.168.0.1/24", "2001:db8::/32"]
export const masterNegativeDomainsList = ["risky-domain.com", "another-bad-site.org"]

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
  name: `Merchant ${i + 1}`,
}))

const createMockRiskProfile = (id) => {
  const statusCycle = ["Pending Approval", "Active", "Inactive", "Rejected"]
  const status = statusCycle[id % statusCycle.length]

  return {
    id: `profile_${id}`,
    profileName: `Risk Profile ${id}`,
    creator: `User ${id}`,
    createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: status,
    description: `Description for profile ${id}`,
    parameters: {
      negativeCountries: ["US", "CA"].slice(0, Math.floor(Math.random() * 3)),
      negativeBINs: ["400000", "500000"].slice(0, Math.floor(Math.random() * 3)),
      negativeIPs: ["10.0.0.1", "192.168.0.1"].slice(0, Math.floor(Math.random() * 3)),
      declinedCardThreshold:
        Math.random() > 0.5
          ? {
              retentionWindow: 60,
              maxDeclineCount: 3,
            }
          : undefined,
      negativeDomains: ["example.com"].slice(0, Math.floor(Math.random() * 2)),
    },
    assignedMerchants: [`merchant_${id}`],
    version: 1,
    auditLog: [
      {
        action: "created",
        userId: "user_abc",
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

const mockRiskProfiles = Array.from({ length: 15 }, (_, i) => createMockRiskProfile(i + 1))

export async function getRiskProfilesAction() {
  return new Promise((resolve) => setTimeout(() => resolve(mockRiskProfiles), 500))
}

export async function getCountriesAction() {
  return new Promise((resolve) => setTimeout(() => resolve(mockCountriesData), 100))
}

export async function getMerchantsAction() {
  return new Promise((resolve) => setTimeout(() => resolve(mockMerchantsData), 100))
}
