import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  template: ReactElement;
  userId: string;
  metadata?: Record<string, any>;
}

export class EmailService {
  /**
   * Send email using Resend with React Email template
   * Logs to Notification table
   */
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, template, userId, metadata } = params;

    try {
      // Render React Email template to HTML
      const html = await render(template);

      // Send via Resend
      const { data, error } = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });

      if (error) {
        // Log failed notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'EMAIL',
            status: 'FAILED',
            subject,
            message: html,
            metadata: { ...metadata, error: error.message },
          },
        });

        return { success: false, error: error.message };
      }

      // Log successful notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'EMAIL',
          status: 'SENT',
          subject,
          message: html,
          sentAt: new Date(),
          metadata: { ...metadata, messageId: data?.id },
        },
      });

      return { success: true, messageId: data?.id };
    } catch (error: any) {
      // Log exception
      await prisma.notification.create({
        data: {
          userId,
          type: 'EMAIL',
          status: 'FAILED',
          subject,
          message: '',
          metadata: { ...metadata, error: error.message },
        },
      });

      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
