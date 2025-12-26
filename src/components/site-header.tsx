"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/moderator": "Staff Area",
  "/admin": "Admin Overview",
  "/admin/bookings": "Pending Approval",
  "/admin/bookings/quotes": "Quote Requests",
  "/admin/bookings/all": "All Bookings",
  "/admin/products": "Manage Products",
  "/admin/corporate-orgs": "Organizations",
  "/admin/corporate-packages": "Corporate Packages",
  "/settings": "Settings",
}

export function SiteHeader() {
  const pathname = usePathname()
  
  // Get page title from path
  let title = "Dashboard"
  for (const [path, name] of Object.entries(pageTitles)) {
    if (pathname === path || pathname?.startsWith(path + "/")) {
      title = name
      break
    }
  }
  
  // Special case for booking details
  if (pathname?.match(/\/bookings\/[^/]+$/)) {
    title = "Booking Details"
  }
  
  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
