import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FlightService } from './flight.service';
import { CreateFlightDto } from './dto/create-flight.dto';


@Injectable()
export class FlightAutoCreateScheduler {
  constructor(
    @Inject(forwardRef(() => FlightService))
    private readonly flightService: FlightService,
  ) {}
  // ===================================================
  // Round Robin index
  private airportIndex = 0;
  @Cron(CronExpression.EVERY_HOUR) 
  async autoCreateFlights() {
    const flightData = this.generateFlightData();
    await this.flightService.create(flightData, 'en');
  }
  // ===================================================
  // Generate flight data
  private generateFlightData(): CreateFlightDto {
    const cities = [
      { en: 'Aleppo International Airport', ar: 'مطار حلب الدولي' },
      { en: 'Latakia International Airport', ar: 'مطار اللاذقية الدولي' },
      { en: 'Damascus International Airport', ar: 'مطار دمشق الدولي' },
      { en: 'Deir ez-Zor International Airport', ar: 'مطار دير الزور الدولي' },
      { en: 'Qamishli International Airport', ar: 'مطار قامشلي الدولي' },
    ];

    const aircrafts = ['boeing 777', 'airbus 320', 'boeing 737'];

    const { origin, destination } = this.getRandomAirportPair(cities);

    const departureTime = this.futureDate(2, 48);
    const durationMinutes = this.randomInt(60, 300);
    const arrivalTime = new Date(
      departureTime.getTime() + durationMinutes * 60000,
    );

    return {
      flightNumber: `NK-${Date.now().toString().slice(-6)}`,
      origin,
      destination,
      departureTime,
      arrivalTime,
      status: 'scheduled',
      aircraftType: this.randomFrom(aircrafts),
      airlineCode: 'NK',
      flightType: 'domestic',
      gate: `G${this.randomInt(1, 10)}`,
    };
  }
  // ===================================================
  // Helper
  private getRandomAirportPair(cities: any[]) {
  const originIndex = this.randomInt(0, cities.length - 1);

  let destinationIndex;
  do {
    destinationIndex = this.randomInt(0, cities.length - 1);
  } while (destinationIndex === originIndex);

  return {
    origin: cities[originIndex],
    destination: cities[destinationIndex],
  };
}

  private futureDate(minHours: number, maxHours: number) {
    const hours = this.randomInt(minHours, maxHours);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}