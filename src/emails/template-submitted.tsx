import { Text, Button } from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './base-template';

interface TemplateSubmittedEmailProps {
  customerName: string;
  bookingNumber: string;
  scheduledAt: string;
  bookingUrl: string;
}

export function TemplateSubmittedEmail(props: TemplateSubmittedEmailProps) {
  const { customerName, bookingNumber, scheduledAt, bookingUrl } = props;

  const eventDate = new Date(scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <BaseEmail
      preview="Template Submitted Successfully"
      heading="Template Received!"
    >
      <Text>Hi {customerName},</Text>
      <Text>
        Great news! We've successfully received your photo booth template design for booking <strong>{bookingNumber}</strong>.
      </Text>

      <Text>
        Our team will review your template and prepare everything for your event on <strong>{eventDate}</strong>.
      </Text>

      <Text style={note}>
        ✓ Template submitted<br />
        ✓ Review in progress<br />
        ✓ We'll contact you if we need any clarifications
      </Text>

      <Button href={bookingUrl} style={button}>
        View Your Booking
      </Button>

      <Text>
        You're all set! We look forward to making your event special.
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

const note = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '4px',
  padding: '12px',
  color: '#155724',
  marginTop: '16px',
  marginBottom: '16px',
  lineHeight: '1.8',
};
