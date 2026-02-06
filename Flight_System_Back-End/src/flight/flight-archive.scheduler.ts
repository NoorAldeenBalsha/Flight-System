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
    @Cron(CronExpression.EVERY_MINUTE, {
  timeZone: 'Asia/Damascus',
})
async archiveCompletedFlights() {
  try {
    const now = new Date();
    const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let page = 1;
    const limit = 10;
    let totalPages = 1;

    do {
      const flightsPage = await this.flightModel
        .find({
          status: 'completed',
          arrivalTime: { $lte: threshold },
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const total = await this.flightModel.countDocuments({
        status: 'completed',
        arrivalTime: { $lte: threshold },
      });

      totalPages = Math.ceil(total / limit);

      for (const flight of flightsPage) {
        try {
          // =======================
          // Archive Tickets
          // =======================
          const tickets = await this.ticketModel.find({
            flight: flight._id.toString(),
          });

          for (const ticket of tickets) {
            if (ticket.status === 'sold') {
              const { _id, ...archivedTicketData } =
                ticket.toObject() as any;

              archivedTicketData.archivedAt = new Date();

              await new this.archivedTicketModel(
                archivedTicketData,
              ).save();
            }

            await this.ticketModel.findByIdAndDelete(ticket._id);
          }

          // =======================
          // Archive Flight
          // =======================
          const { _id, ...archivedFlightData } =
            flight.toObject() as any;

          archivedFlightData.archivedAt = new Date();

          await new this.flightArchiveModel(
            archivedFlightData,
          ).save();

          // =======================
          // Remove Original Flight
          // =======================
          await this.flightModel.findByIdAndDelete(flight._id);

        } catch (err) {
          console.error(
            `Archive error for flight ${flight.flightNumber}:`,
            err.message,
          );
        }
      }

      page++;
    } while (page <= totalPages);

  } catch (error) {
    console.error('Archive scheduler error:', error.message);
  }
}
}