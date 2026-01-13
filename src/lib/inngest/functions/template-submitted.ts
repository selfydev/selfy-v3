import { inngest } from '../client';
import { emailService } from '@/lib/services/email.service';
import { smsService } from '@/lib/services/sms.service';
import { automationLogService } from '@/lib/services/automation-log.service';
import { prisma } from '@/lib/prisma';
import { TemplateSubmittedEmail } from '@/emails/template-submitted';

export const templateSubmittedFunction = inngest.createFunction(
  {
    id: 'template-submitted',
    name: 'Template Submitted - Send Confirmation & Notify Admins',
    retries: 2,
  },
  { event: 'template/submitted' },
  async ({ event, step }) => {
    const { bookingId, bookingNumber, customerId, templateId, submittedAt } = event.data;

    // Find active automation rule
    const rule = await automationLogService.findActiveRule('template.submitted');
    if (!rule) {
      console.log('No active rule for template.submitted');
      return { skipped: true };
    }

    // Step 1: Fetch booking and customer details
    const bookingDetails = await step.run('fetch-booking-details', async () => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return {
        customerName: booking?.customer.name || 'Customer',
        customerEmail: booking?.customer.email || '',
        customerPhone: booking?.customer.phone,
        scheduledAt: booking?.scheduledAt.toISOString() || '',
      };
    });

    // Step 2: Send confirmation email to customer
    await step.run('send-customer-confirmation', async () => {
      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}`;

      const result = await emailService.sendEmail({
        to: bookingDetails.customerEmail,
        subject: `Template Received - ${bookingNumber}`,
        template: TemplateSubmittedEmail({
          customerName: bookingDetails.customerName,
          bookingNumber,
          scheduledAt: bookingDetails.scheduledAt,
          bookingUrl,
        }),
        userId: customerId,
        metadata: {
          bookingId,
          bookingNumber,
          templateId,
          trigger: 'template.submitted',
        },
      });

      await automationLogService.log({
        ruleId: rule.id,
        success: result.success,
        message: result.success
          ? `Template confirmation email sent to customer`
          : `Failed to send confirmation: ${result.error}`,
        metadata: { bookingId, templateId, action: 'customer_email' },
      });

      return result;
    });

    // Step 3: Optional SMS notification
    if (bookingDetails.customerPhone) {
      await step.run('send-customer-sms', async () => {
        const message = `Hi ${bookingDetails.customerName}, we've received your template for booking ${bookingNumber}. You're all set!`;

        const result = await smsService.sendSMS({
          to: bookingDetails.customerPhone!,
          message,
          userId: customerId,
          metadata: {
            bookingId,
            bookingNumber,
            templateId,
            trigger: 'template.submitted',
          },
        });

        await automationLogService.log({
          ruleId: rule.id,
          success: result.success,
          message: result.success
            ? `SMS confirmation sent to customer`
            : `Failed to send SMS: ${result.error}`,
          metadata: { bookingId, templateId, action: 'customer_sms' },
        });

        return result;
      });
    }

    // Step 4: Create admin log entry
    await step.run('create-admin-notification', async () => {
      // Admin notifications are created in the API route
      // This step serves as a checkpoint in the workflow
      return { logged: true };
    });

    return { success: true };
  }
);
