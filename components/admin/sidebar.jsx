"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Box } from "@mui/material"
import {
  Dashboard,
  People,
  Business,
  CreditCard,
  AccountTree,
  BarChart,
  SwapHoriz,
  Receipt,
  Folder,
  Refresh,
  Assessment,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material"
import { useState } from "react"
import Image from "next/image"

const sidebarNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Dashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart },
  {
    label: "User Access Management",
    icon: People,
    subItems: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/roles", label: "Roles" },
    ],
  },
  {
    label: "Merchant Management",
    icon: Business,
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
      { href: "/admin/risk-profiles", label: "Risk Profiles" },
      { href: "/admin/pg-settings", label: "Gateway Settings" },
    ],
  },
  {
    label: "Audit Trail",
    icon: AccountTree,
    subItems: [
      { href: "/admin/audit/system", label: "System Logs" },
      { href: "/admin/audit/user", label: "User Actions" },
    ],
  },
  { href: "/admin/aggregator-management", label: "Aggregator Management", icon: People },
  { href: "/admin/reseller-management", label: "Reseller Management", icon: People },
  { href: "/admin/transaction-management", label: "Transaction Management", icon: SwapHoriz },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: Receipt },
  {
    label: "POS File Management",
    icon: Folder,
    subItems: [
      { href: "/admin/pos/uploads", label: "Uploads" },
      { href: "/admin/pos/history", label: "History" },
    ],
  },
  { href: "/admin/refund-management", label: "Refund Management", icon: Refresh },
  { href: "/admin/reports", label: "Reports", icon: Assessment },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState({})

  const handleToggle = (label) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const isActive = (item) => {
    if (item.href) return pathname === item.href
    if (item.isActiveRoot) return pathname.startsWith(item.isActiveRoot)
    return item.subItems?.some((sub) => pathname.startsWith(sub.href))
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 256,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 256,
          boxSizing: "border-box",
          backgroundColor: "#1f2937",
          color: "white",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Image src="/touras-logo.png" alt="Touras Logo" width={100} height={28} />
      </Box>
      <List>
        {sidebarNavItems.map((item) => (
          <div key={item.label}>
            {item.subItems ? (
              <>
                <ListItemButton
                  onClick={() => handleToggle(item.label)}
                  sx={{
                    color: isActive(item) ? "#ef4444" : "#d1d5db",
                    backgroundColor: isActive(item) ? "rgba(239, 68, 68, 0.1)" : "transparent",
                    "&:hover": {
                      backgroundColor: "#374151",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {openItems[item.label] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openItems[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.label}
                        component={Link}
                        href={subItem.href}
                        sx={{
                          pl: 4,
                          color: pathname === subItem.href ? "#ef4444" : "#d1d5db",
                          backgroundColor: pathname === subItem.href ? "rgba(239, 68, 68, 0.2)" : "transparent",
                          "&:hover": {
                            backgroundColor: "#374151",
                          },
                        }}
                      >
                        <ListItemText primary={subItem.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  color: pathname === item.href ? "#ef4444" : "#d1d5db",
                  backgroundColor: pathname === item.href ? "rgba(239, 68, 68, 0.1)" : "transparent",
                  "&:hover": {
                    backgroundColor: "#374151",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )}
          </div>
        ))}
      </List>
    </Drawer>
  )
}
