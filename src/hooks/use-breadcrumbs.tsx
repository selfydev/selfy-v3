'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// Custom route mappings for better titles
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/products': [{ title: 'Products', link: '/products' }],
  '/admin': [{ title: 'Admin', link: '/admin' }],
  '/admin/bookings': [
    { title: 'Admin', link: '/admin' },
    { title: 'Pending Approval', link: '/admin/bookings' },
  ],
  '/admin/bookings/quotes': [
    { title: 'Admin', link: '/admin' },
    { title: 'Quote Requests', link: '/admin/bookings/quotes' },
  ],
  '/admin/bookings/all': [
    { title: 'Admin', link: '/admin' },
    { title: 'All Bookings', link: '/admin/bookings/all' },
  ],
  '/admin/products': [
    { title: 'Admin', link: '/admin' },
    { title: 'Products', link: '/admin/products' },
  ],
  '/admin/corporate-orgs': [
    { title: 'Admin', link: '/admin' },
    { title: 'Organizations', link: '/admin/corporate-orgs' },
  ],
  '/admin/corporate-packages': [
    { title: 'Admin', link: '/admin' },
    { title: 'Packages', link: '/admin/corporate-packages' },
  ],
  '/moderator': [{ title: 'Staff Area', link: '/moderator' }],
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (pathname && routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      // Capitalize and clean up the segment
      const title = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return {
        title,
        link: path,
      };
    });
  }, [pathname]);

  return breadcrumbs;
}

