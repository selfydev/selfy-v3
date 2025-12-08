import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-neutral-200 bg-neutral-50">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <Link href="/" className="text-xl font-bold text-primary-600">
          Selfy
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <span>Dashboard</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <span>Analytics</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <span>Settings</span>
        </Link>
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-600"></div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900">User</p>
            <p className="text-xs text-neutral-500">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
