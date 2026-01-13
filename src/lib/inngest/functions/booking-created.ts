import { inngest } from '../client';
import { emailService } from '@/lib/services/email.service';
import { automationLogService } from '@/lib/services/automation-log.service';
import { BookingConfirmationEmail } from '@/emails/booking-confirmation';

export const bookingCreatedFunction = inngest.createFunction(
  {
    id: 'booking-created',
    name: 'Booking Created - Send Confirmation & Schedule Reminders',
    retries: 3,
  },
  { event: 'booking/created' },
  async ({ event, step }) => {
    const { bookingId, bookingNumber, customerId, customerEmail, customerName, scheduledAt, productName, finalPrice } = event.data;

    // Find active automation rule
    const rule = await automationLogService.findActiveRule('booking.created');
    if (!rule) {
      console.log('No active rule for booking.created');
      return { skipped: true };
    }

    // Step 1: Send immediate confirmation email
    await step.run('send-confirmation-email', async () => {
      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}`;

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: `Booking Confirmation - ${bookingNumber}`,
        template: BookingConfirmationEmail({
          customerName,
          bookingNumber,
          scheduledAt,
          productName,
          finalPrice,
          bookingUrl,
        }),
        userId: customerId,
        metadata: {
          bookingId,
          bookingNumber,
          trigger: 'booking.created',
          action: 'confirmation_email',
        },
      });

      await automationLogService.log({
        ruleId: rule.id,
        success: result.success,
        message: result.success
          ? `Confirmation email sent to ${customerEmail}`
          : `Failed to send confirmation email: ${result.error}`,
        metadata: { bookingId, action: 'confirmation_email' },
      });

      return result;
    });

    // Step 2: Schedule template reminder check at 72 hours after booking
    await step.run('schedule-template-check-72h', async () => {
      const checkTime = new Date();
      checkTime.setHours(checkTime.getHours() + 72);

      await inngest.send({
        name: 'template/check-incomplete',
        data: {
          bookingId,
          bookingNumber,
          customerId,
          customerEmail,
          customerName,
          scheduledAt,
          checkType: '72h_after_booking',
        },
        ts: checkTime.getTime(),
      });

      return { scheduled: true, checkTime: checkTime.toISOString() };
    });

    // Step 3: Schedule template reminder check at 24 hours before event
    await step.run('schedule-template-check-24h', async () => {
      const eventTime = new Date(scheduledAt);
      const checkTime = new Date(eventTime);
      checkTime.setHours(checkTime.getHours() - 24);

      // Only schedule if event is more than 24 hours away
      if (checkTime > new Date()) {
        await inngest.send({
          name: 'template/check-incomplete',
          data: {
            bookingId,
            bookingNumber,
            customerId,
            customerEmail,
            customerName,
            scheduledAt,
            checkType: '24h_before_event',
          },
          ts: checkTime.getTime(),
        });

        return { scheduled: true, checkTime: checkTime.toISOString() };
      }

      return { scheduled: false, reason: 'Event is less than 24 hours away' };
    });

    // Step 4: Schedule booking reminders (7d, 3d, 24h before event)
    await step.run('schedule-booking-reminders', async () => {
      const eventTime = new Date(scheduledAt);
      const reminderIntervals = [7, 3, 1]; // days before event
      const scheduledReminders = [];

      for (const days of reminderIntervals) {
        const reminderTime = new Date(eventTime);
        reminderTime.setDate(reminderTime.getDate() - days);

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          await inngest.send({
            name: 'booking/send-reminder',
            data: {
              bookingId,
              bookingNumber,
              customerId,
              customerEmail,
              customerName,
              scheduledAt,
              productName,
              daysBeforeEvent: days,
            },
            ts: reminderTime.getTime(),
          });

          scheduledReminders.push({
            days,
            scheduledFor: reminderTime.toISOString(),
          });
        }
      }

      return { scheduled: scheduledReminders };
    });

    return { success: true };
  }
);
