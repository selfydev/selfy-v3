'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { BookingSummary } from './BookingSummary';
import { PackageSelectionStep } from './steps/PackageSelectionStep';
import { AddOnsSelectionStep } from './steps/AddOnsSelectionStep';
import { DateTimeSelectionStep } from './steps/DateTimeSelectionStep';
import { EventDetailsStep } from './steps/EventDetailsStep';
import { CorporateBookingOptionsStep } from './steps/CorporateBookingOptionsStep';
import { BookingReviewStep } from './steps/BookingReviewStep';
import { PaymentStep } from './steps/PaymentStep';

interface CorporatePackage {
  id: string;
  name: string;
  totalCredits: number;
  usedCredits: number;
  permanentDiscountPercent: number;
}

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface BookingFlowProps {
  productId: string;
  product: Product;
  basePrice: number;
  discountedPrice: number;
  orgId?: string;
  packages?: CorporatePackage[];
  addOns?: AddOn[];
  isCorporateUser: boolean;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

type BookingStep = 'package' | 'addons' | 'datetime' | 'corporate' | 'details' | 'review' | 'payment';

interface BookingFormData {
  selectedPackageId?: string;
  selectedAddOns: Array<{ id: string; quantity: number }>;
  scheduledDate?: string;
  scheduledTime?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  eventAddress?: string;
  eventType?: string;
  eventNotes?: string;
  hasPowerSupply?: boolean;
  hasParking?: boolean;
  attendeeCount?: number;
  referralSource?: string;
  poNumber?: string;
  costCentre?: string;
  // Corporate options
  isMultiDay?: boolean;
  multiDayDates?: string[];
  isRecurring?: boolean;
  recurringRule?: string;
  recurringEndDate?: string;
  isBulkBooking?: boolean;
  bulkLocations?: Array<{ address: string; date: string; time: string }>;
  holdSlot?: boolean;
  requestQuote?: boolean;
}

export function BookingFlow({
  productId,
  product,
  basePrice,
  discountedPrice,
  orgId,
  packages = [],
  addOns = [],
  isCorporateUser,
  userEmail,
  userName,
  userPhone,
}: BookingFlowProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('package');
  const [_isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    selectedAddOns: [],
    // Smart defaults
    contactEmail: userEmail,
    contactName: userName,
    contactPhone: userPhone,
    hasPowerSupply: false,
    hasParking: false,
  });

  // Auto-save draft (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep !== 'review' && (formData.scheduledDate || formData.contactName)) {
        // Only auto-save if user has started filling the form
        autoSaveDraft();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  const autoSaveDraft = async () => {
    if (isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      const response = await fetch('/api/bookings/draft', {
        method: draftId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId,
          productId,
          ...formData,
          isDraft: true,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.booking?.id && !draftId) {
          setDraftId(result.booking.id);
        }
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsSavingDraft(false);
    }
  };

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const calculatePrice = () => {
    let total = discountedPrice;
    formData.selectedAddOns.forEach((selection) => {
      const addOn = addOns.find((a) => a.id === selection.id);
      if (addOn) total += addOn.price * selection.quantity;
    });
    if (formData.selectedPackageId) {
      const pkg = packages.find((p) => p.id === formData.selectedPackageId);
      if (pkg && pkg.permanentDiscountPercent > 0) {
        total = total * (1 - pkg.permanentDiscountPercent / 100);
      }
    }
    return total;
  };

  const finalPrice = calculatePrice();

  const handleNext = () => {
  const steps: BookingStep[] = isCorporateUser ? ['package', 'addons', 'datetime', 'corporate', 'details', 'review'] : ['package', 'addons', 'datetime', 'details', 'review', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = isCorporateUser ? ['package', 'addons', 'datetime', 'corporate', 'details', 'review'] : ['package', 'addons', 'datetime', 'details', 'review', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const scheduledAt = formData.scheduledDate && formData.scheduledTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        : null;

      if (!scheduledAt) {
        showError('Please select date and time', 3000);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          scheduledAt: scheduledAt.toISOString(),
          packageId: formData.selectedPackageId,
          addOns: formData.selectedAddOns,
          isMultiDay: formData.isMultiDay,
          multiDayDates: formData.multiDayDates,
          isRecurring: formData.isRecurring,
          recurringRule: formData.recurringRule,
          recurringEndDate: formData.recurringEndDate,
          isBulkBooking: formData.isBulkBooking,
          bulkLocations: formData.bulkLocations,
          holdSlot: formData.holdSlot,
          requestQuote: formData.requestQuote,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          eventAddress: formData.eventAddress,
          eventType: formData.eventType,
          eventNotes: formData.eventNotes,
          hasPowerSupply: formData.hasPowerSupply,
          hasParking: formData.hasParking,
          attendeeCount: formData.attendeeCount,
          referralSource: formData.referralSource,
          poNumber: formData.poNumber,
          costCentre: formData.costCentre,
          orgId,
          finalPrice,
          isDraft: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();
      
      // Handle different booking types
      if (data.bookings && data.bookings.length > 1) {
        showSuccess(
          `${data.message || `${data.bookings.length} bookings created successfully!`} An admin will review and confirm availability shortly.`,
          5000
        );
        // For bulk bookings, navigate to first booking
        if (data.bookings && data.bookings.length > 0) {
          router.push(`/bookings/${data.bookings[0].id}`);
        } else {
          router.push('/bookings');
        }
        setIsLoading(false);
        return;
      }
      
      // For single booking, navigate to payment step (or booking page for corporate)
      const bookingId = data.booking?.id;
      if (bookingId) {
        setCreatedBookingId(bookingId);
        if (isCorporateUser) {
          // Corporate users skip payment - go to booking page
          if (formData.requestQuote) {
            showSuccess('Quote request submitted! An admin will review and approve your quote with payment terms.', 5000);
          } else {
            showSuccess('Booking request submitted! An admin will review and send an invoice shortly.', 5000);
          }
          router.push(`/bookings/${bookingId}`);
        } else {
          // Non-corporate users go to payment step
          showSuccess('Booking created! Please complete payment.', 3000);
          setCurrentStep('payment');
        }
        setIsLoading(false);
      } else {
        throw new Error('No booking ID received');
      }
    } catch (error) {
      console.error('Booking error:', error);
      showError(error instanceof Error ? error.message : 'Failed to create booking', 5000);
      setIsLoading(false);
    }
  };

  const steps: BookingStep[] = isCorporateUser ? ['package', 'addons', 'datetime', 'corporate', 'details', 'review'] : ['package', 'addons', 'datetime', 'details', 'review', 'payment'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="flex gap-8 lg:flex-row flex-col">
      {/* Main Content */}
      <div className="flex-1">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      index <= currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground capitalize hidden sm:block">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg bg-card p-6 shadow min-h-[400px]">
          {currentStep === 'package' && (
            <PackageSelectionStep
              packages={packages}
              selectedPackageId={formData.selectedPackageId}
              onSelect={(packageId) => {
                updateFormData({ selectedPackageId: packageId });
                setTimeout(handleNext, 300);
              }}
              onNext={handleNext}
            />
          )}

          {currentStep === 'addons' && (
            <AddOnsSelectionStep
              addOns={addOns}
              selectedAddOns={formData.selectedAddOns}
              onUpdate={(addOns) => updateFormData({ selectedAddOns: addOns })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'datetime' && (
            <DateTimeSelectionStep
              scheduledDate={formData.scheduledDate}
              scheduledTime={formData.scheduledTime}
              onUpdate={(date, time) => updateFormData({ scheduledDate: date, scheduledTime: time })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'corporate' && isCorporateUser && (
            <CorporateBookingOptionsStep
              formData={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}


          {currentStep === 'details' && (
            <EventDetailsStep
              formData={formData}
              onUpdate={updateFormData}
              isCorporateUser={isCorporateUser}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'review' && (
            <BookingReviewStep
              product={product}
              formData={formData}
              packages={packages}
              addOns={addOns}
              basePrice={basePrice}
              discountedPrice={discountedPrice}
              finalPrice={finalPrice}
              isCorporateUser={isCorporateUser}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={_isLoading}
            />
          )}
          {currentStep === 'payment' && createdBookingId && (
            <PaymentStep
              bookingId={createdBookingId}
              finalPrice={finalPrice}
              isCorporate={isCorporateUser}
              onBack={() => setCurrentStep('review')}
            />
          )}
      </div>

      </div>
      {/* Summary Sidebar */}
      <div className="lg:w-80 w-full">
        <BookingSummary
          product={product}
          formData={formData}
          packages={packages}
          addOns={addOns}
          basePrice={basePrice}
          discountedPrice={discountedPrice}
          finalPrice={finalPrice}
          isCorporateUser={isCorporateUser}
        />
        {isSavingDraft && (
          <div className="mt-4 text-xs text-foreground0 text-center">💾 Saving draft...</div>
        )}
      </div>
    </div>
  );
}
