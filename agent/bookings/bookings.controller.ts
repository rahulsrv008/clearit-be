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
import { ChecklistService } from 'src/common/services/checklist.service';
import { EnhancedBookingService } from './enhanced-booking.service';
import { ListAgentBookingsDto } from './dto/list-bookings.dto';
import { RejectAgentBookingDto } from './dto/reject-booking.dto';
import { StartAgentBookingDto } from './dto/start-booking.dto';
import { CompleteAgentBookingDto } from './dto/complete-booking.dto';
import { CompleteChecklistItemDto } from './dto/checklist.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.BOOKINGS)
export class AgentBookingsController {
  constructor(
    private readonly bookingsService: AgentBookingsService,
    private readonly checklistService: ChecklistService,
    private readonly enhancedBookingService: EnhancedBookingService,
  ) {}

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

  // ===================== CHECKLIST ENDPOINTS =====================

  @Get(':id/checklist')
  @ApiOperation({ summary: 'Get current checklist progress for a booking' })
  async getChecklist(
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    // Self-healing: bookings accepted before the checklist system existed
    // (or any other edge case where accept() didn't initialize one) get a
    // checklist created lazily on first view instead of showing nothing.
    let progress = await this.checklistService.getBookingChecklistProgress(bookingId);
    if (!progress) {
      await this.enhancedBookingService.onBookingAccepted(bookingId);
      progress = await this.checklistService.getBookingChecklistProgress(bookingId);
    }
    return progress;
  }

  @Post(':bookingId/checklist/:itemId/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a checklist item as complete' })
  completeChecklistItem(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: CompleteChecklistItemDto,
  ) {
    // First get the checklist progress to find the checklist progress ID
    return this.checklistService
      .getBookingChecklistProgress(bookingId)
      .then((progress) => {
        if (!progress) throw new Error('Checklist progress not found');
        return this.checklistService.completeChecklistItem(
          progress.id,
          itemId,
          dto.photoUrl,
          dto.notes,
        );
      });
  }

  @Post(':bookingId/checklist/:itemId/uncomplete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a checklist item as incomplete' })
  uncompleteChecklistItem(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.checklistService
      .getBookingChecklistProgress(bookingId)
      .then((progress) => {
        if (!progress) throw new Error('Checklist progress not found');
        return this.checklistService.uncompleteChecklistItem(progress.id, itemId);
      });
  }

  @Post(':bookingId/checklist/phase/next')
  @HttpCode(200)
  @ApiOperation({ summary: 'Move to next checklist phase' })
  moveToNextPhase(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.checklistService
      .getBookingChecklistProgress(bookingId)
      .then((progress) => {
        if (!progress) throw new Error('Checklist progress not found');
        return this.checklistService.moveToNextPhase(progress.id);
      });
  }

  @Post(':bookingId/checklist/phase/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark current phase as complete' })
  completePhase(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.checklistService
      .getBookingChecklistProgress(bookingId)
      .then((progress) => {
        if (!progress) throw new Error('Checklist progress not found');
        return this.checklistService.completePhase(progress.id);
      });
  }

  // ===================== ENHANCED BOOKING FLOW ENDPOINTS =====================

  @Post(':id/phase/arrival')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle arrival verification (Phase 4)' })
  handleArrival(
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    return this.enhancedBookingService.onAgentArrived(bookingId);
  }

  @Post(':id/service/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start service execution (Phase 5)' })
  startServiceExecution(
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    return this.enhancedBookingService.onServiceStarted(bookingId);
  }

  @Post(':id/service/milestone')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log service milestone during execution (Phase 5)' })
  logMilestone(
    @Param('id', ParseUUIDPipe) bookingId: string,
    @Body('milestone') milestone: string,
  ) {
    return this.enhancedBookingService.logServiceMilestone(bookingId, milestone);
  }

  @Post(':id/payment/initialize')
  @HttpCode(200)
  @ApiOperation({ summary: 'Initialize payment processing (Phase 7)' })
  initializePayment(
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    return this.enhancedBookingService.initializePayment(bookingId);
  }

  @Post(':id/feedback/request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request customer feedback (Phase 8)' })
  requestFeedback(
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    return this.enhancedBookingService.requestCustomerFeedback(bookingId);
  }
}
