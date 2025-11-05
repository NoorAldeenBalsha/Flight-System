import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Ticket, TicketSchema } from 'src/ticket/schema/ticket.schema';
import { JwtStrategy } from 'src/user/strategies/jwt.stategy';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from 'src/user/schema/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema }
    ]),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService,JwtStrategy,],
  exports: [PaymentService],
})
export class PaymentsModule {}