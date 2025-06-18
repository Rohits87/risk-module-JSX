"use server"

import { mockCountries, mockMerchants, mockRiskProfiles } from "./data"

export async function getCountriesAction() {
  try {
    return new Promise((resolve) => setTimeout(() => resolve(mockCountries), 100))
  } catch (error) {
    console.error("Error fetching countries:", error)
    throw error
  }
}

export async function getMerchantsAction() {
  try {
    return new Promise((resolve) => setTimeout(() => resolve(mockMerchants), 100))
  } catch (error) {
    console.error("Error fetching merchants:", error)
    throw error
  }
}

export async function getRiskProfilesAction() {
  try {
    return new Promise((resolve) => setTimeout(() => resolve(mockRiskProfiles), 500))
  } catch (error) {
    console.error("Error fetching risk profiles:", error)
    throw error
  }
}
