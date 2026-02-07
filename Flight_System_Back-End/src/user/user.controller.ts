import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import type { JWTPayloadType } from 'utilitis/types';
import type { Request, Response } from 'express';
import { AuthRolesGuard } from './guard/auth-role.guard';
import { Roles } from './decorator/user-role.decorator';
import { UserRole } from 'utilitis/enums';
import { ParseObjectIdPipe  } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import type { RequestWithCookies } from 'utilitis/interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { UserAnalyticsService } from './analytice/user-analytice.service';

@ApiTags('Users')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAnalyticsService: UserAnalyticsService,
  ) {}
  //============================================================================
  //Register a new user [Public]
  @Post('auth/register')
  @ApiBody({ description: 'Register User DTO', type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  public Register(
    @Body() createUserDto: RegisterUserDto,
    @Req() req: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.Register(createUserDto, lang);
  }
  //============================================================================
  //Login user and issue access/refresh tokens [Public]
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Login User DTO', type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async Login(
    @Body() loginUser: LoginDto,
    @Res({ passthrough: true }) response:Response,
    @Req() req: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.Login(loginUser, response, lang);
  }
  //============================================================================
  //Get details of the currently authenticated user [Any logged-in user]
  @Get('current-user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  public getCurrentUser(
    @CurrentUser() userPayload: JWTPayloadType,
    @Req() req?: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.getCurrentUser(userPayload.id, lang);
  }
  //============================================================================
  //Get user by Id [Any logged-in user]
  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get user by Id' })
  @ApiResponse({ status: 200, description: 'user retrieved successfully' })
  public getUserbyId(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req?: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.getUserbyId(id, lang);
  }
  //============================================================================
  //Login with google account [Public]
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with google account' })
  @ApiResponse({ status: 200, description: 'Operation is success' })
  async googleLogin(
    @Body('credential') credential: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const lang = req.headers['lang'] === 'ar' || req.headers['language'] === 'ar' ? 'ar' : 'en';

    if (!credential) {
      throw new BadRequestException(
        lang === 'ar' ? 'رمز جوجل مطلوب' : 'Google token is required',
      );
    }

    try {
      const loginData = await this.userService.loginWithGoogle(credential, res);
      return {
        message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful',
        accessToken: loginData.accessToken,
        userData: {
          fullName: loginData.user.fullName,
          email: loginData.user.email,
          picture: loginData.user.picture,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.response || error.message);
    }
  } 
  //============================================================================
  //Callback  Google [Public]
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback  Google' })
  @ApiResponse({ status: 200, description: 'Operation is success' })
  async googleAuthRedirect(
     @Res({ passthrough: true }) res: Response,
    @Req() req
   ) {
    const data = await this.userService.loginWithGoogle(req.user,res);

    return this.userService.loginWithGoogle(req.user,res);
  }
  //============================================================================
  //Logout user and clear the refresh token cookie [Public]
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  public logout(
    @Res({ passthrough: true }) response: Response,
    @Req() req: any
  ) {
    const lang = req.lang || 'en';
    return this.userService.logout(response, req, lang);
  }
  //============================================================================
  //Issue a new access token using the refresh token from cookies [Public]
  @Get('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'New access token generated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refreshAccessToken(
    @Req() request:any,
    @Res({ passthrough: true }) response: Response
  ) {
    console.log("i'm here");
    console.log(request.cookies);

    return await this.userService.refreshAccessToken(request, response);
  }
  //============================================================================
  //Send reset password code to email [Public]
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Forgot Password DTO', type: ForgotPasswordDto})
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  public forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: any) {
    const lang = req.lang || 'en';
    return this.userService.sendRestPassword(body, lang);
  }
  //============================================================================
  //Reset password using code/token [Public]
  @Post('reset-password')
  @ApiBody({ description: 'Reset Password DTO', type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  public resetPassword(@Body() body: ResetPasswordDto, @Req() req: any) {
    const lang = req.lang || 'en';
    return this.userService.resetPassword(body, lang);
  }
  //============================================================================
  //Email verification endpoint after registration [Public]
  @Get('verify-email/:id/:verificationToken')
  @ApiExcludeEndpoint()
  public verifyEmail(
    @Param('id') id: Types.ObjectId,
    @Param('verificationToken') verificationToken: string,
    @Req() req?: any
  ) {
    const lang = req.lang || 'en';
    return this.userService.verifyEmail(id, verificationToken, lang);
  }
  //============================================================================
  //Get list of all users with filters and pagination [Admin ,Manager]
  @Get()
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN,UserRole.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  public getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Req() req?: any
  ) {
    const lang = req.lang || 'en';
    return this.userService.getAllUsers(+page, +limit, search, role, lang);
  }
  //============================================================================
  //Update user data [Admin  or current user]
  @Patch('update/:id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update user information (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only ADMIN allowed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.update(id, payload, updateUserDto, lang);
  }
  //============================================================================
  //Delete user  [Admin ]
  @Delete('delete/:id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only ADMIN allowed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async deleteUser(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() payload: JWTPayloadType,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.deleteUser(id, payload, lang);
  }
  //============================================================================
  // analytices data for users [Public]
  @Get('analytices/user')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN,UserRole.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({summary: 'Comprehensive user analytics',  })
  @ApiResponse({status: 200,description: 'Successfully retrieved user analytics.',})
  async getUserAnalytices(){
    return this.userAnalyticsService.getUserAnalytics();
  }
}
