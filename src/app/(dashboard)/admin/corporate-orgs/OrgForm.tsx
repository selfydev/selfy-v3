'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface OrgFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  maxSeats: string;
  discountPercent: string;
  ownerId: string;
  isActive: boolean;
}

interface OrgFormProps {
  initialData?: OrgFormData;
  orgId?: string;
  mode: 'create' | 'edit';
  users: Array<{ id: string; name: string | null; email: string }>;
}

export default function OrgForm({ initialData, orgId, mode, users }: OrgFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OrgFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
      maxSeats: '10',
      discountPercent: '0',
      ownerId: '',
      isActive: true,
    }
  );
  const [errors, setErrors] = useState<Partial<OrgFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<OrgFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (mode === 'create' && !formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
    }

    if (!formData.maxSeats || parseInt(formData.maxSeats) <= 0) {
      newErrors.maxSeats = 'Valid max seats is required';
    }

    const discount = parseFloat(formData.discountPercent);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.discountPercent = 'Discount must be between 0 and 100';
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
        mode === 'create' ? '/api/admin/corporate-orgs' : `/api/admin/corporate-orgs/${orgId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const body: any = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        maxSeats: parseInt(formData.maxSeats),
        discountPercent: parseFloat(formData.discountPercent),
        isActive: formData.isActive,
      };

      if (mode === 'create') {
        body.ownerId = formData.ownerId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `Failed to ${mode} organization`);
        return;
      }

      router.push('/admin/corporate-orgs');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${mode} organization`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Organization Name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., Acme Corporation"
        required
        fullWidth
      />

      {mode === 'create' && (
        <div>
          <label htmlFor="ownerId" className="block text-sm font-medium text-neutral-700">
            Owner <span className="text-error-DEFAULT">*</span>
          </label>
          <select
            id="ownerId"
            value={formData.ownerId}
            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 text-base transition-all duration-200 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-neutral-400"
          >
            <option value="">Select an owner...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
          {errors.ownerId && <p className="mt-1 text-sm text-error-DEFAULT">{errors.ownerId}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contact@example.com"
          fullWidth
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
          fullWidth
        />
      </div>

      <Input
        label="Address"
        type="text"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="123 Main St, City, State 12345"
        fullWidth
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Max Seats"
          type="number"
          min="1"
          value={formData.maxSeats}
          onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
          error={errors.maxSeats}
          helperText="Maximum number of members"
          placeholder="10"
          required
          fullWidth
        />

        <Input
          label="Organization Discount (%)"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={formData.discountPercent}
          onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
          error={errors.discountPercent}
          helperText="Base discount for all members"
          placeholder="0"
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
          Organization is active
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/corporate-orgs')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {mode === 'create' ? 'Create Organization' : 'Update Organization'}
        </Button>
      </div>
    </form>
  );
}
