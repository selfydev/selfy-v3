'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  _count: {
    bookings: number;
  };
}

interface ProductListClientProps {
  initialProducts: Product[];
}

export default function ProductListClient({ initialProducts }: ProductListClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredProducts = products.filter((product) => {
    if (filter === 'active') return product.isActive;
    if (filter === 'inactive') return !product.isActive;
    return true;
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete product');
        return;
      }

      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !product.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update product');
        return;
      }

      setProducts(products.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
      router.refresh();
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Failed to update product');
    }
  };

  return (
    <>
      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Active ({products.filter((p) => p.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Inactive ({products.filter((p) => !p.isActive).length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-border bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-foreground0">
                  No products found. Create your first product to get started.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-background">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-foreground">{product.name}</div>
                      {product.description && (
                        <div className="mt-1 text-sm text-foreground0">
                          {product.description.length > 60
                            ? `${product.description.substring(0, 60)}...`
                            : product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{product.duration} min</td>
                  <td className="px-6 py-4 text-sm text-foreground">{product._count.bookings}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.isActive
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-primary hover:text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete Product</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {productToDelete && (
            <div>
              <p className="text-foreground">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>?
              </p>
              {productToDelete._count.bookings > 0 && (
                <div className="mt-4 rounded-lg bg-error-DEFAULT/10 p-4">
                  <p className="text-sm text-destructive">
                    This product has {productToDelete._count.bookings} existing booking(s). It
                    cannot be deleted. Consider deactivating it instead.
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            isLoading={isDeleting}
            disabled={isDeleting || !!(productToDelete && productToDelete._count.bookings > 0)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
