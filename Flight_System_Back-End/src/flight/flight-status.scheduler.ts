import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FlightService } from './flight.service';


@Injectable()
export class FlightStatusScheduler {

  constructor(private readonly flightService: FlightService) {}

  // Checks completed trips every minute
  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkCompletedFlights() {
    try {
      const flightsData = await this.flightService.findAll(); 
      const flights = flightsData.data;
      const now = new Date();

      for (const flight of flights) {
        const arrival = new Date(flight.arrivalTime);
       // Verify if the trip has ended in terms of time and has not been marked as completed yet
        if (now >= arrival && flight.status !== 'completed') {
          await this.flightService.updateFlightStatus(flight._id, 'completed');
        }
      }
    } catch (error) {
      console.log('Error checking completed flights', error.stack);
    }
  }
}