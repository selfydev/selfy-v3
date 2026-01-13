import { Text, Button } from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './base-template';

interface TemplateReminderEmailProps {
  customerName: string;
  bookingNumber: string;
  scheduledAt: string;
  hoursUntilEvent: number;
  bookingUrl: string;
}

export function TemplateReminderEmail(props: TemplateReminderEmailProps) {
  const { customerName, bookingNumber, scheduledAt, hoursUntilEvent, bookingUrl } = props;

  const eventDate = new Date(scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const urgency = hoursUntilEvent <= 24 ? 'URGENT: ' : '';
  const timeframe = hoursUntilEvent <= 24 ? 'within 24 hours' : 'soon';

  return (
    <BaseEmail
      preview={`${urgency}Template Reminder - ${bookingNumber}`}
      heading="Template Submission Reminder"
    >
      <Text>Hi {customerName},</Text>
      <Text>
        This is a friendly reminder that your photo booth template for booking <strong>{bookingNumber}</strong> has not been submitted yet.
      </Text>

      <Text>
        Your event is scheduled for <strong>{eventDate}</strong> ({hoursUntilEvent} hours away).
      </Text>

      {hoursUntilEvent <= 24 && (
        <Text style={urgentWarning}>
          ⚠️ <strong>IMPORTANT:</strong> Your event is {timeframe}! Please submit your template as soon as possible to ensure we can prepare everything for your event.
        </Text>
      )}

      <Button href={bookingUrl} style={button}>
        Submit Your Template Now
      </Button>

      <Text>
        If you need help with your design or have any questions, please contact us immediately.
      </Text>
    </BaseEmail>
  );
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  marginTop: '16px',
  marginBottom: '16px',
};

const urgentWarning = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '4px',
  padding: '12px',
  color: '#856404',
  marginTop: '16px',
  marginBottom: '16px',
};
