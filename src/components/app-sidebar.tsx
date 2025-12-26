"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import {
  IconChartBar,
  IconClipboardList,
  IconClock,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconLogout,
  IconPackage,
  IconBuilding,
  IconSettings,
  IconShoppingBag,
  IconUsers,
  IconCheck,
  IconCreditCard,
  IconUserCircle,
  IconDotsVertical,
  IconNotification,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface AdminCounts {
  pendingBookings: number;
  quoteRequests: number;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const { isMobile } = useSidebar()
  
  const [adminCounts, setAdminCounts] = React.useState<AdminCounts>({
    pendingBookings: 0,
    quoteRequests: 0,
  })

  React.useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      fetch('/api/admin/dashboard-counts')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setAdminCounts(data)
          }
        })
        .catch(() => {})
    }
  }, [user?.role])

  const totalPending = adminCounts.pendingBookings + adminCounts.quoteRequests

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Products",
      url: "/products",
      icon: IconShoppingBag,
      isActive: pathname === "/products" || pathname?.startsWith("/products/"),
    },
    ...(user?.role === 'STAFF' || user?.role === 'ADMIN'
      ? [{ 
          title: "Staff Area", 
          url: "/moderator", 
          icon: IconUsers,
          isActive: pathname === "/moderator",
        }]
      : []),
  ]

  const navAdmin = [
    { 
      title: "Overview", 
      url: "/admin", 
      icon: IconClipboardList,
      isActive: pathname === "/admin",
    },
    {
      title: "Pending Approval",
      url: "/admin/bookings",
      icon: IconClock,
      isActive: pathname === "/admin/bookings",
      badge: adminCounts.pendingBookings,
    },
    {
      title: "Quote Requests",
      url: "/admin/bookings/quotes",
      icon: IconFileDescription,
      isActive: pathname === "/admin/bookings/quotes",
      badge: adminCounts.quoteRequests,
    },
    { 
      title: "All Bookings", 
      url: "/admin/bookings/all", 
      icon: IconCheck,
      isActive: pathname === "/admin/bookings/all",
    },
  ]

  const navCatalog = [
    { 
      title: "Products", 
      url: "/admin/products", 
      icon: IconPackage,
      isActive: pathname?.startsWith("/admin/products"),
    },
    { 
      title: "Organizations", 
      url: "/admin/corporate-orgs", 
      icon: IconBuilding,
      isActive: pathname?.startsWith("/admin/corporate-orgs"),
    },
    { 
      title: "Packages", 
      url: "/admin/corporate-packages", 
      icon: IconPackage,
      isActive: pathname?.startsWith("/admin/corporate-packages"),
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Selfy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <NavMain items={navMain} />
        
        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Admin
              {totalPending > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {totalPending}
                </span>
              )}
            </SidebarGroupLabel>
            <SidebarMenu>
              {navAdmin.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge !== undefined && item.badge > 0 && (
                    <SidebarMenuBadge>
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Catalog Section */}
        {user?.role === 'ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>Catalog</SidebarGroupLabel>
            <SidebarMenu>
              {navCatalog.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name || 'User'}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                  <IconDotsVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name || 'User'}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <IconUserCircle className="size-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">
                      <IconCreditCard className="size-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/notifications">
                      <IconNotification className="size-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <IconLogout className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
