import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightModule } from './flight/flight.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentsModule } from './payments/payments.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FlightModule,
    TicketModule,
    UserModule,
    CloudinaryModule,
    PaymentsModule,
    
  ],
})
export class AppModule {}
