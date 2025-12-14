import { requireRole } from '@/lib/guards';

export default async function StaffPage() {
  const user = await requireRole('STAFF', '/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Staff Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600">
          This page is accessible to staff members and administrators.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-neutral-900">
          Welcome, {user.name || user.email}!
        </h2>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-purple-50 p-6">
        <h3 className="text-base font-semibold text-purple-900">Staff Features</h3>
        <p className="mt-2 text-sm text-purple-700">
          This page is protected and requires at least STAFF role. Thanks to the role hierarchy,
          administrators can also access this page.
        </p>
      </div>
    </div>
  );
}
