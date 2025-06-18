import { redirect } from "next/navigation"

/**
 * Root page of the application.
 * Redirects users to the main risk profiles management page.
 */
export default function HomePage() {
  redirect("/admin/risk-profiles")
}
