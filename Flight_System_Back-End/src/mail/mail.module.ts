import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true if using 465
      auth: {
        user: 'mhabnoor75@gmail.com',
    pass: 'grylxexibuiscxwa',
      },
    },
    defaults: {
      from: '"No Reply" <no-reply@yourapp.com>',
    },
    template: {
      dir: join(process.cwd(),'src/mail/templates'),
      adapter: new EjsAdapter(),
      options: {
        strict: false,
      },
    },
  }),
}),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}