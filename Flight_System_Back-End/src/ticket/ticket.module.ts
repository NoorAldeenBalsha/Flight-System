import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { Ticket, TicketSchema } from './schema/ticket.schema';
import { TranslationModule } from '../translation/translation.module'; 
import { TicketController } from './ticket.controller';
import { FlightModule } from '../flight/flight.module';
import { ArchivedTicket, ArchivedTicketSchema } from './schema/ticket-archive.schema';
import { ScheduleModule } from '@nestjs/schedule';


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
  providers: [TicketService],
  exports: [TicketService,MongooseModule],
})
export class TicketModule {}