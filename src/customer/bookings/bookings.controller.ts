import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CustomerBookingsService } from './bookings.service';
import { CancelCustomerBookingDto } from './dto/cancel-booking.dto';
import { CreateCustomerBookingDto } from './dto/create-booking.dto';
import { ListCustomerBookingsQueryDto } from './dto/list-bookings.dto';
import { RescheduleCustomerBookingDto } from './dto/reschedule-booking.dto';

@ApiTags('customer')
@CustomerAuth()
@Controller(ROUTES.CUSTOMER.BOOKINGS)
export class CustomerBookingsController {
  constructor(private readonly bookingsService: CustomerBookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking and its pending payment' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCustomerBookingDto,
  ) {
    return this.bookingsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Booking history, newest first' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListCustomerBookingsQueryDto,
  ) {
    return this.bookingsService.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Full booking detail' })
  detail(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.detail(userId, id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a booking that has not started yet' })
  cancel(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelCustomerBookingDto,
  ) {
    return this.bookingsService.cancel(userId, id, dto);
  }

  @Post(':id/reschedule')
  @HttpCode(200)
  @ApiOperation({ summary: 'Move a booking to another date and time' })
  reschedule(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleCustomerBookingDto,
  ) {
    return this.bookingsService.reschedule(userId, id, dto);
  }

  @Get(':id/agent')
  @ApiOperation({ summary: 'Assigned agent for a booking' })
  agent(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.agent(userId, id);
  }
}
