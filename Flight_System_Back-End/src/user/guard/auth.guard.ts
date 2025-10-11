import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTPayloadType } from "utilitis/types";
import { ConfigService } from '@nestjs/config';
import { CURRNET_USER_KEY } from "utilitis/constants";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')? authHeader.split(' ')[1]: null;
    const tokenFromCookie = request.cookies?.['access_token'] || request.cookies?.['refresh_token'];
    const token = tokenFromHeader || tokenFromCookie;
    if (!token) {throw new UnauthorizedException('Access denied, No Token Provided');}
    try {
      const payload: JWTPayloadType = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request[CURRNET_USER_KEY] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Access denied, Invalid token');
    }
  } 
}