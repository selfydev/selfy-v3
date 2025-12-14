import { requireRole } from '@/lib/guards';
import ProductForm from '../ProductForm';
import Link from 'next/link';

export default async function NewProductPage() {
  await requireRole('ADMIN', '/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <span>New Product</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Create New Product</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Add a new photo booth product or service to your catalog.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
