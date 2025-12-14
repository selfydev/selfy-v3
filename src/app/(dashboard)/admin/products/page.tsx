import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductListClient from './ProductListClient';

export default async function AdminProductsPage() {
  await requireRole('ADMIN', '/dashboard');

  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Product Management</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage your photo booth products and services.
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-base font-medium text-white transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            <svg
              className="mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow">
        <ProductListClient initialProducts={products} />
      </div>
    </div>
  );
}
