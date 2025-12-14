import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductForm from '../../ProductForm';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireRole('ADMIN', '/dashboard');

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  const initialData = {
    name: product.name,
    description: product.description || '',
    price: product.price.toString(),
    duration: product.duration.toString(),
    isActive: product.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <span>Edit Product</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
        <p className="mt-2 text-sm text-neutral-600">Update the details of {product.name}.</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <ProductForm mode="edit" productId={product.id} initialData={initialData} />
      </div>
    </div>
  );
}
