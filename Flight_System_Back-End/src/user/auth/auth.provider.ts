import { BadRequestException, forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schema/user.schema";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../user.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterUserDto } from "../dto/register-user.dto";
import { Types } from "mongoose";
import { JWTPayloadType } from "utilitis/types";
import { randomBytes } from "crypto";
import { MailService } from "src/mail/mail.service";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "../dto/login.dto";
import { RequestWithCookies, ValidationError } from "utilitis/interface";
import { Response } from "express";
import { ResetPasswordDto } from "../dto/reset-password.dto";

@Injectable()
export class AuthProvider{
  constructor(
    @InjectModel(User.name) private readonly userModul: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  //============================================================================
  //This one for Register new user
  public async Register(registerUserDto: RegisterUserDto,lang: 'en' | 'ar' = 'en'){
    lang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, fullName, password } = registerUserDto;
    const errors: { field: string; message: string}[]= [];
    const existingEmailUser = await this.userModul.findOne({ email });
    // تحقق من صيغة الإيميل
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        field: 'userEmail',
        message:
          lang === 'ar'
            ? 'البريد الإلكتروني غير صالح'
            : 'User email is not a valid email address',
      });
    }

    // تحقق من تكرار البريد الإلكتروني
    if (existingEmailUser) {
      errors.push({
        field: 'userEmail',
        message:
          lang === 'ar'
            ? 'البريد الإلكتروني مستخدم بالفعل'
            : 'Email is already registered',
      });
    }

    // تحقق من اسم المستخدم
    if (!fullName || typeof fullName !== 'string') {
      errors.push({
        field: 'userName',
        message:
          lang === 'ar'
            ? 'اسم المستخدم مطلوب ويجب أن يكون نصًا'
            : 'Username is required and must be a string',
      });
    } else {
      const existingUsernameUser = await this.userModul.findOne({ fullName });
      if (existingUsernameUser) {
        errors.push({
          field: 'userName',
          message:
            lang === 'ar'
              ? 'اسم المستخدم مستخدم بالفعل'
              : 'Username is already taken',
        });
      }
    }

    // تحقق من كلمة المرور
    if (typeof password !== 'string' || password.length < 6) {
      errors.push({
        field: 'password',
        message:
          lang === 'ar'
            ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            : 'Password must be at least 6 characters long',
      });
    }

    // إذا كان هناك أخطاء، أظهر أول خطأ فقط مع رسالته الخاصة
    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors[0].message, // رسالة الخطأ نفسها بدل جملة عامة
        errors: [errors[0]],
      });
    }

    // هاش كلمة المرور
    const hashedPassword = await this.hashPasswword(password);

    // إنشاء المستخدم
    let newUser = new this.userModul({
      ...registerUserDto,
      password: hashedPassword,
      verificationToken:( await randomBytes(32)).toString('hex'),
    });

    newUser = await newUser.save();

    const link = await this.generateLinke(
      newUser._id,
      newUser.verificationToken!,
    );

    await this.mailService.sendVerifyEmailTemplate(email, link);

    const msg =
      lang === 'ar'
        ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق للمتابعة'
        : 'Verification token has been sent to your email. Please verify your email to continue';

    return { message: msg, userData: registerUserDto };
  };
  //============================================================================
  //This one for Login user
  public async Login(loginDto: LoginDto,response: Response,lang: 'en' | 'ar' = 'en') {
    
    lang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, password } = loginDto;
    const errors: ValidationError[] = [];
    //التحقق من أن البريد مكتوب كصيغة إيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
      errors.push({
        field: 'email',
        message:
          lang === 'ar'
            ? 'صيغة البريد الإلكتروني غير صحيحة'
            : 'Invalid email format',
      });
    }
    //التحقق إذا كان المستخدم موجود
    const userFromDB = await this.userModul.findOne({ email });
    if (!userFromDB) {
      throw new BadRequestException({
        message:
          lang === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : 'Invalid email or password',
        errors: [
          {
            field: 'email',
            message:
              lang === 'ar'
                ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                : 'Invalid email or password',
          },
        ],
      });
    }

    //  التحقق من صحة كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, userFromDB.password);
    if (!isPasswordValid) {
      errors.push({
        field: 'password',
        message:
          lang === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : 'Invalid email or password',
      });
    }

    // إذا في أخطاء، رجعها
    if (errors.length > 0) {
      throw new BadRequestException({
        message:
          lang === 'ar'
            ? 'يوجد أخطاء في البيانات المُدخلة'
            : 'There are validation errors',
        errors,
      });
    }

    //  إنشاء الرموز وإعداد الكوكيز
    const AccessToken = await this.generateJWT({
      id: userFromDB._id,
      userType: userFromDB.role,
    });
    const RefreshToken = await this.generateRefreshToken({
      id: userFromDB._id,
      userType: userFromDB.role,
    });

      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

      response.cookie('refresh_token', RefreshToken, {
        httpOnly: true,
        sameSite: isProduction ? 'strict' : 'lax',
        secure: isProduction, // 🔥 بالـ localhost = false, بالسيرفر = true
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    const userLoginData = await this.userService.getCurrentUser(
      userFromDB._id,
      lang,
    );
    return { accessToken: AccessToken ,refreshToken: RefreshToken ,userData: userLoginData };
  };
  //============================================================================
  //This one for refresh token
  public async refreshAccessToken(request: RequestWithCookies, response: Response) {
    const lang =
      request.headers['lang'] === 'ar' || request.headers['language'] === 'ar'
        ? 'ar'
        : 'en';
      
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      const msg =
        lang === 'ar' ? 'رمز التحديث غير موجود' : 'Refresh token not found';
      throw new UnauthorizedException(msg);
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 1. إنشاء AccessToken و RefreshToken جديدين
      const newAccessToken = await this.generateJWT({
        id: payload.id,
        userType: payload.userType,
      });

      const newRefreshToken = await this.generateRefreshToken({
        id: payload.id,
        userType: payload.userType,
      });

      // 2. حفظ الـ refresh_token الجديد في الكوكيز
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      });

      // 3. إحضار بيانات المستخدم
      const user = await this.userService.getCurrentUser(payload.id, lang);
      // 4. رجوع البيانات
      return {
        accessToken: newAccessToken,
        userData: user,
      };
    } catch (err) {
      let msg = '';
      if (err.name === 'TokenExpiredError') {
        msg =
          lang === 'ar'
            ? 'انتهت صلاحية رمز التحديث'
            : 'Refresh token has expired';
      } else if (err.name === 'JsonWebTokenError') {
        msg = lang === 'ar' ? 'رمز التحديث غير صالح' : 'Invalid refresh token';
      } else {
        msg =
          lang === 'ar'
            ? 'فشل في التحقق من رمز التحديث'
            : 'Failed to verify refresh token';
      }

      throw new UnauthorizedException(msg);
    }
  };
  //============================================================================
  //This one for sent user code to user email
  public async SendResetPasswordCode(
    userEmail: string,
    lang: 'en' | 'ar' = 'en',
  ) {
    lang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const cleanedEmail = userEmail.trim().toLowerCase();
    const userFromDB = await this.userModul.findOne({email: cleanedEmail});
    if (!userFromDB) {
      const msg = lang === 'ar' ? 'المستخدم غير موجود' : 'User not found';
      throw new BadRequestException(msg);
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 2 * 60 * 1000);

    userFromDB.resetCode = resetCode;
    userFromDB.resetCodeExpiry = expiry;

    await userFromDB.save();

    await this.mailService.sendResetCodeEmail(userEmail, resetCode, lang);

    const successMsg =
      lang === 'ar'
        ? 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
        : 'Reset code has been sent to your email';

    return { message: successMsg ,
      UserName:userFromDB.fullName,
    };
  };
  //============================================================================
  //This one for reset password and create new one
  public async ResetPassword(
    resetPasswordDto: ResetPasswordDto,
    lang: 'en' | 'ar' = 'en',
  ) {
    lang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, newPassword, resetCode } = resetPasswordDto;

    const userFromDB = await this.userModul.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!userFromDB) {
      throw new BadRequestException(
        lang === 'ar' ? 'المستخدم غير موجود' : 'User not found',
      );
    }

    if (
      !userFromDB.resetCode ||
      userFromDB.resetCode !== resetCode ||
      !userFromDB.resetCodeExpiry ||
      new Date() > new Date(userFromDB.resetCodeExpiry)
    ) {
      throw new BadRequestException(
        lang === 'ar'
          ? 'رمز التحقق غير صالح أو منتهي'
          : 'Invalid or expired reset code',
      );
    }

    const hashedPassword = await this.hashPasswword(newPassword);
    userFromDB.password = hashedPassword;
    userFromDB.resetCode = undefined;
    userFromDB.resetCodeExpiry = undefined;

    await userFromDB.save();
    return {
      message:
        lang === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح'
          : 'Password changed successfully',
      userName: userFromDB.fullName,
    };
  };
  //============================================================================
  public async hashPasswword(password: string): Promise<string>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };
  //============================================================================
  public generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload ,{
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),});
  };
  //============================================================================
  public async generateRefreshToken(payload: JWTPayloadType): Promise<string> {
    return await this.jwtService.signAsync(payload,{
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  };
  //============================================================================
  private async generateLinke(userId: Types.ObjectId,verficationToken: string,) {
    return `${this.configService.get<string>('DOMAIN')}/api/user/verify-email/${userId}/${verficationToken}`;
  };
  //============================================================================
}