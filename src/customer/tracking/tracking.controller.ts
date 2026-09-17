import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CustomerTrackingService } from './tracking.service';

/** Shares the bookings base path; Nest merges both controllers' routes. */
@ApiTags('customer')
@CustomerAuth()
@Controller(ROUTES.CUSTOMER.BOOKINGS)
export class CustomerTrackingController {
  constructor(private readonly trackingService: CustomerTrackingService) {}

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Latest agent location for a live booking' })
  tracking(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trackingService.tracking(userId, id);
  }
}
