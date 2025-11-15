import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { Ticket, TicketSchema } from './schema/ticket.schema';
import { TranslationModule } from '../translation/translation.module'; 
import { TicketController } from './ticket.controller';
import { FlightModule } from '../flight/flight.module';
import { ArchivedTicket, ArchivedTicketSchema } from './schema/ticket-archive.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsTicketService } from './analytice/ticket-analytice.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: ArchivedTicket.name, schema: ArchivedTicketSchema },
    ]),
    forwardRef(() => FlightModule),
    TranslationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [TicketController],
  providers: [TicketService,AnalyticsTicketService],
  exports: [TicketService,MongooseModule,AnalyticsTicketService],
})
export class TicketModule {}