"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  GitBranch,
  BarChart3,
  ArrowLeftRight,
  Receipt,
  FileBox,
  RotateCcw,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"

const sidebarNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  {
    label: "User Access Management",
    icon: Users,
    subItems: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/roles", label: "Roles" },
    ],
  },
  {
    label: "Merchant Management",
    icon: Briefcase,
    subItems: [
      { href: "/admin/merchants", label: "All Merchants" },
      { href: "/admin/merchants/new", label: "Add Merchant" },
    ],
  },
  {
    label: "PG Management",
    icon: CreditCard,
    isActiveRoot: "/admin/risk-profiles",
    subItems: [
      // Highlight Risk Profiles under PG Management
      { href: "/admin/risk-profiles", label: "Risk Profiles" },
      { href: "/admin/pg-settings", label: "Gateway Settings" },
    ],
  },
  {
    label: "Audit Trail",
    icon: GitBranch,
    subItems: [
      { href: "/admin/audit/system", label: "System Logs" },
      { href: "/admin/audit/user", label: "User Actions" },
    ],
  },
  { href: "/admin/aggregator-management", label: "Aggregator Management", icon: Users },
  { href: "/admin/reseller-management", label: "Reseller Management", icon: Users },
  { href: "/admin/transaction-management", label: "Transaction Management", icon: ArrowLeftRight },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: Receipt },
  {
    label: "POS File Management",
    icon: FileBox,
    subItems: [
      { href: "/admin/pos/uploads", label: "Uploads" },
      { href: "/admin/pos/history", label: "History" },
    ],
  },
  { href: "/admin/refund-management", label: "Refund Management", icon: RotateCcw },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 space-y-6 hidden md:block print:hidden">
      <div className="px-2 py-1">
        <Image src="/touras-logo.png" alt="Touras Logo" width={100} height={28} />
      </div>
      <nav>
        <Accordion type="multiple" className="w-full">
          {sidebarNavItems.map((item) =>
            item.subItems ? (
              <AccordionItem value={item.label} key={item.label} className="border-b-0">
                <AccordionTrigger
                  className={cn(
                    "flex items-center space-x-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white w-full justify-start",
                    (item.isActiveRoot && pathname.startsWith(item.isActiveRoot)) ||
                      item.subItems.some((sub) => pathname.startsWith(sub.href))
                      ? "bg-primary/20 text-primary-foreground"
                      : "text-gray-300",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <ul className="space-y-1 pt-1 pl-4">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white",
                            pathname === subItem.href ? "bg-primary text-primary-foreground" : "text-gray-300",
                          )}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-300",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ),
          )}
        </Accordion>
      </nav>
    </aside>
  )
}
