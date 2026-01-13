import { Text, Button, Hr } from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './base-template';

interface BookingConfirmationEmailProps {
  customerName: string;
  bookingNumber: string;
  scheduledAt: string;
  productName: string;
  finalPrice: number;
  bookingUrl: string;
}

export function BookingConfirmationEmail(props: BookingConfirmationEmailProps) {
  const { customerName, bookingNumber, scheduledAt, productName, finalPrice, bookingUrl } = props;

  const eventDate = new Date(scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const eventTime = new Date(scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <BaseEmail
      preview={`Booking Confirmation - ${bookingNumber}`}
      heading="Booking Confirmed!"
    >
      <Text>Hi {customerName},</Text>
      <Text>
        Great news! Your booking has been confirmed. Here are the details:
      </Text>

      <Hr />

      <Text style={label}>Booking Number:</Text>
      <Text style={value}>{bookingNumber}</Text>

      <Text style={label}>Service:</Text>
      <Text style={value}>{productName}</Text>

      <Text style={label}>Date & Time:</Text>
      <Text style={value}>{eventDate} at {eventTime}</Text>

      <Text style={label}>Total:</Text>
      <Text style={value}>${finalPrice.toFixed(2)}</Text>

      <Hr />

      <Text>
        <strong>Next Step:</strong> Please submit your photo booth template design at least 24 hours before your event.
      </Text>

      <Button href={bookingUrl} style={button}>
        View Booking & Submit Template
      </Button>

      <Text style={note}>
        If you have any questions, please don't hesitate to contact us.
      </Text>
    </BaseEmail>
  );
}

const label = { fontSize: '12px', color: '#8898aa', marginBottom: '4px' };
const value = { fontSize: '16px', color: '#333', marginTop: '0', marginBottom: '16px' };
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
const note = { fontSize: '14px', color: '#525f7f', marginTop: '24px' };
