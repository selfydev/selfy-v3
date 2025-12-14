'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  isActive: boolean;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
  mode: 'create' | 'edit';
}

export default function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: '',
      description: '',
      price: '',
      duration: '',
      isActive: true,
    }
  );
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `Failed to ${mode} product`);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${mode} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Product Name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., Classic Photo Booth Package"
        required
        fullWidth
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product..."
          rows={4}
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-base transition-all duration-200 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-neutral-400"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error-DEFAULT">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Price ($)"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          error={errors.price}
          placeholder="0.00"
          required
          fullWidth
        />

        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          error={errors.duration}
          placeholder="e.g., 120"
          required
          fullWidth
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
          Product is active (visible to customers)
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
}
