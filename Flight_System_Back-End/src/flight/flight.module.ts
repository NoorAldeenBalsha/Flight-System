import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { Flight, FlightSchema } from './schema/flight.schema';
import { UserModule } from 'src/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FlightStatusScheduler } from './flight-status.scheduler';
import { FlightArchive, FlightArchiveSchema } from './schema/flight-archive.schema';
import { FlightArchiveScheduler } from './flight-archive.scheduler';
import { TicketModule } from 'src/ticket/ticket.module';
import { Ticket, TicketSchema } from 'src/ticket/schema/ticket.schema';
import { ArchivedTicket, ArchivedTicketSchema } from 'src/ticket/schema/ticket-archive.schema';
import { FlightAnalyticsService } from './analytice/flight-analytice.service';
import { FlightAutoCreateScheduler } from './flight-auto-create.scheduler';

@Module({
  imports: [
    // Importing the schema to link it with Mongoose 
    MongooseModule.forFeature(
      [
        { name: Flight.name, schema: FlightSchema },
        { name: FlightArchive.name, schema: FlightArchiveSchema },
        { name: Ticket.name, schema: TicketSchema },
        { name: ArchivedTicket.name, schema: ArchivedTicketSchema },
      ]
    ),
    // If there is a need to access user information
    forwardRef(() => UserModule),
    forwardRef(() => TicketModule),
    ScheduleModule.forRoot(),
  ],
  controllers: [FlightController],
  providers: [FlightService,FlightStatusScheduler,FlightArchiveScheduler,FlightAnalyticsService,FlightAutoCreateScheduler],
  exports: [FlightService,MongooseModule,FlightAnalyticsService],
})
export class FlightModule {}