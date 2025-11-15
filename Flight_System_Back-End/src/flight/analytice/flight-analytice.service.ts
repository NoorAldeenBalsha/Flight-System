import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight } from '../schema/flight.schema';
import { FlightArchive } from '../schema/flight-archive.schema';

@Injectable()
export class FlightAnalyticsService {
  constructor(
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    @InjectModel(FlightArchive.name) private archiveModel: Model<FlightArchive>,
  ) {}
  //============================================================================
  async getFlightAnalytics(): Promise<any> {
    try {
      const now = new Date();
      const recent30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const data = await this.flightModel.aggregate([
        {
          $unionWith: {
            coll: 'flightarchives', 
          },
        },
        {
          $facet: {
            totalFlights: [{ $count: 'value' }],

            statusDistribution: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],

            flightTypeDistribution: [
              { $group: { _id: '$flightType', count: { $sum: 1 } } },
            ],

            airlineDistribution: [
              { $match: { airline: { $exists: true, $ne: null } } },
              { $group: { _id: '$airline', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            aircraftUsage: [
              { $match: { aircraftType: { $exists: true, $ne: null } } },
              { $group: { _id: '$aircraftType', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            popularOrigins: [
              { $group: { _id: '$origin.en', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            popularDestinations: [
              { $group: { _id: '$destination.en', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            delayStats: [
              { $match: { delayMinutes: { $exists: true, $gt: 0 } } },
              {
                $group: {
                  _id: null,
                  avgDelay: { $avg: '$delayMinutes' },
                  maxDelay: { $max: '$delayMinutes' },
                  delayedFlights: { $sum: 1 },
                },
              },
            ],

            durationStats: [
              {
                $match: {
                  duration: { $exists: true, $ne: null },
                },
              },
              {
                $project: {
                  durationMinutes: {
                    $toInt: {
                      $trim: {
                        input: {
                          $arrayElemAt: [
                            { $split: ['$duration', ' '] },
                            0,
                          ],
                        },
                      },
                    },
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  avgDuration: { $avg: '$durationMinutes' },
                  maxDuration: { $max: '$durationMinutes' },
                  minDuration: { $min: '$durationMinutes' },
                },
              },
            ],

            revenueStats: [
              { $match: { revenue: { $exists: true, $gte: 0 } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$revenue' },
                  avgRevenuePerFlight: { $avg: '$revenue' },
                },
              },
            ],

            archivedLast30d: [
              { $match: { archivedAt: { $gte: recent30 } } },
              { $count: 'value' },
            ],

            monthlyTrend: [{
                $match: {
                  createdAt: { $gte: last12Months },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m', date: '$createdAt' },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]);

      const result = data[0] || {};
      const single = (a) => (Array.isArray(a) && a[0] ? a[0] : {});

      return {
        totalFlights: single(result.totalFlights).value || 0,
        statusDistribution: result.statusDistribution || [],
        flightTypeDistribution: result.flightTypeDistribution || [],
        airlineDistribution: result.airlineDistribution || [],
        aircraftUsage: result.aircraftUsage || [],
        popularOrigins: result.popularOrigins || [],
        popularDestinations: result.popularDestinations || [],
        delayStats: single(result.delayStats),
        durationStats: single(result.durationStats),
        revenueStats: single(result.revenueStats),
        archivedLast30d: single(result.archivedLast30d).value || 0,
        monthlyTrend: result.monthlyTrend || [],
      };
    } catch (e) {
      console.error('Flight analytics error', e);
      throw new InternalServerErrorException('Failed to compute flight analytics');
    }
  }
  //============================================================================
}