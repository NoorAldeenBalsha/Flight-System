import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { Ticket, TicketSchema } from './schema/ticket.schema';
import { TicketController } from './ticket.controller';
import { FlightModule } from '../flight/flight.module';
import { ArchivedTicket, ArchivedTicketSchema } from './schema/ticket-archive.schema';
import { AnalyticsTicketService } from './analytice/ticket-analytice.service';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: ArchivedTicket.name, schema: ArchivedTicketSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => FlightModule),
  ],
  controllers: [TicketController],
  providers: [TicketService,AnalyticsTicketService],
  exports: [TicketService,MongooseModule,AnalyticsTicketService],
})
export class TicketModule {}