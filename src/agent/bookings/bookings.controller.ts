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
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentBookingsService } from './bookings.service';
import { ListAgentBookingsDto } from './dto/list-bookings.dto';
import { RejectAgentBookingDto } from './dto/reject-booking.dto';
import { StartAgentBookingDto } from './dto/start-booking.dto';
import { CompleteAgentBookingDto } from './dto/complete-booking.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.BOOKINGS)
export class AgentBookingsController {
  constructor(private readonly bookingsService: AgentBookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List available jobs or the agent own bookings' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListAgentBookingsDto,
  ) {
    return this.bookingsService.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Booking detail for an assigned or still-open job' })
  detail(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.detail(userId, id);
  }

  @Post(':id/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Claim an available job' })
  accept(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.accept(userId, id);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiOperation({ summary: 'Decline a job and return it to the open pool' })
  reject(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectAgentBookingDto,
  ) {
    return this.bookingsService.reject(userId, id, dto);
  }

  @Post(':id/arrived')
  @HttpCode(200)
  @ApiOperation({ summary: 'Tell the customer the agent is arriving' })
  arrived(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.arrived(userId, id);
  }

  @Post(':id/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start the service using the customer start OTP' })
  start(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: StartAgentBookingDto,
  ) {
    return this.bookingsService.start(userId, id, dto);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete the service and book the agent earning' })
  complete(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteAgentBookingDto,
  ) {
    return this.bookingsService.complete(userId, id, dto);
  }
}
