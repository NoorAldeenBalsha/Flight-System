import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { Roles } from 'src/user/decorator/user-role.decorator';
import { UserRole } from 'utilitis/enums';

@ApiTags('Payment')
@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  //============================================================================
  //[For all user ]
  @Post('paypal')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.USER,UserRole.MANAGER,UserRole.PILOT)
  @ApiBearerAuth('JWT')
  createOrder( @Body() body: any,@Req() req: any,) {
    return this.paymentService.createPayPalOrder(req.user.id,body.ticketId);
  }
  //============================================================================
  //[for all user]
  @Post('paypal/capture')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.USER,UserRole.MANAGER,UserRole.PILOT)
  @ApiBearerAuth('JWT')
  captureOrder(@Body() body: any) {
    const { orderId,ticketId,userId } = body;
    return this.paymentService.capturePayPalOrder(orderId,ticketId,userId);
  }
  //============================================================================
}