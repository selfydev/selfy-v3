import { NavItem } from '@/types/nav';

/**
 * Navigation configuration for the Selfy dashboard
 * 
 * Badge support:
 * - badge: number - Shows a badge with the count
 * - badgeVariant: 'default' | 'destructive' | 'warning' - Badge color
 * 
 * Role-based access:
 * - roles: string[] - Only show to users with these roles
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    items: [],
  },
  {
    title: 'Products',
    url: '/products',
    icon: 'shoppingBag',
    isActive: false,
    items: [],
  },
  {
    title: 'Staff Area',
    url: '/moderator',
    icon: 'teams',
    isActive: false,
    items: [],
    roles: ['STAFF', 'ADMIN'],
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: 'Overview',
    url: '/admin',
    icon: 'clipboard',
    isActive: false,
    items: [],
  },
  {
    title: 'Pending Approval',
    url: '/admin/bookings',
    icon: 'clock',
    isActive: false,
    items: [],
  },
  {
    title: 'Quote Requests',
    url: '/admin/bookings/quotes',
    icon: 'post',
    isActive: false,
    items: [],
  },
  {
    title: 'All Bookings',
    url: '/admin/bookings/all',
    icon: 'checkCircle',
    isActive: false,
    items: [],
  },
];

export const catalogNavItems: NavItem[] = [
  {
    title: 'Products',
    url: '/admin/products',
    icon: 'package',
    isActive: false,
    items: [],
  },
  {
    title: 'Organizations',
    url: '/admin/corporate-orgs',
    icon: 'building',
    isActive: false,
    items: [],
  },
  {
    title: 'Packages',
    url: '/admin/corporate-packages',
    icon: 'package',
    isActive: false,
    items: [],
  },
];

