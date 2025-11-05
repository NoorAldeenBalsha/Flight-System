import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Ticket,  } from './schema/ticket.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class TicketService {
  
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
  ) {}
  //============================================================================
  //This one for Create Tickets automatic
  async generateTicketsForFlight(flightId: string, aircraftType: string, lang: 'en' | 'ar' = 'en') {
  try {
    const { v4: uuidv4 } = await import('uuid');

    let seatCount = 150;
    let basePrice = 300;

    switch (aircraftType.toLowerCase()) {
      case 'boeing 777':
        seatCount = 300;
        basePrice = 500;
        break;
      case 'airbus a320':
        seatCount = 180;
        basePrice = 250;
        break;
      case 'boeing 737':
        seatCount = 160;
        basePrice = 280;
        break;
      default:
        seatCount = 150;
        basePrice = 200;
    }

    const tickets :Partial<Ticket>[]=[];
    const seatLayout = ['A', 'B', 'C', 'D', 'E', 'F'];
    let row = 1;

    for (let i = 0; i < seatCount; i++) {
      const seatLetter = seatLayout[i % seatLayout.length];
      if (i % seatLayout.length === 0 && i !== 0) row++;

      const seatSideEn = ['A', 'B', 'C'].includes(seatLetter) ? 'left' : 'right';
      const seatSideAr = seatSideEn === 'left' ? 'يسار' : 'يمين';

      let seatPositionEn: 'window' | 'aisle' | 'middle';
      if (seatLetter === 'A' || seatLetter === 'F') seatPositionEn = 'window';
      else if (seatLetter === 'C' || seatLetter === 'D') seatPositionEn = 'aisle';
      else seatPositionEn = 'middle';

      const seatPositionAr =
        seatPositionEn === 'window'
          ? 'نافذة'
          : seatPositionEn === 'aisle'
          ? 'ممر'
          : 'وسط';

      let seatClassEn: 'business' | 'premium' | 'economy';
      if (row <= 5) seatClassEn = 'business';
      else if (row <= 10) seatClassEn = 'premium';
      else seatClassEn = 'economy';

      const seatClassAr =
        seatClassEn === 'business'
          ? 'رجال الأعمال'
          : seatClassEn === 'premium'
          ? 'الدرجة الممتازة'
          : 'الدرجة الاقتصادية';

      const price =
        seatClassEn === 'business'
          ? basePrice * 3
          : seatClassEn === 'premium'
          ? basePrice * 2
          : basePrice;

      const seatNumber = `${row}${seatLetter}`;

       const status = 'available';
      const bookingReference = `${flightId}-${seatNumber}-${uuidv4().slice(0, 6)}`;

      tickets.push({
        flight: flightId,
        seatNumber,
        row,
        seatLetter,
        seatClass: { en: seatClassEn, ar: seatClassAr },
        seatSide: { en: seatSideEn, ar: seatSideAr },
        seatPosition: { en: seatPositionEn, ar: seatPositionAr },
        price,
        status,
        bookingReference, 
      });
    }

    const createdTickets = await this.ticketModel.insertMany(tickets);

    return {
      flightId,
      totalSeats: createdTickets.length,
      seats: createdTickets.map((t) => ({
        _id: t._id,
        seatNumber: t.seatNumber,
        seatClass: t.seatClass,
        seatSide: t.seatSide,
        seatPosition: t.seatPosition,
        status: t.status,
      })),
    };
  } catch (error) {
    console.error(' Failed to generate tickets', error);
    throw new BadRequestException({
      message:
        lang === 'ar' ? 'فشل إنشاء التذاكر' : 'Failed to generate tickets',
    });
  }
  }
  //============================================================================
  //This one for Get All Tickets 
  async getTicketsByFlight(flightId: string ,lang: 'en' | 'ar' = 'en'): Promise<any> {
  try {
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      throw new BadRequestException('Invalid flightId');
    }

    const tickets = await this.ticketModel
      .find({ flight: flightId })
      .select('-__v -createdAt -updatedAt')
      .lean()
      .exec();

    if (!tickets || tickets.length === 0) {
      throw new NotFoundException({
        message: 'No tickets were found for this flight.',
      });
    }

    tickets.sort((a, b) => {
      const rowA = a.row ?? 0;
      const rowB = b.row ?? 0;
      const letterA = a.seatLetter ?? '';
      const letterB = b.seatLetter ?? '';
      return rowA === rowB ? letterA.localeCompare(letterB) : rowA - rowB;
    });

    const formatted = {
      flightId,
      totalSeats: tickets.length,
      availableSeats: tickets.filter((t) => t.status === 'available').length,
      reservedSeats: tickets.filter((t) => t.status === 'pending').length,
      soldSeats: tickets.filter((t) => t.status === 'sold').length,

      seats: tickets.map((t) => ({
        _id: t._id,
        seatNumber: t.seatNumber,
        seatLetter: t.seatLetter,
        row: t.row,

        seatClass: {
          en: t.seatClass?.en || t.seatClass || 'unknown',
          ar:
            t.seatClass?.ar ||
            (t.seatClass?.en === 'business'
              ? 'درجة رجال الأعمال'
              : t.seatClass?.en === 'premium'
              ? 'الدرجة الممتازة'
              : t.seatClass?.en === 'economy'
              ? 'الدرجة السياحية'
              : 'غير معروف'),
        },

        seatSide: {
          en: t.seatSide?.en || t.seatSide || 'unknown',
          ar:
            t.seatSide?.ar ||
            (t.seatSide?.en === 'left'
              ? 'يسار'
              : t.seatSide?.en === 'right'
              ? 'يمين'
              : 'غير معروف'),
        },

        seatPosition: {
          en: t.seatPosition?.en || t.seatPosition || 'unknown',
          ar:
            t.seatPosition?.ar ||
            (t.seatPosition?.en === 'window'
              ? 'نافذة'
              : t.seatPosition?.en === 'aisle'
              ? 'ممر'
              : t.seatPosition?.en === 'middle'
              ? 'وسط'
              : 'غير معروف'),
        },

        price: t.price,
        status: t.status, 
        bookingReference: t.bookingReference,
      })),

      layout: Object.values(
        tickets.reduce((acc, t) => {
          const row = t.row ?? 0;
          if (!acc[row]) acc[row] = { row, seats: [] };

          acc[row].seats.push({
            _id: t._id,
            seatNumber: t.seatNumber,
            seatLetter: t.seatLetter,
            seatClass: {
              en: t.seatClass?.en || t.seatClass || 'unknown',
              ar:
                t.seatClass?.ar ||
                (t.seatClass?.en === 'business'
                  ? 'درجة رجال الأعمال'
                  : t.seatClass?.en === 'premium'
                  ? 'الدرجة الممتازة'
                  : t.seatClass?.en === 'economy'
                  ? 'الدرجة السياحية'
                  : 'غير معروف'),
            },
            seatSide: {
              en: t.seatSide?.en || t.seatSide || 'unknown',
              ar:
                t.seatSide?.ar ||
                (t.seatSide?.en === 'left'
                  ? 'يسار'
                  : t.seatSide?.en === 'right'
                  ? 'يمين'
                  : 'غير معروف'),
            },
            seatPosition: {
              en: t.seatPosition?.en || t.seatPosition || 'unknown',
              ar:
                t.seatPosition?.ar ||
                (t.seatPosition?.en === 'window'
                  ? 'نافذة'
                  : t.seatPosition?.en === 'aisle'
                  ? 'ممر'
                  : t.seatPosition?.en === 'middle'
                  ? 'وسط'
                  : 'غير معروف'),
            },price: t.price,
            status: t.status,
          });

          return acc;
        }, {} as Record<number, any>)
      ),
    };

    return formatted;
  } catch (error) {
    console.error(' Error fetching tickets:', error);
    throw new InternalServerErrorException({
      message:
        lang === 'ar'
          ? 'حدث خطأ أثناء جلب التذاكر'
          : 'An error occurred while fetching the tickets.',
    });
  }
  }
  //============================================================================
  //This one for Get Ticket by id
  async getTicketById(ticketId: string,lang): Promise<Ticket> {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new NotFoundException(' Invalid ticket ID');
    }
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) {
      throw new NotFoundException(
        {message: lang === 'ar'
            ? ` لم اجد بطاقة تحمل هذا المعرف : ${ticketId}`
            : ` Ticket not found with ID: ${ticketId}`,
        });
    }
    return ticket;
  }
  //============================================================================
  //This one for delete tickets
  async deleteTicketsByFlightId(flightId: string): Promise<void> {
    try {
      const objectId = flightId;
      const result = await this.ticketModel.deleteMany({
        $or: [
          { flight: objectId },
          { flightId: objectId },
        ],
      });
    } catch (error) {
      throw new Error('Failed to delete tickets for the flight');
    }
  }
  // This one for create panding ticket
  async createPendingTicket(dto: CreateBookingDto) {


    const seat = await this.ticketModel.findById(dto.seatId);
    if (!seat) throw new NotFoundException('Seat not found');
    if (seat.status !== 'available')
      throw new BadRequestException('Seat is not available for booking');


    seat.bookedBy = dto.userId;
    seat.seatNumber = dto.seatNumber;
    seat.seatLetter = dto.seatLetter;
    seat.seatClass = dto.seatClass;
    seat.seatSide = dto.seatSide;
    seat.seatPosition = dto.seatPosition;
    seat.price = dto.price;
    seat.status = 'pending';
    seat['pendingAt'] = new Date();

    const updatedSeat = await seat.save();

    return {
      success: true,
      message: 'Seat reserved temporarily, proceed to payment',
      ticket: updatedSeat,
    };
  }
  //============================================================================
}