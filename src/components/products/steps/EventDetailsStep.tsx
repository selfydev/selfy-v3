'use client';

interface EventDetailsStepProps {
  formData: {
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
    vatRate?: number;
  };
  onUpdate: (updates: Partial<EventDetailsStepProps['formData']>) => void;
  isCorporateUser: boolean;
  onNext: () => void;
  onBack: () => void;
}

const EVENT_TYPES = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate Event' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'GRADUATION', label: 'Graduation' },
  { value: 'HOLIDAY', label: 'Holiday Party' },
  { value: 'OTHER', label: 'Other' },
];

const REFERRAL_SOURCES = [
  { value: 'GOOGLE', label: 'Google Search' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FRIEND', label: 'Friend/Family' },
  { value: 'PREVIOUS_CLIENT', label: 'Previous Client' },
  { value: 'OTHER', label: 'Other' },
];

export function EventDetailsStep({
  formData,
  onUpdate,
  isCorporateUser,
  onNext,
  onBack,
}: EventDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Event Details</h2>
        <p className="mt-2 text-muted-foreground">Tell us about your event</p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Point of Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <input
                type="text"
                value={formData.contactName || ''}
                onChange={(e) => onUpdate({ contactName: e.target.value })}
                placeholder="John Doe"
                className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => onUpdate({ contactEmail: e.target.value })}
                placeholder="john@example.com"
                className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => onUpdate({ contactPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Event Address */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Where should we be?
          </label>
          <textarea
            value={formData.eventAddress || ''}
            onChange={(e) => onUpdate({ eventAddress: e.target.value })}
            placeholder="Full event address..."
            rows={3}
            className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">What type of event?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onUpdate({ eventType: type.value })}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.eventType === type.value
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border hover:border-border'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Essentials */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Event Essentials</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="powerSupply"
                checked={formData.hasPowerSupply || false}
                onChange={(e) => onUpdate({ hasPowerSupply: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="powerSupply" className="text-base text-foreground cursor-pointer">
                Power supply available
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="parking"
                checked={formData.hasParking || false}
                onChange={(e) => onUpdate({ hasParking: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="parking" className="text-base text-foreground cursor-pointer">
                Parking available
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                How many people are attending?
              </label>
              <input
                type="number"
                min="1"
                value={formData.attendeeCount || ''}
                onChange={(e) => onUpdate({ attendeeCount: parseInt(e.target.value) || undefined })}
                placeholder="50"
                className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                How did you hear about us?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REFERRAL_SOURCES.map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => onUpdate({ referralSource: source.value })}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      formData.referralSource === source.value
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-border hover:border-border'
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Fields */}
        {isCorporateUser && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Corporate Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PO Number</label>
                <input
                  type="text"
                  value={formData.poNumber || ''}
                  onChange={(e) => onUpdate({ poNumber: e.target.value })}
                  placeholder="PO-12345"
                  className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cost Centre</label>
                <input
                  type="text"
                  value={formData.costCentre || ''}
                  onChange={(e) => onUpdate({ costCentre: e.target.value })}
                  placeholder="CC-001"
                  className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Anything extra you'll need?
          </label>
          <textarea
            value={formData.eventNotes || ''}
            onChange={(e) => onUpdate({ eventNotes: e.target.value })}
            placeholder="Special requests, requirements, or additional information..."
            rows={4}
            className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-foreground hover:text-foreground font-medium"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          Review Booking →
        </button>
      </div>
    </div>
  );
}
