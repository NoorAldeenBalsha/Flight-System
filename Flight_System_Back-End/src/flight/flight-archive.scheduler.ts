import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight } from './schema/flight.schema';
import { FlightArchive } from './schema/flight-archive.schema';
import { Ticket } from 'src/ticket/schema/ticket.schema';
import { ArchivedTicket } from 'src/ticket/schema/ticket-archive.schema';

@Injectable()
export class FlightArchiveScheduler {
  constructor(
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    @InjectModel(FlightArchive.name) private flightArchiveModel: Model<FlightArchive>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(ArchivedTicket.name) private archivedTicketModel: Model<ArchivedTicket>,
      ) {}
    // A hourly  scheduled task to clean up and archive trips completed 24 hours after they end   
    @Cron(CronExpression.EVERY_HOUR)
    async archiveCompletedFlights() {
      const now = new Date();
      const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); 

      const flightsToArchive = await this.flightModel.find({
        status: 'completed',
        arrivalTime: { $lte: threshold },
      });

      for (const flight of flightsToArchive) {

        try {
          const tickets = await this.ticketModel.find({ flight: flight._id.toString() })

          for (const ticket of tickets) {

            if (ticket.status === 'sold') {
              try {
                const { _id, ...archivedTicketData } = ticket.toObject() as any;
                (archivedTicketData as any).archivedAt = new Date();

                const archivedTicket = new this.archivedTicketModel(archivedTicketData);
                await archivedTicket.save();
                await this.ticketModel.findByIdAndDelete(ticket._id);

              } catch (err) {
                console.error(`error archive ticket ${ticket._id}:`, err.message);
              }
            } else {
              try {
                await this.ticketModel.findByIdAndDelete(ticket._id);

              } catch (err) {
                console.error(`error delete ticket ${ticket._id}:`, err.message);
              }
            }
          }
          try {
            const { _id, ...archivedFlightData } = flight.toObject() as any;
            (archivedFlightData as any).archivedAt = new Date();

            const archivedFlight = new this.flightArchiveModel(archivedFlightData);
            await archivedFlight.save();

          } catch (err) {
            console.error(`error save flight ${flight.flightNumber}:`, err.message);
          }

          try {
            await this.flightModel.findByIdAndDelete(flight._id);
          } catch (err) {
            console.error( err.message);
          }
        } catch (error) {
          console.error( error);
        }
      }

    }
}