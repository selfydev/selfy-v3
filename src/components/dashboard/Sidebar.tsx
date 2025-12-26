'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const isActive = (path: string) => {
    return pathname === path
      ? 'bg-primary-100 text-primary-700'
      : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900';
  };

  // Define navigation based on user role
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Products', href: '/products' },
    ];

    if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
      baseNav.push({ name: 'Staff Area', href: '/moderator' });
    }

    if (user?.role === 'ADMIN') {
      baseNav.push({ name: 'Admin Panel', href: '/admin' });
    }

    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <aside className="flex w-64 flex-col border-r border-neutral-200 bg-neutral-50">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <Link href="/" className="text-xl font-bold text-primary-600">
          Selfy
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${isActive(item.href)}`}
          >
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900">{user?.name || 'User'}</p>
            <p className="text-xs text-neutral-500">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
