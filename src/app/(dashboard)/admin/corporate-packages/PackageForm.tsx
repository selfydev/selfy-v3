'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2">
        <Label htmlFor="orgId">
          Organization <span className="text-destructive">*</span>
        </Label>
        <select
          id="orgId"
          value={formData.orgId}
          onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
          disabled={mode === 'edit'}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select an organization...</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        {errors.orgId && <p className="text-sm text-destructive">{errors.orgId}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Package Name <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Premium Annual Package"
          required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this package..."
          rows={3}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalCredits">Total Credits <span className="text-destructive">*</span></Label>
          <Input
            id="totalCredits"
            type="number"
            min="1"
            value={formData.totalCredits}
            onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
            placeholder="e.g., 50"
            required
          />
          {errors.totalCredits && <p className="text-sm text-destructive">{errors.totalCredits}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="permanentDiscountPercent">Permanent Discount (%)</Label>
          <Input
            id="permanentDiscountPercent"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.permanentDiscountPercent}
            onChange={(e) => setFormData({ ...formData, permanentDiscountPercent: e.target.value })}
            placeholder="0"
          />
          <p className="text-sm text-muted-foreground">Additional discount on top of organization discount</p>
          {errors.permanentDiscountPercent && <p className="text-sm text-destructive">{errors.permanentDiscountPercent}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
        <Input
          id="expiresAt"
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Leave empty for no expiration</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
        />
        <Label htmlFor="isActive" className="font-normal">
          Package is active (available for use)
        </Label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/corporate-packages')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {mode === 'create' ? 'Create Package' : 'Update Package'}
        </Button>
      </div>
    </form>
  );
}
