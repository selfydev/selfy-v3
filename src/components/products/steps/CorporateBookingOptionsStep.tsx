'use client';

import { useState } from 'react';

interface CorporateBookingOptionsStepProps {
  formData: {
    isMultiDay?: boolean;
    multiDayDates?: string[];
    isRecurring?: boolean;
    recurringRule?: string;
    recurringEndDate?: string;
    isBulkBooking?: boolean;
    bulkLocations?: Array<{ address: string; date: string; time: string }>;
    holdSlot?: boolean;
    requestQuote?: boolean;
  };
  onUpdate: (updates: Partial<CorporateBookingOptionsStepProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const RECURRING_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'CUSTOM', label: 'Custom' },
];

export function CorporateBookingOptionsStep({
  formData,
  onUpdate,
  onNext,
  onBack,
}: CorporateBookingOptionsStepProps) {
  const [showMultiDay, setShowMultiDay] = useState(formData.isMultiDay || false);
  const [showRecurring, setShowRecurring] = useState(formData.isRecurring || false);
  const [showBulk, setShowBulk] = useState(formData.isBulkBooking || false);

  const addMultiDayDate = () => {
    const dates = formData.multiDayDates || [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    if (dateStr) {
      onUpdate({
        multiDayDates: [...dates, dateStr],
      });
    }
  };

  const removeMultiDayDate = (index: number) => {
    const dates = formData.multiDayDates || [];
    onUpdate({
      multiDayDates: dates.filter((_, i) => i !== index),
    });
  };

  const addBulkLocation = () => {
    const locations = formData.bulkLocations || [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onUpdate({
      bulkLocations: [
        ...locations,
        {
          address: '',
          date: tomorrow.toISOString().split('T')[0] || '',
          time: '10:00',
        },
      ],
    });
  };

  const removeBulkLocation = (index: number) => {
    const locations = formData.bulkLocations || [];
    onUpdate({
      bulkLocations: locations.filter((_, i) => i !== index),
    });
  };

  const updateBulkLocation = (index: number, updates: Partial<{ address: string; date: string; time: string }>) => {
    const locations = formData.bulkLocations || [];
    onUpdate({
      bulkLocations: locations.map((loc, i) => (i === index ? { ...loc, ...updates } : loc)),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Advanced Booking Options</h2>
        <p className="mt-2 text-muted-foreground">Configure multi-day, recurring, or bulk bookings</p>
      </div>

      <div className="space-y-6">
        {/* Request Quote Option - Primary corporate feature */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900">Request Quote</h3>
              <p className="text-sm text-primary mt-1">
                Request a custom quote with net payment terms (30/60/90 days)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requestQuote || false}
                onChange={(e) => onUpdate({ requestQuote: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-primary/40 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-primary/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          {formData.requestQuote && (
            <div className="mt-3 p-3 bg-card rounded-lg border border-primary/20">
              <p className="text-sm text-primary-800">
                <strong>How it works:</strong> Your booking request will be sent to our team for review. 
                Once approved, you&apos;ll receive an invoice with your agreed payment terms.
              </p>
            </div>
          )}
        </div>

        {/* Hold Slot Option */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Hold Slot</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reserve this slot without immediate payment
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.holdSlot || false}
                onChange={(e) => onUpdate({ holdSlot: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Multi-Day Booking */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Multi-Day Booking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Book the same package across multiple days
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showMultiDay}
                onChange={(e) => {
                  setShowMultiDay(e.target.checked);
                  onUpdate({ isMultiDay: e.target.checked });
                  if (!e.target.checked) {
                    onUpdate({ multiDayDates: [] });
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {showMultiDay && (
            <div className="space-y-3 mt-4">
              {(formData.multiDayDates || []).map((date, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      const dates = formData.multiDayDates || [];
                      onUpdate({
                        multiDayDates: dates.map((d, i) => (i === index ? e.target.value : d)),
                      });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeMultiDayDate(index)}
                    className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMultiDayDate}
                className="w-full px-4 py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary-400 hover:text-primary transition-colors"
              >
                + Add Another Date
              </button>
            </div>
          )}
        </div>

        {/* Recurring Booking */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Recurring Booking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Set up automatic recurring bookings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showRecurring}
                onChange={(e) => {
                  setShowRecurring(e.target.checked);
                  onUpdate({ isRecurring: e.target.checked });
                  if (!e.target.checked) {
                    onUpdate({ recurringRule: undefined, recurringEndDate: undefined });
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {showRecurring && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recurrence Pattern
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RECURRING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdate({ recurringRule: option.value })}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        formData.recurringRule === option.value
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.recurringRule && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.recurringEndDate || ''}
                    onChange={(e) => onUpdate({ recurringEndDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-border px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-foreground0">
                    Leave empty for ongoing recurring bookings
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Booking */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Bulk Booking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Book the same package across multiple locations, dates, or teams
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showBulk}
                onChange={(e) => {
                  setShowBulk(e.target.checked);
                  onUpdate({ isBulkBooking: e.target.checked });
                  if (!e.target.checked) {
                    onUpdate({ bulkLocations: [] });
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {showBulk && (
            <div className="space-y-4 mt-4">
              {(formData.bulkLocations || []).map((location, index) => (
                <div key={index} className="p-4 bg-background rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Booking #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeBulkLocation(index)}
                      className="text-sm text-destructive hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Location Address
                    </label>
                    <textarea
                      value={location.address}
                      onChange={(e) => updateBulkLocation(index, { address: e.target.value })}
                      placeholder="Enter full address..."
                      rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                      <input
                        type="date"
                        value={location.date}
                        onChange={(e) => updateBulkLocation(index, { date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                      <input
                        type="time"
                        value={location.time}
                        onChange={(e) => updateBulkLocation(index, { time: e.target.value })}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addBulkLocation}
                className="w-full px-4 py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary-400 hover:text-primary transition-colors"
              >
                + Add Another Location/Date
              </button>
            </div>
          )}
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
          Continue →
        </button>
      </div>
    </div>
  );
}
