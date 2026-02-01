import {Injectable,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight, FlightDocument } from './schema/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';
import { TranslationService } from '../translation/translation.service';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class FlightService {

  constructor(
    @InjectModel(Flight.name)
    private readonly flightModel: Model<FlightDocument>,
    private readonly translationService: TranslationService,
    private readonly ticketService: TicketService,
  ) {}
  //============================================================================
  // Create a new trip
  async create(createFlightDto: CreateFlightDto, lang: 'en' | 'ar' = 'en'): Promise<Flight> {
    //  translation of the origin
    let originEn = createFlightDto.origin.en;
    let originAr = createFlightDto.origin.ar;

    if (originEn && !originAr) {
      // The user entered English only
      originAr = await this.translationService.translateText(originEn, 'ar');
    } else if (!originEn && originAr) {
      // The user entered Arabic only
      originEn = await this.translationService.translateText(originAr, 'en');
    }

    //  translation of the destination
    let destinationEn = createFlightDto.destination.en;
    let destinationAr = createFlightDto.destination.ar;

    if (destinationEn && !destinationAr) {
      destinationAr = await this.translationService.translateText(destinationEn, 'ar');
    } else if (!destinationEn && destinationAr) {
      destinationEn = await this.translationService.translateText(destinationAr, 'en');
    }

    // Create Flight
    const flight = new this.flightModel({
      ...createFlightDto,
      origin: { en: originEn, ar: originAr },
      destination: { en: destinationEn, ar: destinationAr },
      departureTime: new Date(createFlightDto.departureTime),
      arrivalTime: new Date(createFlightDto.arrivalTime),
    });

    const newFlight = await flight.save();

    // Check the id
    const flightId = (newFlight as any)?._id?.toString?.() ?? (newFlight as any).id ?? null;
    if (!flightId) 
      throw new BadRequestException({
          message: lang === 'ar'
            ? 'فشل في إنشاء الرحلة: المعرف _id مفقود بعد الحفظ'
            : 'Failed to create flight: missing _id after save',
        });

    //  Verify the aircraft type
    if (!newFlight.aircraftType) {
      throw new BadRequestException({
          message: lang === 'ar'
            ? 'يتعذر إنشاء التذاكر: نوع الطائرة مفقود'
            : 'Cannot generate tickets: aircraftType is missing',
        });
    }

    // Automatically create tickets after creating the trip
    await this.ticketService.generateTicketsForFlight(flightId, newFlight.aircraftType,lang);

    return newFlight;
  }
  //============================================================================
  // Fetch all trips with support for filtering, searching, and pagination
  async findAll(filters?:{origin?:string;destination?:string;flightType?:string;status?:string;fromDate?:string;toDate?:string;page?:number;limit?:number; 
}): Promise<{data: (Flight & { _id: string })[]; total: number; page: number;totalPages: number;}> {
  const query: any = {};
  // ===== Felter AR or EN for destination=====
  if (filters?.destination) {
    query.$or = [
      { 'destination.en': { $regex: filters.destination, $options: 'i' } },
      { 'destination.ar': { $regex: filters.destination, $options: 'i' } },
    ];
  }
  // ===== Felter AR or EN for origin=====
  if (filters?.origin) {
    query.$or = query.$or || [];
    query.$or.push(
      { 'origin.en': { $regex: filters.origin, $options: 'i' } },
      { 'origin.ar': { $regex: filters.origin, $options: 'i' } }
    );
  }
  // ===== Felter by status=====
    if (filters?.status) {
    query.status = filters.status;
  }
  // ===== Filter by Flight type=====
  if (filters?.flightType) {
    query.flightType = filters.flightType;
  }
  // ===== ...Filter by date (from-to)=====
  if (filters?.fromDate || filters?.toDate) {
    query.departureTime = {};
    if (filters.fromDate) {
      query.departureTime.$gte = new Date(filters.fromDate);
    }
    if (filters.toDate) {
      query.departureTime.$lte = new Date(filters.toDate);
    }
  }
  // Browsing settings
  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  const [flights, total] = await Promise.all([
    this.flightModel
      .find(query)
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean() 
      .exec(),
    this.flightModel.countDocuments(query),
  ]);

  const formattedFlights = flights.map((f) => ({
    ...f,
    _id: f._id.toString(),
  }));

  return {data: formattedFlights,total, page,totalPages: Math.ceil(total / limit),};
  }

  async findPublicFlights(filters?: {
  origin?: string;
  destination?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: (Flight & { _id: string })[];
  total: number;
  page: number;
  totalPages: number;
}> {

  // Force public-safe defaults
  const publicFilters = {
    ...filters,
    status: filters?.status ?? 'scheduled',
    flightType: 'public',
  };

  return this.findAll(publicFilters);
}

  //============================================================================
  // Fetch a single trip by ID
  async findOne(id: string, lang: 'en' | 'ar' = 'en'): Promise<Flight> {
    const flight = await this.flightModel.findById(id);
    if (!flight) {
      throw new NotFoundException({
        message: lang === 'ar'
          ? `لم يتم العثور على الرحلة التي تحمل المعرف ${id}.`
          : `Flight with ID ${id} not found.`,
      });
    }
    return flight;
  }
  //============================================================================
  // Update specific trip data
  async update(id: string,updateData: Partial<CreateFlightDto>,lang: 'en' | 'ar' = 'en'): Promise<Flight> {
  const flight = await this.flightModel.findById(id);
  if (!flight)
    throw new NotFoundException({
      message:
        lang === 'ar'
          ? `لم يتم العثور على الرحلة التي تحمل المعرف ${id}.`
          : `Flight with ID ${id} not found.`,
    });

  // ORIGIN TRANSLATION 
  if (updateData.origin) {
    let originEn = updateData.origin.en ?? flight.origin.en;
    let originAr = updateData.origin.ar ?? flight.origin.ar;

    if (updateData.origin.en && !updateData.origin.ar) {
      originAr = await this.translationService.translateText(originEn, 'ar');
    }

    if (!updateData.origin.en && updateData.origin.ar) {
      originEn = await this.translationService.translateText(originAr, 'en');
    }

    flight.origin = { en: originEn, ar: originAr };
  }

  //  DESTINATION TRANSLATION 
  if (updateData.destination) {
    let destinationEn = updateData.destination.en ?? flight.destination.en;
    let destinationAr = updateData.destination.ar ?? flight.destination.ar;

    if (updateData.destination.en && !updateData.destination.ar) {
      destinationAr = await this.translationService.translateText(
        destinationEn,
        'ar'
      );
    }

    if (!updateData.destination.en && updateData.destination.ar) {
      destinationEn = await this.translationService.translateText(
        destinationAr,
        'en'
      );
    }

    flight.destination = { en: destinationEn, ar: destinationAr };
  }

  // SIMPLE FIELDS UPDATE (exclude origin, destination) 
  const fieldsToUpdate = [
    'flightNumber',
    'departureTime',
    'arrivalTime',
    'status',
    'gate',
    'aircraftType',
    'airlineCode',
  ];

  fieldsToUpdate.forEach((field) => {
    if (updateData[field] !== undefined) {
      flight[field] = updateData[field];
    }
  });

  return flight.save();
}
  //============================================================================
  // Delete a specific trip
  async remove(id: string, lang: 'en' | 'ar' = 'en'): Promise<{ message: string }> {
    const deleted = await this.flightModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException({
        message: lang === 'ar'
          ? `لم يتم العثور على الرحلة التي تحمل المعرف ${id}.`
          : `Flight with ID ${id} not found.`,
      });
    }
    await this.ticketService.deleteTicketsByFlightId(id)
    return { 
       message: lang === 'ar'
          ? `تم حذف الرحلة ${deleted.flightNumber} بنجاح.`
          :  `Flight ${deleted.flightNumber} deleted successfully.` };
  }
  //============================================================================
  // Function to update status the trip
  async updateFlightStatus(id: string, status: string, lang: 'en' | 'ar' = 'en') {
  const updated = await this.flightModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).exec();

  if (!updated) {
    throw new NotFoundException({
        message: lang === 'ar'
          ? `لم يتم العثور على الرحلة التي تحمل المعرف ${id}.`
          : `Flight with ID ${id} not found.`,
      });
  }

  return updated;
  }
  //============================================================================
}