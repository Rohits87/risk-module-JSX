import Sidebar from "@/components/admin/sidebar"
import { Toaster } from "react-hot-toast"

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "16px 24px" }}>{children}</main>
      <Toaster position="top-right" />
    </div>
  )
}
