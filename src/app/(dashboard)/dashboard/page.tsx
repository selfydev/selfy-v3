import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-6">
      {/* Page Header with User Info */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-neutral-600">Welcome back, {user.name || user.email}!</p>
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700">Your Profile</h3>
          <dl className="mt-2 space-y-2">
            {user.name && (
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-600">Name:</dt>
                <dd className="font-medium text-neutral-900">{user.name}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-600">Email:</dt>
              <dd className="font-medium text-neutral-900">{user.email}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-600">User ID:</dt>
              <dd className="font-mono text-xs text-neutral-700">{user.id}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-neutral-600">Total Users</div>
          <div className="mt-2 text-3xl font-semibold text-neutral-900">1,234</div>
          <div className="mt-2 text-sm text-success-DEFAULT">+12% from last month</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-neutral-600">Revenue</div>
          <div className="mt-2 text-3xl font-semibold text-neutral-900">$12,345</div>
          <div className="mt-2 text-sm text-success-DEFAULT">+8% from last month</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-neutral-600">Active Sessions</div>
          <div className="mt-2 text-3xl font-semibold text-neutral-900">567</div>
          <div className="mt-2 text-sm text-warning-DEFAULT">-3% from last month</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-neutral-600">Conversion Rate</div>
          <div className="mt-2 text-3xl font-semibold text-neutral-900">3.2%</div>
          <div className="mt-2 text-sm text-success-DEFAULT">+0.5% from last month</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary-100"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">New user registered</p>
                <p className="text-xs text-neutral-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-secondary-100"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Payment processed</p>
                <p className="text-xs text-neutral-600">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-success-light"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">System update completed</p>
                <p className="text-xs text-neutral-600">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
          <div className="mt-4 grid gap-3">
            <button className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
              Create New Project
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
              Invite Team Member
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
              View Reports
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="rounded-lg bg-success-light p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-success-DEFAULT"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-success-dark">
              Protected Dashboard - Authentication Active
            </h3>
            <p className="mt-1 text-sm text-success-dark">
              This dashboard is now protected with NextAuth. Users must be authenticated to access
              this page. Your session is active and your user data is loaded from the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
