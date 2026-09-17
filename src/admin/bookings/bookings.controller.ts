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
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AdminBookingsService } from './bookings.service';
import { ListAdminBookingsDto } from './dto/list-bookings.dto';
import { AssignAdminBookingAgentDto } from './dto/assign-agent.dto';
import { ReassignAdminBookingAgentDto } from './dto/reassign-agent.dto';
import { CancelAdminBookingDto } from './dto/cancel-booking.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.BOOKINGS)
export class AdminBookingsController {
  constructor(private readonly bookingsService: AdminBookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List bookings with customer, agent and amounts' })
  list(@Query() query: ListAdminBookingsDto) {
    return this.bookingsService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Full booking detail including payment and history',
  })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.detail(id);
  }

  @Post(':id/assign-agent')
  @HttpCode(200)
  @ApiOperation({ summary: 'Put an agent on an unassigned booking' })
  assignAgent(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAdminBookingAgentDto,
  ) {
    return this.bookingsService.assignAgent(adminId, id, dto);
  }

  @Post(':id/reassign-agent')
  @HttpCode(200)
  @ApiOperation({ summary: 'Move a booking to a different agent' })
  reassignAgent(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReassignAdminBookingAgentDto,
  ) {
    return this.bookingsService.reassignAgent(adminId, id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a booking and settle its payment' })
  cancel(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelAdminBookingDto,
  ) {
    return this.bookingsService.cancel(adminId, id, dto);
  }
}
