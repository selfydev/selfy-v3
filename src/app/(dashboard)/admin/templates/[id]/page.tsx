'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, CheckCircle2, Eye, ExternalLink, Calendar, User } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

// Dynamically import the editor to avoid SSR issues with Fabric.js
const TemplateEditor = dynamic(
  () => import('@/components/editor/TemplateEditor').then((mod) => mod.TemplateEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    ),
  }
);

interface CanvasData {
  background?: string;
  objects?: Array<{
    type: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface Template {
  id: string;
  name: string;
  canvasData: CanvasData;
  thumbnailUrl?: string;
  booking: {
    id: string;
    bookingNumber: string;
    scheduledAt: string;
    templateSubmittedAt?: string;
    customer: {
      name: string;
      email: string;
    };
    product: {
      name: string;
    };
  };
}

export default function AdminTemplateViewPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch template
  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/admin/templates/${templateId}`);
        if (!res.ok) {
          throw new Error('Template not found');
        }
        const data = await res.json();
        setTemplate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplate();
  }, [templateId]);

  // Save template (admin can edit)
  const handleSave = useCallback(async (canvasData: CanvasData, thumbnailBase64: string) => {
    if (!template) return;

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasData,
          thumbnailBase64,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save template');
      }

      const updatedTemplate = await res.json();
      setTemplate(updatedTemplate);
      success('Template saved successfully!');
    } catch (err) {
      showError('Failed to save template. Please try again.');
      throw err;
    }
  }, [templateId, template, success, showError]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !template) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Template not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">View & Edit Template</h1>
            <p className="text-muted-foreground">
              Booking #{template.booking.bookingNumber} • {template.booking.product.name}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/bookings/${template.booking.id}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Booking
          </Link>
        </Button>
      </div>

      {/* Template Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Customer</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{template.booking.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{template.booking.customer.email}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Event Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(template.booking.scheduledAt), 'PPP')}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Submitted</div>
              <Badge variant="secondary">
                {template.booking.templateSubmittedAt
                  ? format(new Date(template.booking.templateSubmittedAt), 'PPP')
                  : 'N/A'}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
              <Badge variant="default">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Auto-Approved
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Template Design</CardTitle>
          <CardDescription>
            As an admin, you can view and edit this customer's template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Edit Mode</AlertTitle>
            <AlertDescription>
              You are viewing this template with full editing permissions. Any changes you make will be saved to the customer's template.
            </AlertDescription>
          </Alert>

          <TemplateEditor
            bookingId={template.booking.id}
            initialData={template.canvasData}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </div>
  );
}
