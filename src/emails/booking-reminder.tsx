import { Text, Button, Hr } from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './base-template';

interface BookingReminderEmailProps {
  customerName: string;
  bookingNumber: string;
  scheduledAt: string;
  productName: string;
  daysUntilEvent: number;
  eventAddress?: string;
  bookingUrl: string;
}

export function BookingReminderEmail(props: BookingReminderEmailProps) {
  const { customerName, bookingNumber, scheduledAt, productName, daysUntilEvent, eventAddress, bookingUrl } = props;

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

  const timeframeText = daysUntilEvent === 0 ? 'today' :
                        daysUntilEvent === 1 ? 'tomorrow' :
                        `in ${daysUntilEvent} days`;

  return (
    <BaseEmail
      preview={`Reminder: Your event is ${timeframeText}`}
      heading={`Your Event is ${timeframeText}!`}
    >
      <Text>Hi {customerName},</Text>
      <Text>
        This is a reminder about your upcoming photo booth booking:
      </Text>

      <Hr />

      <Text style={label}>Booking Number:</Text>
      <Text style={value}>{bookingNumber}</Text>

      <Text style={label}>Service:</Text>
      <Text style={value}>{productName}</Text>

      <Text style={label}>Date & Time:</Text>
      <Text style={value}>{eventDate} at {eventTime}</Text>

      {eventAddress && (
        <>
          <Text style={label}>Location:</Text>
          <Text style={value}>{eventAddress}</Text>
        </>
      )}

      <Hr />

      <Text>
        We're looking forward to making your event memorable!
      </Text>

      <Button href={bookingUrl} style={button}>
        View Booking Details
      </Button>

      <Text>
        If you need to make any last-minute changes, please contact us as soon as possible.
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
