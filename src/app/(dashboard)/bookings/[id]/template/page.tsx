'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, CheckCircle2, Palette, Upload, FileImage } from 'lucide-react';
import { StarterTemplates, STARTER_TEMPLATES } from '@/components/editor/StarterTemplates';
import { useToast } from '@/components/ui/toast';
import { Canvas, FabricImage } from 'fabric';

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

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledAt: string;
  product: {
    name: string;
  };
}

interface CanvasData {
  background?: string;
  objects?: Array<{
    type: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface ExistingTemplate {
  id: string;
  name: string;
  canvasData: CanvasData;
  thumbnailUrl?: string;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { success, error: showError } = useToast();

  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [existingTemplate, setExistingTemplate] = useState<ExistingTemplate | null>(null);
  const [selectedStarterTemplate, setSelectedStarterTemplate] = useState<typeof STARTER_TEMPLATES[0] | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch booking and existing template
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch booking
        const bookingRes = await fetch(`/api/bookings?id=${bookingId}`);
        if (!bookingRes.ok) {
          throw new Error('Booking not found');
        }
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        // Check if booking is confirmed
        if (bookingData.status !== 'CONFIRMED') {
          setError('Your booking must be confirmed before you can create a template.');
          setIsLoading(false);
          return;
        }

        // Fetch existing template
        const templateRes = await fetch(`/api/design-templates?bookingId=${bookingId}`);
        if (templateRes.ok) {
          const templateData = await templateRes.json();
          if (templateData) {
            setExistingTemplate(templateData);
            setStep('edit'); // Go directly to edit if template exists
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus === 'authenticated') {
      fetchData();
    }
  }, [bookingId, sessionStatus]);

  // Handle starter template selection
  const handleStarterSelect = useCallback((template: typeof STARTER_TEMPLATES[0]) => {
    setSelectedStarterTemplate(template);
  }, []);

  // Start editing with selected template
  const handleStartEditing = useCallback(() => {
    if (selectedStarterTemplate || uploadedImageData) {
      setStep('edit');
    }
  }, [selectedStarterTemplate, uploadedImageData]);

  // Handle image upload with validation
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);
    setUploadedImageData(null);

    // Validation 1: File type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PNG, JPG, or JPEG image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validation 2: File size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum file size is 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read and validate image dimensions
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();

      img.onload = () => {
        // Validation 3: Dimensions check
        const CANVAS_WIDTH = 800;
        const CANVAS_HEIGHT = 600;

        // Create canvas data from the uploaded image
        const canvasData = {
          version: '6.0.0',
          objects: [
            {
              type: 'image',
              left: CANVAS_WIDTH / 2,
              top: CANVAS_HEIGHT / 2,
              originX: 'center',
              originY: 'center',
              scaleX: Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height),
              scaleY: Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height),
              src: dataUrl,
            }
          ],
          background: '#ffffff',
        };

        setUploadedImageData(canvasData);
        setSelectedStarterTemplate(null); // Clear starter template selection
        success('Image uploaded successfully! Click "Continue" to start editing.');
      };

      img.onerror = () => {
        setUploadError('Failed to load image. Please try a different file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  }, [success]);

  // Save template
  const handleSave = useCallback(async (canvasData: CanvasData, thumbnailBase64: string) => {
    try {
      const res = await fetch('/api/design-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          name: `Template for ${booking?.bookingNumber}`,
          canvasData,
          thumbnailBase64,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save template');
      }

      const savedTemplate = await res.json();
      setExistingTemplate(savedTemplate);
      success('Template saved successfully!');
    } catch (err) {
      showError('Failed to save template. Please try again.');
      throw err;
    }
  }, [bookingId, booking, success, showError]);

  // Loading state
  if (isLoading || sessionStatus === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href={`/bookings/${bookingId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Booking
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Create Template</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get initial canvas data
  const initialCanvasData = existingTemplate?.canvasData || uploadedImageData || selectedStarterTemplate?.canvasData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {step === 'edit' && !existingTemplate ? (
            <Button
              variant="ghost"
              onClick={() => {
                setStep('select');
                setSelectedStarterTemplate(null);
                setUploadedImageData(null);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href={`/bookings/${bookingId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {existingTemplate ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-muted-foreground">
              Booking #{booking?.bookingNumber} • {booking?.product.name}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Template Notice */}
      {existingTemplate && step === 'edit' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Template Saved</AlertTitle>
          <AlertDescription>
            Your template was last saved. Any changes will update your existing template.
          </AlertDescription>
        </Alert>
      )}

      {/* Step: Select Template */}
      {step === 'select' && !existingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Choose Your Template
            </CardTitle>
            <CardDescription>
              Select a starter template, upload your own design, or start from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="starter" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="starter" onClick={() => setUploadedImageData(null)}>
                  <Palette className="mr-2 h-4 w-4" />
                  Starter Templates
                </TabsTrigger>
                <TabsTrigger value="upload" onClick={() => setSelectedStarterTemplate(null)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your Own
                </TabsTrigger>
              </TabsList>

              <TabsContent value="starter" className="mt-6">
                <StarterTemplates
                  onSelect={handleStarterSelect}
                  selectedId={selectedStarterTemplate?.id}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <div className="space-y-4">
                  {/* Upload Instructions */}
                  <Alert>
                    <FileImage className="h-4 w-4" />
                    <AlertTitle>Upload Guidelines</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>Your template image must meet the following requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>File type:</strong> PNG, JPG, or JPEG only</li>
                        <li><strong>File size:</strong> Maximum 5MB</li>
                        <li><strong>Recommended dimensions:</strong> 800×600 pixels (4:3 aspect ratio)</li>
                        <li>Images will be automatically scaled to fit the canvas</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  {/* Upload Error */}
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Upload Failed</AlertTitle>
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Upload Success */}
                  {uploadedImageData && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Upload Successful</AlertTitle>
                      <AlertDescription>
                        Your image has been uploaded and is ready to edit. Click "Continue" below.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Upload Button */}
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-12">
                    <FileImage className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Upload Your Template</h3>
                    <p className="mb-4 text-center text-sm text-muted-foreground">
                      Click below to select an image from your device
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStarterTemplate(null);
                  setUploadedImageData(null);
                  setStep('edit');
                }}
              >
                Start from Scratch
              </Button>
              <Button
                onClick={handleStartEditing}
                disabled={!selectedStarterTemplate && !uploadedImageData}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Edit Template */}
      {step === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>Design Your Overlay</CardTitle>
            <CardDescription>
              Add text, images, and shapes to create your perfect photo booth frame
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateEditor
              bookingId={bookingId}
              initialData={initialCanvasData}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

