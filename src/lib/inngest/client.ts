import { Inngest } from 'inngest';

// Define event schemas for type safety
export type BookingCreatedEvent = {
  name: 'booking/created';
  data: {
    bookingId: string;
    bookingNumber: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    scheduledAt: string; // ISO string
    productName: string;
    finalPrice: number;
  };
};

export type TemplateCheckIncompleteEvent = {
  name: 'template/check-incomplete';
  data: {
    bookingId: string;
    bookingNumber: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    scheduledAt: string;
    checkType: '72h_after_booking' | '24h_before_event';
  };
};

export type BookingSendReminderEvent = {
  name: 'booking/send-reminder';
  data: {
    bookingId: string;
    bookingNumber: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    scheduledAt: string;
    productName: string;
    daysBeforeEvent: number;
  };
};

export type TemplateSubmittedEvent = {
  name: 'template/submitted';
  data: {
    bookingId: string;
    bookingNumber: string;
    customerId: string;
    templateId: string;
    submittedAt: string;
  };
};

// Union type for all events
export type Events =
  | BookingCreatedEvent
  | TemplateCheckIncompleteEvent
  | BookingSendReminderEvent
  | TemplateSubmittedEvent;

// Create Inngest client
export const inngest = new Inngest({
  id: 'selfy-automations',
});
