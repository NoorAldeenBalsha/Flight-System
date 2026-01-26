import {Controller,Get,Post,Patch,Delete,Param,Body,Query,UseGuards, Req,} from '@nestjs/common';
import { ApiTags,ApiOperation, ApiBearerAuth,ApiResponse,ApiQuery,ApiParam,} from '@nestjs/swagger';
import { FlightService } from './flight.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { AuthRolesGuard } from '../user/guard/auth-role.guard';
import { Roles } from '../user/decorator/user-role.decorator';
import { UserRole } from 'utilitis/enums';
import { FlightAnalyticsService } from './analytice/flight-analytice.service';

@ApiTags('Flights')
@Controller('api/flights')
export class FlightController {
  constructor(
    private readonly flightService: FlightService,
    private readonly flightAnalyticsService: FlightAnalyticsService,
  ) {}
  //============================================================================
  // Create a new trip [ Admin only ]
  @Post('create')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Only admin can create new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({ status: 400, description: 'Failed to enter trip data' })
  async create(@Body() createFlightDto: CreateFlightDto,@Req() req: any,) {
      const lang = req.lang || 'en';
      return await this.flightService.create(createFlightDto,lang);
  }
  //============================================================================
  // Fetch all trips with support for filtering, searching, and pagination
  @Get('list/getAllTrips')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.CABIN_CREW, UserRole.USER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all flights with optional filters and pagination' })
  @ApiQuery({ name: 'origin', required: false, example: 'DOH', description: 'Filter by origin airport code' })
  @ApiQuery({ name: 'destination', required: false, example: 'DXB', description: 'Filter by destination airport code' })
  @ApiQuery({ name: 'status', required: false, example: 'scheduled', description: 'Filter by flight status' })
  @ApiQuery({ name: 'fromDate', required: false, example: '2025-10-01', description: 'Filter flights after this date' })
  @ApiQuery({ name: 'toDate', required: false, example: '2025-10-31', description: 'Filter flights before this date' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of results per page' })
  @ApiResponse({ status: 200, description: 'List of flights with pagination' })
  async findAll(
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,) {
    return this.flightService.findAll({origin,destination,status,fromDate,toDate,page,limit,});
  }
  //============================================================================
  // Fetch a single trip by ID
  @Get(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary:' Fetch details of a specific trip by ID'})
  @ApiParam({ name: 'id', required: true, description: 'Trip ID' })
  @ApiResponse({ status: 200, description:'Flight data was successfully retrieved' })
  @ApiResponse({ status: 404, description:'The trip does not exist' })
  async findOne(@Param('id') id: string, @Req() req: any,) {
      const lang = req.lang || 'en';
      return this.flightService.findOne(id,lang);
  }
  //============================================================================
  // Update specific trip data
  @Patch(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update specific trip data (ADMIN only)' })
  @ApiParam({ name: 'id', description:'Trip ID to update' })
  @ApiResponse({ status: 200, description: 'The flight has been updated successfully' })
  @ApiResponse({ status: 404, description: 'The trip does not exist' })
  async update(@Param('id') id: string, @Body() updateFlightDto: UpdateFlightDto,@Req() req: any,) {
      const lang = req.lang || 'en';
      return this.flightService.update(id, updateFlightDto,lang);
  }
  //============================================================================
  // Delete a specific trip
  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete Trip (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'The ID of the trip to be deleted' })
  @ApiResponse({ status: 200, description: 'The trip has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'The trip does not exist' })
  async remove(@Param('id') id: string,@Req() req: any,) {
      const lang = req.lang || 'en';
      return this.flightService.remove(id,lang);
  }
  //============================================================================
   // analytices data for flights
  @Get('analytics/flights')
  @ApiOperation({ summary: 'Get comprehensive flight performance & operational analytics' })
  @ApiResponse({ status: 200,description: 'Flight analytics payload',})
  async getFlightAnalytics() {
    return this.flightAnalyticsService.getFlightAnalytics();
  }
  //============================================================================
}

