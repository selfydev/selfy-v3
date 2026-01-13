import twilio from 'twilio';
import { prisma } from '@/lib/prisma';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface SendSMSParams {
  to: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
}

export class SMSService {
  /**
   * Send SMS using Twilio
   * Logs to Notification table
   */
  async sendSMS(params: SendSMSParams): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    const { to, message, userId, metadata } = params;

    try {
      const result = await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
        body: message,
      });

      // Log successful notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'SMS',
          status: 'SENT',
          message,
          sentAt: new Date(),
          metadata: { ...metadata, messageSid: result.sid },
        },
      });

      return { success: true, messageSid: result.sid };
    } catch (error: any) {
      // Log failed notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'SMS',
          status: 'FAILED',
          message,
          metadata: { ...metadata, error: error.message },
        },
      });

      return { success: false, error: error.message };
    }
  }
}

export const smsService = new SMSService();
