import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Ticket } from '../ticket/schema/ticket.schema';
import { User } from '../user/schema/user.schema';

@Injectable()
export class PaymentService {
  private client: paypal.core.PayPalHttpClient;

  constructor(
    configService: ConfigService,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    const clientId =configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret =configService.get<string>('PAYPAL_CLIENT_SECRET');
    const baseApiUrl = configService.get<string>('PAYPAL_BASE_API');

    if (!clientId || !clientSecret || !baseApiUrl) {
      throw new Error(' PayPal environment variables are missing');
    }

    const environment = baseApiUrl.includes('sandbox')
      ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
      : new paypal.core.LiveEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(environment);
  }
  //============================================================================
  async createPayPalOrder(userId: string, ticketId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new UnauthorizedException('User not found.');

      const ticket = await this.ticketModel.findById(ticketId);
      if (!ticket) throw new InternalServerErrorException('Ticket not found.');

      const invoiceId = `INV-${ticketId}-${Date.now()}`;


      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: ticket.price.toString(),
            },
            description: `Flight ticket ${ticket.seatNumber}`,
            custom_id: ticketId,
            invoice_id: invoiceId, 
          },
        ],
        application_context: {
          brand_name: 'Flight Reservation',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `http://localhost:3000/paymentSuccess?ticketId=${ticketId}&userId=${userId}`,
          cancel_url: 'http://localhost:3000/fail',
        },
      };

      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody(orderData);

      const response = await this.client.execute(request);

      ticket.status = 'pending';
      await ticket.save();

      return response.result;
    } catch (error) {
      console.error(' createPayPalOrder Error:', error);
      throw new InternalServerErrorException('Failed to create PayPal order.');
    }
  }
  //============================================================================
  async capturePayPalOrder(orderId: string, ticketId: string, userId: string) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.client.execute(request);

      if (response.result.status === 'COMPLETED') {

        await this.ticketModel.findByIdAndUpdate(ticketId, {
          status: 'sold',
          bookedBy: new mongoose.Types.ObjectId(userId),
        });
      } else {
        console.warn(' Payment not completed:', response.result.status);
      }

      return response.result;
    } catch (error) {
      if (
        error.message?.includes('DUPLICATE_INVOICE_ID') ||
        error.message?.includes('ORDER_ALREADY_CAPTURED')
      ) {
        console.warn(' Payment already processed, skipping duplicate.');
        return { status: 'COMPLETED', message: 'Order already processed.' };
      }

      console.error(' capturePayPalOrder Error:', error);
      throw new InternalServerErrorException('Failed to capture PayPal payment.');
    }
  }
  //============================================================================
}