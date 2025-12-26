'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        maxSeats: parseInt(formData.maxSeats),
        discountPercent: parseFloat(formData.discountPercent),
        isActive: formData.isActive,
      };

      if (mode === 'create') {
        body['ownerId'] = formData.ownerId;
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
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Acme Corporation"
          required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="ownerId">Owner <span className="text-destructive">*</span></Label>
          <select
            id="ownerId"
            value={formData.ownerId}
            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
          >
            <option value="">Select an owner...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
          {errors.ownerId && <p className="text-sm text-destructive">{errors.ownerId}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxSeats">Max Seats <span className="text-destructive">*</span></Label>
          <Input
            id="maxSeats"
            type="number"
            min="1"
            value={formData.maxSeats}
            onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
            placeholder="10"
            required
          />
          <p className="text-sm text-muted-foreground">Maximum number of members</p>
          {errors.maxSeats && <p className="text-sm text-destructive">{errors.maxSeats}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountPercent">Organization Discount (%)</Label>
          <Input
            id="discountPercent"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.discountPercent}
            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
            placeholder="0"
          />
          <p className="text-sm text-muted-foreground">Base discount for all members</p>
          {errors.discountPercent && <p className="text-sm text-destructive">{errors.discountPercent}</p>}
        </div>
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
          Organization is active
        </Label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/corporate-orgs')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={isSubmitting} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Organization' : 'Update Organization'}
        </Button>
      </div>
    </form>
  );
}
