'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface PackageFormData {
  orgId: string;
  name: string;
  description: string;
  totalCredits: string;
  permanentDiscountPercent: string;
  expiresAt: string;
  isActive: boolean;
}

interface PackageFormProps {
  initialData?: PackageFormData;
  packageId?: string;
  mode: 'create' | 'edit';
  orgs: Array<{ id: string; name: string }>;
}

export default function PackageForm({ initialData, packageId, mode, orgs }: PackageFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PackageFormData>(
    initialData || {
      orgId: '',
      name: '',
      description: '',
      totalCredits: '',
      permanentDiscountPercent: '0',
      expiresAt: '',
      isActive: true,
    }
  );
  const [errors, setErrors] = useState<Partial<PackageFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<PackageFormData> = {};

    if (!formData.orgId) {
      newErrors.orgId = 'Organization is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Package name is required';
    }

    if (!formData.totalCredits || parseInt(formData.totalCredits) <= 0) {
      newErrors.totalCredits = 'Valid total credits is required';
    }

    const discount = parseFloat(formData.permanentDiscountPercent);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.permanentDiscountPercent = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url =
        mode === 'create'
          ? '/api/admin/corporate-packages'
          : `/api/admin/corporate-packages/${packageId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: formData.orgId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          totalCredits: parseInt(formData.totalCredits),
          permanentDiscountPercent: parseFloat(formData.permanentDiscountPercent),
          expiresAt: formData.expiresAt || null,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `Failed to ${mode} package`);
        return;
      }

      router.push('/admin/corporate-packages');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${mode} package`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="orgId" className="block text-sm font-medium text-neutral-700">
          Organization <span className="text-error-DEFAULT">*</span>
        </label>
        <select
          id="orgId"
          value={formData.orgId}
          onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
          disabled={mode === 'edit'}
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-base transition-all duration-200 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50"
        >
          <option value="">Select an organization...</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        {errors.orgId && <p className="mt-1 text-sm text-error-DEFAULT">{errors.orgId}</p>}
      </div>

      <Input
        label="Package Name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., Premium Annual Package"
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
          placeholder="Describe this package..."
          rows={3}
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-base transition-all duration-200 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-neutral-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Total Credits"
          type="number"
          min="1"
          value={formData.totalCredits}
          onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
          error={errors.totalCredits}
          placeholder="e.g., 50"
          required
          fullWidth
        />

        <Input
          label="Permanent Discount (%)"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={formData.permanentDiscountPercent}
          onChange={(e) => setFormData({ ...formData, permanentDiscountPercent: e.target.value })}
          error={errors.permanentDiscountPercent}
          helperText="Additional discount on top of organization discount"
          placeholder="0"
          fullWidth
        />
      </div>

      <Input
        label="Expiration Date (Optional)"
        type="date"
        value={formData.expiresAt}
        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
        helperText="Leave empty for no expiration"
        fullWidth
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
          Package is active (available for use)
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/corporate-packages')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {mode === 'create' ? 'Create Package' : 'Update Package'}
        </Button>
      </div>
    </form>
  );
}
