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
  @Cron(CronExpression.EVERY_SECOND)
async checkFlightStatuses() {
  try {
    const flightsData = await this.flightService.findAll();
    const flights = flightsData.data;
    const now = new Date();
    console.log("here")
    for (const flight of flights) {
      const departure = new Date(flight.departureTime);
      const arrival = new Date(flight.arrivalTime);

      if (
        now >= departure &&
        now < arrival &&
        flight.status !== 'took_off' 
      ) {
        await this.flightService.updateFlightStatus(
          flight._id,
          'took_off',
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