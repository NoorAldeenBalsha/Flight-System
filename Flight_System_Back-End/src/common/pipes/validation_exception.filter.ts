import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const lang =
      ctx.getRequest().lang ||
      ctx.getRequest().headers['lang'] ||
      ctx.getRequest().headers['language'] ||
      'en';

    // نعدل رسائل الأخطاء حسب اللغة
    if (Array.isArray(exceptionResponse.message)) {
      exceptionResponse.message = exceptionResponse.message.map((msg: string) =>
        this.translateMessage(msg, lang),
      );
    } else if (typeof exceptionResponse.message === 'string') {
      exceptionResponse.message = this.translateMessage(
        exceptionResponse.message,
        lang,
      );
    }

    response.status(status).json(exceptionResponse);
  }

  private translateMessage(msg: string, lang: string): string {
    if (lang === 'ar') {
      if (msg.includes('Password must contain'))
        return 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم ورمز خاص';
      if (msg.includes('Password must be at least 8'))
        return 'كلمة المرور يجب أن تكون 8 محارف على الأقل وتحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة';
      if (msg.includes('Password is required'))
        return 'كلمة المرور مطلوبة';
    }

    // الافتراضي بالإنكليزي
    return msg;
  }
}