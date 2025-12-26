import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionCards />
      
      <div className="px-0 lg:px-0">
        <ChartAreaInteractive />
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/products"
              className="rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <h3 className="font-medium">Browse Products</h3>
              <p className="text-sm text-muted-foreground">View available services and book</p>
            </Link>
            <Link 
              href="/bookings"
              className="rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <h3 className="font-medium">My Bookings</h3>
              <p className="text-sm text-muted-foreground">View and manage your bookings</p>
            </Link>
            <Link 
              href="/settings"
              className="rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <h3 className="font-medium">Settings</h3>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

