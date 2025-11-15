import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';

@Injectable()
export class UserAnalyticsService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}
    //============================================================================
    //  Returns a comprehensive demographic & activity analytics object.
    async getUserAnalytics(): Promise<any> {
        try {
        const now = new Date();
        const recent7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recent30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1); 

        const agg = await this.userModel.aggregate([
            {
            $facet: {
                totalUsers: [{ $count: 'value' }],

                roleDistribution: [
                { $group: { _id: '$role', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                ],

                verifiedStats: [
                { $group: { _id: '$isAccountverified', count: { $sum: 1 } } },
                ],

                recentSignups: [
                { $match: { createdAt: { $gte: recent7 } } },
                { $count: 'value' },
                ],

                activeUsers30d: [
                { $match: { lastLogin: { $gte: recent30 } } },
                { $count: 'value' },
                ],

                genderDistribution: [
                { $group: { _id: '$gender', count: { $sum: 1 } } },
                ],

                birthCountryDistribution: [
                { $match: { birthCountry: { $exists: true, $ne: null } } },
                { $group: { _id: '$birthCountry', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 },
                ],

                residenceCountryDistribution: [
                { $match: { residenceCountry: { $exists: true, $ne: null } } },
                { $group: { _id: '$residenceCountry', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 },
                ],

                // age statistics and buckets
                ageStats: [
                {
                    $match: { dateOfBirth: { $exists: true, $ne: null } },
                },
                {
                    $project: {
                    age: {
                        $floor: {
                        $divide: [
                            { $subtract: [now, '$dateOfBirth'] },
                            1000 * 60 * 60 * 24 * 365,
                        ],
                        },
                    },
                    },
                },
                {
                    $group: {
                    _id: null,
                    min: { $min: '$age' },
                    max: { $max: '$age' },
                    avg: { $avg: '$age' },
                    medianArray: { $push: '$age' },
                    },
                },
                // compute median server-side after pipeline (we'll do simple median extraction in JS below)
                ],

                ageBuckets: [
                {
                    $match: { dateOfBirth: { $exists: true, $ne: null } },
                },
                {
                    $project: {
                    age: {
                        $floor: {
                        $divide: [
                            { $subtract: [now, '$dateOfBirth'] },
                            1000 * 60 * 60 * 24 * 365,
                        ],
                        },
                    },
                    },
                },
                {
                    $bucket: {
                    groupBy: '$age',
                    boundaries: [0, 18, 25, 35, 45, 60, 200],
                    default: 'unknown',
                    output: { count: { $sum: 1 } },
                    },
                },
                ],

                // signup trend per month (last 12 months)
                signupTrend: [
                { $match: { createdAt: { $gte: last12Months } } },
                {
                    $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                ],

                // login activity (daily counts last 30 days)
                loginActivity30d: [
                { $match: { lastLogin: { $gte: recent30 } } },
                {
                    $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
                    count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                ],

                // accounts not verified & maybe old
                unverifiedOld: [
                {
                    $match: {
                    isAccountverified: false,
                    createdAt: { $lte: recent30 }, // created more than 30 days ago
                    },
                },
                { $count: 'value' },
                ],

                // top countries combined (birth+residence) for quick view
                topCountriesCombined: [
                {
                    $project: {
                    countries: [
                        { $ifNull: ['$birthCountry', null] },
                        { $ifNull: ['$residenceCountry', null] },
                    ],
                    },
                },
                { $unwind: '$countries' },
                { $match: { countries: { $ne: null } } },
                {
                    $group: {
                    _id: '$countries',
                    count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 20 },
                ],
            },
            },
        ]);

        const result = agg[0] || {};

        // massage age median if available
        let ageMedian = null;
        if (result.ageStats && result.ageStats[0]) {
            const stat = result.ageStats[0];
            if (Array.isArray(stat.medianArray)) {
            const arr = stat.medianArray.filter((v) => typeof v === 'number').sort((a, b) => a - b);
            if (arr.length > 0) {
                const mid = Math.floor(arr.length / 2);
                ageMedian = arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
            }
            }
            // replace medianArray with simple median number
            stat.median = ageMedian;
            delete stat.medianArray;
        }

        // helper to safely extract counts
        const singleCount = (arr) => (Array.isArray(arr) && arr[0] ? arr[0].value || 0 : 0);

        const out = {
            totalUsers: singleCount(result.totalUsers),
            roleDistribution: result.roleDistribution || [],
            verifiedStats: result.verifiedStats || [],
            recentUsers7d: singleCount(result.recentSignups),
            activeUsers30d: singleCount(result.activeUsers30d),
            genderDistribution: result.genderDistribution || [],
            birthCountryDistribution: result.birthCountryDistribution || [],
            residenceCountryDistribution: result.residenceCountryDistribution || [],
            ageSummary: result.ageStats && result.ageStats[0]
            ? {
                min: result.ageStats[0].min ?? null,
                max: result.ageStats[0].max ?? null,
                avg: result.ageStats[0].avg ? Number(result.ageStats[0].avg.toFixed(2)) : null,
                median: ageMedian,
                }
            : null,
            ageBuckets: result.ageBuckets || [],
            signupTrendLast12Months: result.signupTrend || [],
            loginActivityLast30Days: result.loginActivity30d || [],
            unverifiedOldAccounts: singleCount(result.unverifiedOld),
            topCountriesCombined: result.topCountriesCombined || [],
        };

        return out;
        } catch (error) {
        console.error('User analytics error', error);
        throw new InternalServerErrorException('Failed to compute user analytics');
        }
    }
    //============================================================================
}