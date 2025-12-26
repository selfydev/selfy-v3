import { Skeleton } from '@/components/ui/skeleton';

export default function BookingDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Header */}
          <div className="rounded-lg bg-card p-6 shadow">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-5 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="rounded-lg bg-card p-6 shadow">
            <Skeleton className="h-6 w-24" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg bg-card p-6 shadow">
            <Skeleton className="h-6 w-24" />
            <div className="mt-4 space-y-3">
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-4 w-40" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 shadow">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

