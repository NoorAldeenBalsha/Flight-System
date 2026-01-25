import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../schema/ticket.schema';
import { ArchivedTicket } from '../schema/ticket-archive.schema';

@Injectable()
export class AnalyticsTicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(ArchivedTicket.name) private archivedModel: Model<ArchivedTicket>,
  ) {}

  async getTicketAnalytics(): Promise<any> {
    try {
      const now = new Date();
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last12m = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const result = await this.ticketModel.aggregate([
        {
          $unionWith: { coll: 'archivedtickets' },
        },
        {
          $facet: {
            totalTickets: [{ $count: 'value' }],

            statusDistribution: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],

            revenueStats: [
              { $match: { status: 'sold' } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$price' },
                  avgPrice: { $avg: '$price' },
                  maxPrice: { $max: '$price' },
                },
              },
            ],

            topUsers: [
              { $match: { status: 'sold', userId: { $exists: true } } },
              { $group: { _id: '$userId', ticketsBought: { $sum: 1 } } },
              { $sort: { ticketsBought: -1 } },
              { $limit: 10 },
            ],
            seatNumber: [
                { $group: { _id: '$seatNumber', count: { $sum: 1 } } },
                ],

            archivedLast30d: [
              { $match: { archivedAt: { $gte: last30d } } },
              { $count: 'value' },
            ],

            soldLast30d: [
              {
                $match: {
                  status: 'sold',
                  createdAt: { $gte: last30d },
                },
              },
              { $count: 'value' },
            ],

            monthlyTrend: [
              {
                $match: {
                  status: 'sold',
                  createdAt: { $gte: last12m },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m', date: '$createdAt' },
                  },
                  sold: { $sum: 1 },
                  totalRevenue: { $sum: '$price' },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]);

      const data = result[0] || {};
      const getSingle = (x) => (Array.isArray(x) && x[0] ? x[0] : {});

      return {
        totalTickets: getSingle(data.totalTickets).value || 0,
        statusDistribution: data.statusDistribution || [],
        revenueStats: getSingle(data.revenueStats),
        topUsers: data.topUsers || [],
        seatNumber: data.seatNumber || [],
        archivedLast30d: getSingle(data.archivedLast30d).value || 0,
        soldLast30d: getSingle(data.soldLast30d).value || 0,
        monthlyTrend: data.monthlyTrend || [],
      };
    } catch (err) {
      console.error('Ticket analytics error:', err);
      throw new InternalServerErrorException('Failed to generate ticket analytics');
    }
  }
}