import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  constructor(private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
      this.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true لأنك تستخدم بورت 465
  auth: {
    user: 'mhabnoor75@gmail.com',
    pass: 'grylxexibuiscxwa',
  },
});}
  // إرسال بريد التحقق من البريد الإلكتروني
  async sendVerifyEmailTemplate(
    toEmail: string,
    verificationLink: string,
    lang: 'ar' | 'en' = 'en'
  ) {
    // استبدال localhost بـ رابط الـ API الأساسي
    const fullLink = verificationLink.replace(
      'http://localhost:5000',
      'https://flight-system-3nfs.onrender.com'
    );

    const subject = lang === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Email Verification';
    const text =
      lang === 'ar'
        ? 'مرحباً، الرجاء الضغط على الزر التالي لتأكيد بريدك الإلكتروني.'
        : 'Hello, please click the button below to verify your email.';

    const html =
      lang === 'ar'
        ? `
      <div dir="rtl" style="font-family: 'Tahoma', 'Arial', sans-serif; background-color: #f2f2f2; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">مرحباً بك،</h2>
          <p style="font-size: 16px; color: #555;">
            شكراً لانضمامك إلينا. لتفعيل حسابك، اضغط على الزر أدناه:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${fullLink}" style="background-color: #28a745; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; display: inline-block;">
              تأكيد البريد الإلكتروني
            </a>
          </div>
        </div>
      </div>
      `
        : `
      <div style="font-family: 'Arial', sans-serif; background-color: #f2f2f2; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Welcome,</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for joining us. To activate your account, please click the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${fullLink}" style="background-color: #007bff; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; display: inline-block;">
              Verify Email
            </a>
          </div>
        </div>
      </div>
      `;

    await this.sendEmail(toEmail, subject, text, html, lang);
  }

  // إرسال بريد إعادة تعيين كلمة المرور
  async sendResetPasswordTemplate(toEmail: string, resetLink: string, lang: 'ar' | 'en' = 'en') {
    const subject = lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset';
    const text = lang === 'ar'
      ?` مرحباً، يمكنك إعادة تعيين كلمة المرور الخاصة بك عبر الرابط التالي: ${resetLink}`
      : `Hello, you can reset your password using the following link: ${resetLink}`;

    const html = lang === 'ar'
      ? `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; background-color: #f0f4f8; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">إعادة تعيين كلمة المرور</h2>
          <p style="font-size: 16px; color: #555;">إذا طلبت إعادة تعيين كلمة المرور، اضغط على الرابط أدناه:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ff6347; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.
          </p>
        </div>
      </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="font-size: 16px; color: #555;">
            If you requested a password reset, click the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ff6347; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
      `;

    await this.sendEmail(toEmail, subject, text, html, lang);
  }

  public async sendResetCodeEmail(email: string, code: string, lang: 'en' | 'ar' = 'en'): Promise<void> {
    try {
      const today = new Date().toLocaleDateString('ar-en');
      await this.mailerService.sendMail({
    to: email,
    from: `No Reply <${this.configService.get('MAIL_USER')}>`,
    subject: lang === 'ar'
      ? 'رمز إعادة تعيين كلمة المرور'
      : 'Password Reset Code',
    template: 'reset-code',
    context: {
      email,
      code,
      today,
      lang,
      message:
        lang === 'ar'
          ?` رمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}.\nهذا الرمز صالح لمدة دقيقة واحدة فقط.`
          : `Your password reset code is: ${code}.\nThis code is valid for only one minute.,`
    },
  });
    } catch (err) {
      console.error(' Failed to send reset code email:', err);
      throw new RequestTimeoutException(
        lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى لاحقًا' : 'Something went wrong, please try again later'
      );
    }
  }
  // دالة عامة لإرسال أي بريد
  private async sendEmail(toEmail: string, subject: string, text: string, html: string, lang: 'ar' | 'en') {
    try {
      const fromEmail = this.configService.get('MAIL_USER');
      await this.mailerService.sendMail({
        from: `"SkyAir No Reply" <${fromEmail}>`,
        to: toEmail,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException(lang === 'ar' ? 'فشل في إرسال البريد الإلكتروني' : 'Failed to send email');
    }
  }
}

