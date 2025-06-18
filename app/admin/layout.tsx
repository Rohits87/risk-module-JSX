import type React from "react"
import Sidebar from "@/components/admin/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      <Toaster />
    </div>
  )
}
