'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TemplateSubmission {
  id: string;
  bookingNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  eventDate: string;
  submittedAt: string;
  templateId: string;
  thumbnailUrl?: string;
}

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/admin/templates');
        if (!res.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submitted Templates</h1>
        <p className="text-muted-foreground">
          View and manage all customer-submitted photo booth templates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Template Submissions</CardTitle>
          <CardDescription>
            {templates.length} template{templates.length !== 1 ? 's' : ''} submitted by customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">No templates submitted yet</p>
              <p className="text-sm text-muted-foreground">
                Templates will appear here once customers submit their designs
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        {template.thumbnailUrl ? (
                          <img
                            src={template.thumbnailUrl}
                            alt="Template preview"
                            className="h-12 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No preview</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/bookings/${template.bookingId}`}
                          className="font-medium hover:underline"
                        >
                          #{template.bookingNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.customerName}</div>
                          <div className="text-sm text-muted-foreground">{template.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{template.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(template.eventDate), 'PPP')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {format(new Date(template.submittedAt), 'PP')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/admin/templates/${template.templateId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View & Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/bookings/${template.bookingId}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
