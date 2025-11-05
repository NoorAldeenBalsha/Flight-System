import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightModule } from './flight/flight.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentsModule } from './payments/payments.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FlightModule,
    UserModule,
    CloudinaryModule,
    PaymentsModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
