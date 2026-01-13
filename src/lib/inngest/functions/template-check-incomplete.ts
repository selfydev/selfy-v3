import { inngest } from '../client';
import { emailService } from '@/lib/services/email.service';
import { automationLogService } from '@/lib/services/automation-log.service';
import { prisma } from '@/lib/prisma';
import { TemplateReminderEmail } from '@/emails/template-reminder';

export const templateCheckIncompleteFunction = inngest.createFunction(
  {
    id: 'template-check-incomplete',
    name: 'Check if Template is Incomplete and Send Reminder',
    retries: 2,
  },
  { event: 'template/check-incomplete' },
  async ({ event, step }) => {
    const { bookingId, bookingNumber, customerId, customerEmail, customerName, scheduledAt, checkType } = event.data;

    // Find active automation rule
    const rule = await automationLogService.findActiveRule('template.incomplete');
    if (!rule) {
      console.log('No active rule for template.incomplete');
      return { skipped: true };
    }

    // Step 1: Check if template has been submitted
    const templateSubmitted = await step.run('check-template-status', async () => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { templateSubmitted: true, status: true },
      });

      return {
        submitted: booking?.templateSubmitted || false,
        status: booking?.status,
      };
    });

    // If template already submitted or booking not confirmed, skip
    if (templateSubmitted.submitted || templateSubmitted.status !== 'CONFIRMED') {
      await automationLogService.log({
        ruleId: rule.id,
        success: true,
        message: `Template check skipped: ${
          templateSubmitted.submitted ? 'already submitted' : `booking status is ${templateSubmitted.status}`
        }`,
        metadata: { bookingId, checkType },
      });

      return { skipped: true, reason: 'Template submitted or booking not confirmed' };
    }

    // Step 2: Calculate hours until event
    const hoursUntilEvent = await step.run('calculate-time-until-event', async () => {
      const eventTime = new Date(scheduledAt);
      const now = new Date();
      const diffMs = eventTime.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      return diffHours;
    });

    // Step 3: Send template reminder email
    await step.run('send-template-reminder', async () => {
      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}`;

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: hoursUntilEvent <= 24
          ? `URGENT: Template Reminder - ${bookingNumber}`
          : `Template Reminder - ${bookingNumber}`,
        template: TemplateReminderEmail({
          customerName,
          bookingNumber,
          scheduledAt,
          hoursUntilEvent,
          bookingUrl,
        }),
        userId: customerId,
        metadata: {
          bookingId,
          bookingNumber,
          trigger: 'template.incomplete',
          checkType,
          hoursUntilEvent,
        },
      });

      await automationLogService.log({
        ruleId: rule.id,
        success: result.success,
        message: result.success
          ? `Template reminder sent (${checkType}, ${hoursUntilEvent}h until event)`
          : `Failed to send template reminder: ${result.error}`,
        metadata: { bookingId, checkType, hoursUntilEvent },
      });

      return result;
    });

    return { success: true, hoursUntilEvent };
  }
);
