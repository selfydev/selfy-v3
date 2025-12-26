'use client';

import { useState, useEffect } from 'react';

interface DateTimeSelectionStepProps {
  scheduledDate?: string;
  scheduledTime?: string;
  onUpdate: (date: string | undefined, time: string | undefined) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DateTimeSelectionStep({
  scheduledDate,
  scheduledTime,
  onUpdate,
  onNext,
  onBack,
}: DateTimeSelectionStepProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [minDate, setMinDate] = useState<Date>(new Date());

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setMinDate(tomorrow);

    // Generate available time slots (12AM to 11PM, every hour)
    const times: string[] = [];
    for (let hour = 0; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setAvailableTimes(times);

    // Set current month to show tomorrow if no date selected
    if (!scheduledDate) {
      setCurrentMonth(new Date(tomorrow));
    } else {
      setCurrentMonth(new Date(scheduledDate!));
    }
  }, []);

  const handleDateChange = (date: string) => {
    onUpdate(date, scheduledTime || undefined);
    // Inline intelligence: suggest best time when date is selected
    if (!scheduledTime && availableTimes.length > 0) {
      // Suggest 10 AM as a popular slot
      onUpdate(date, '10:00');
    }
  };

  const handleTimeSelect = (time: string) => {
    onUpdate(scheduledDate, time);
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Days in month
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; fullDate: Date; isDisabled: boolean; isToday: boolean; isSelected: boolean }> = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, fullDate: new Date(), isDisabled: true, isToday: false, isSelected: false });
    }

    // Add days of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = scheduledDate ? new Date(scheduledDate) : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      fullDate.setHours(0, 0, 0, 0);
      const isDisabled = fullDate < minDate;
      const isToday = fullDate.getTime() === today.getTime();
      const isSelected = selectedDate ? fullDate.getTime() === selectedDate.getTime() : false;

      days.push({ date: day, fullDate, isDisabled, isToday, isSelected });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day: { date: number; fullDate: Date; isDisabled: boolean }) => {
    if (day.isDisabled || day.date === 0) return;
    const dateStr = day.fullDate.toISOString().split('T')[0];
    if (dateStr) {
      handleDateChange(dateStr);
    }
  };
  const canProceed = scheduledDate && scheduledTime;

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">When's the event?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a date and time that works for you</p>
      </div>

      <div className="space-y-4">
        {/* Modern Calendar */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-background">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1.5 rounded-md hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-sm font-semibold text-foreground">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1.5 rounded-md hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-foreground0 py-1 w-10 mx-auto">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day.date === 0) {
                  return <div key={`empty-${index}`} className="w-10 h-10" />;
                }

                return (
                  <button
                    key={`${day.fullDate.getTime()}`}
                    type="button"
                    onClick={() => selectDate(day)}
                    disabled={day.isDisabled}
                    className={`w-10 h-10 rounded-md text-sm font-medium transition-all duration-150 ${
                      day.isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : day.isToday
                          ? 'bg-primary-50 text-primary border border-primary/30'
                          : day.isDisabled
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'text-foreground hover:bg-muted hover:border-primary/20 border border-transparent'
                    }`}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date display */}
          {scheduledDate && (
            <div className="px-3 py-2.5 bg-primary-50 border-t border-primary-100">
              <p className="text-sm font-semibold text-primary-900">
                ✓ {new Date(scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Time Selection */}
        {scheduledDate && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">
              Choose a time
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
              {availableTimes.map((time) => {
                const isSelected = scheduledTime === time;
                const isPopular = time === '10:00' || time === '14:00';

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`w-full h-9 px-2 rounded-lg border font-medium text-sm transition-all duration-150 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{time}</span>
                      {isPopular && !isSelected && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">⭐</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {scheduledTime && (
              <p className="mt-2 text-xs text-primary font-medium">
                ✓ {scheduledTime} confirmed
              </p>
            )}
          </div>
        )}

        {!scheduledDate && (
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-2.5">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <span className="">📅</span>
              <span>Select a date above to see available time slots</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-foreground hover:text-foreground font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary shadow-sm hover:shadow-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
