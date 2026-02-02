import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FlightService } from './flight.service';


@Injectable()
export class FlightStatusScheduler {

  constructor(private readonly flightService: FlightService) {}

  // Checks completed trips every minute
  @Cron(CronExpression.EVERY_SECOND)
async checkFlightStatuses() {
  try {
    const flightsData = await this.flightService.findAll();
    const flights = flightsData.data;
    const now = new Date();

    for (const flight of flights) {
      const departure = new Date(flight.departureTime);
      const arrival = new Date(flight.arrivalTime);

      if (
        now >= departure &&
        now < arrival &&
        flight.status !== 'took off' 
      ) {
        await this.flightService.updateFlightStatus(
          flight._id,
          'took off',
        );
        continue;
      }

      if (now >= arrival && flight.status !== 'completed') {
        await this.flightService.updateFlightStatus(
          flight._id,
          'completed',
        );
      }
    }
  } catch (error) {
    console.log('Error checking flight statuses', error.stack);
  }
}
}