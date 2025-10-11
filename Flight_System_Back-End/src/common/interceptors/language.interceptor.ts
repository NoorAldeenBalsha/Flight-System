import {Injectable,NestInterceptor,ExecutionContext,CallHandler,} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const rawLang = request.headers['lang'] || request.headers['language'];
    const lang = typeof rawLang === 'string' && rawLang.toLowerCase() === 'ar' ? 'ar' : 'en';

    request.lang = lang;

    return next.handle();
  }
}