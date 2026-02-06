import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FlightService } from './flight.service';


@Injectable()
@Injectable()
export class FlightStatusScheduler {
  constructor(
    @Inject(forwardRef(() => FlightService))
    private readonly flightService: FlightService,
  ) {}

  // Checks completed trips every minute
  @Cron(CronExpression.EVERY_SECOND, {
  timeZone: 'Asia/Damascus',
})
async checkFlightStatuses() {
  try {
    let page = 1;
    const limit = 10;
    let totalPages = 1;

    const now = new Date();

    do {
      const flightsData = await this.flightService.findAll({
        page,
        limit,
      });

      const flights = flightsData.data;
      totalPages = flightsData.totalPages;

      for (const flight of flights) {
        const departure = new Date(flight.departureTime);
        const arrival = new Date(flight.arrivalTime);

        let newStatus: string;

        if (now < departure) {
          newStatus = 'scheduled';
        } else if (now >= departure && now < arrival) {
          newStatus = 'took_off';
        } else if (now >= arrival) {
          newStatus = 'completed';
        } else {
          newStatus = 'cancelled';
        }

        if (flight.status !== newStatus) {
          await this.flightService.updateFlightStatus(
            flight._id,
            newStatus,
          );
        }
      }

      page++;
    } while (page <= totalPages);

  } catch (error) {
    console.error('Error checking flight statuses:', error.message);
  }
}
}