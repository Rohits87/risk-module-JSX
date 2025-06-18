import { redirect } from "next/navigation"

/**
 * Root page for the /admin route.
 * Redirects users to the main risk profiles management page.
 */
export default function AdminRootPage() {
  redirect("/admin/risk-profiles")
}
