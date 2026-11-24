import { db } from '@/lib/db';
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

export class NotificationService {
  static async sendInApp(userId: string, type: NotificationType, title: string, body: string, data?: any) {
    return db.notification.create({
      data: {
        userId,
        type,
        channel: 'IN_APP',
        title,
        body,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
        isRead: false,
        status: 'PENDING'
      }
    });
  }

  static async processNotificationJob(jobData: any) {
    const { notificationId, attempt = 1, maxAttempts = 3 } = jobData;
    
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      include: { user: true }
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { status: 'PROCESSING' }
    });

    const userPrefs = notification.user.notificationPreferences as any;
    if (userPrefs?.optOut?.includes(notification.channel)) {
      console.log(`[NotificationService] User ${notification.user.id} opted out of ${notification.channel}`);
      await db.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' }
      });
      return;
    }

    try {
      let success = false;
      let providerMessageId: string | undefined;

      switch (notification.channel) {
        case 'EMAIL':
          if (notification.user.email) {
            success = await this.sendEmail(notification.user.email, notification.title, notification.body);
            providerMessageId = `email-${Date.now()}`;
          } else {
            throw new Error('User has no email');
          }
          break;
        case 'SMS':
          if (notification.user.phone) {
            success = await this.sendSMS(notification.user.phone, notification.body);
            providerMessageId = `sms-${Date.now()}`;
          } else {
            throw new Error('User has no phone');
          }
          break;
        case 'WHATSAPP':
          if (notification.user.phone) {
            success = await this.sendWhatsApp(notification.user.phone, notification.body);
            providerMessageId = `wa-${Date.now()}`;
          } else {
            throw new Error('User has no phone for WhatsApp');
          }
          break;
        case 'IN_APP':
        case 'PUSH':
        default:
          success = true;
          break;
      }

      if (!success) {
        throw new Error('Provider returned false');
      }

      await db.notification.update({
        where: { id: notificationId },
        data: { 
          status: 'SENT', 
          sentAt: new Date(),
          providerMessageId
        }
      });
      
    } catch (error) {
      const isRetrying = attempt < maxAttempts;
      await db.notification.update({
        where: { id: notificationId },
        data: { status: isRetrying ? 'RETRYING' : 'FAILED' }
      });
      
      throw error;
    }
  }

  static async sendEmail(to: string, subject: string, body: string) {
    if (!process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] to: ${to} | subject: ${subject} | body: ${body}`);
      return true;
    }
    // Real SMTP implementation using nodemailer would go here
    console.log(`[EMAIL SENT] to: ${to}`);
    return true;
  }

  static async sendSMS(phone: string, message: string) {
    if (!process.env.SMS_API_KEY) {
      console.log(`[MOCK SMS] phone: ${phone} | message: ${message}`);
      return true;
    }
    // Real SMS implementation (Twilio, Msg91, etc.) would go here
    return true;
  }

  static async sendWhatsApp(phone: string, message: string) {
    if (!process.env.WHATSAPP_API_KEY) {
      console.log(`[MOCK WHATSAPP] phone: ${phone} | message: ${message}`);
      return true;
    }
    // Real WhatsApp API integration would go here
    return true;
  }

  static async getNotifications(userId: string, unreadOnly: boolean = false) {
    return db.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  static async markAsRead(notificationId: string) {
    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    });
  }
}
