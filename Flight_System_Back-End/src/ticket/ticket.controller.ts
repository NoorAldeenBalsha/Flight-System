import { Controller, Get, Param, NotFoundException, Req, Post, Body } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket } from './schema/ticket.schema';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AnalyticsTicketService } from './analytice/ticket-analytice.service';

@ApiTags('Tickets')
@Controller('api/tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly analyticsTicketService: AnalyticsTicketService,
  ) {}
  //============================================================================
  // Get all ticket
  @Get('flight/:id')
  @ApiOperation({ summary:' Get all ticket '})
  @ApiParam({ name: 'id', required: true, description: 'Ticket ID' })
  @ApiResponse({ status: 200, description:'Tickets data was successfully retrieved' })
  @ApiResponse({ status: 404, description:'The tickets does not exist' })
  async getTicketsByFlight(@Param('id') flightId: string , @Req() req: any,): Promise<Ticket[]> {
    try {
      const tickets = await this.ticketService.getTicketsByFlight(flightId);
      return tickets;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
  //============================================================================
  // Fetch details of a specific ticket by ID
  @Get(':id')
  @ApiOperation({ summary:' Fetch details of a specific ticket by ID'})
  @ApiParam({ name: 'id', required: true, description: 'Ticket ID' })
  @ApiResponse({ status: 200, description:'Ticket data was successfully retrieved' })
  @ApiResponse({ status: 404, description:'The ticket does not exist' })
  async getTicketById(
    @Param('id') id: string,  
    @Req() req: any,){
    const lang = req.lang || 'en';
    return await this.ticketService.getTicketById(id,lang);
  }
  //============================================================================
  // This one for create panding ticket
  @Post('book')
  @ApiOperation({ summary: 'Reserve a ticket temporarily before payment' })
  async bookTicket(@Body() dto: CreateBookingDto,@Req() req: any,) {
    const lang = req.lang || 'en';
    return this.ticketService.createPendingTicket(dto);
  }
  //============================================================================
  // analytices data for tickets
  @Get('analytics/tickets')
  @ApiOperation({ summary: 'Get detailed ticket sales and financial analytics' })
  @ApiResponse({status: 200,description: 'Returns a complete ticket analytics summary',})
  async getTicketAnalytics() {
    return this.analyticsTicketService.getTicketAnalytics();
  }
}