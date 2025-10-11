import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthProvider } from './auth/auth.provider';
import { MailModule } from 'src/mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { DatabaseModule } from 'src/db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService ,ConfigModule} from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.stategy';
import { GoogleStrategy } from './strategies/google.strategy';


@Module({
  controllers: [UserController],
  providers: [UserService, AuthProvider, JwtStrategy, GoogleStrategy],
  imports: [
    DatabaseModule,
    MailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        global: true,
        secret: ConfigService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: ConfigService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1d' },
      }),
    }),
    ConfigModule,
  ],
  exports: [UserService, JwtModule],
})
export class UserModule {}
