import { inngest } from '../client';
import { emailService } from '@/lib/services/email.service';
import { automationLogService } from '@/lib/services/automation-log.service';
import { prisma } from '@/lib/prisma';
import { BookingReminderEmail } from '@/emails/booking-reminder';

export const bookingReminderFunction = inngest.createFunction(
  {
    id: 'booking-send-reminder',
    name: 'Send Booking Reminder',
    retries: 2,
  },
  { event: 'booking/send-reminder' },
  async ({ event, step }) => {
    const { bookingId, bookingNumber, customerId, customerEmail, customerName, scheduledAt, productName, daysBeforeEvent } = event.data;

    // Find active automation rule
    const rule = await automationLogService.findActiveRule('booking.reminder');
    if (!rule) {
      console.log('No active rule for booking.reminder');
      return { skipped: true };
    }

    // Step 1: Verify booking is still confirmed
    const bookingStatus = await step.run('verify-booking-status', async () => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          status: true,
          eventAddress: true,
        },
      });

      return {
        status: booking?.status,
        eventAddress: booking?.eventAddress,
      };
    });

    // Only send reminder if booking is CONFIRMED
    if (bookingStatus.status !== 'CONFIRMED') {
      await automationLogService.log({
        ruleId: rule.id,
        success: true,
        message: `Booking reminder skipped: status is ${bookingStatus.status}`,
        metadata: { bookingId, daysBeforeEvent },
      });

      return { skipped: true, reason: `Booking status is ${bookingStatus.status}` };
    }

    // Step 2: Send booking reminder email
    await step.run('send-booking-reminder', async () => {
      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}`;

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: `Reminder: Your event is ${daysBeforeEvent === 0 ? 'today' : daysBeforeEvent === 1 ? 'tomorrow' : `in ${daysBeforeEvent} days`}`,
        template: BookingReminderEmail({
          customerName,
          bookingNumber,
          scheduledAt,
          productName,
          daysUntilEvent: daysBeforeEvent,
          eventAddress: bookingStatus.eventAddress || undefined,
          bookingUrl,
        }),
        userId: customerId,
        metadata: {
          bookingId,
          bookingNumber,
          trigger: 'booking.reminder',
          daysBeforeEvent,
        },
      });

      await automationLogService.log({
        ruleId: rule.id,
        success: result.success,
        message: result.success
          ? `Booking reminder sent (${daysBeforeEvent}d before event)`
          : `Failed to send booking reminder: ${result.error}`,
        metadata: { bookingId, daysBeforeEvent },
      });

      return result;
    });

    return { success: true, daysBeforeEvent };
  }
);
