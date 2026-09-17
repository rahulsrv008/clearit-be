import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { AdminReportsService } from './reports.service';
import { AdminReportRangeDto } from './dto/report-range.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.REPORTS)
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Combined summary of all reports for a range' })
  overview(@Query() query: AdminReportRangeDto) {
    return this.reportsService.overview(query);
  }

  @Get('bookings')
  @ApiOperation({
    summary: 'Daily bookings, completions, cancellations, revenue',
  })
  bookings(@Query() query: AdminReportRangeDto) {
    return this.reportsService.bookingsReport(query);
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Collected vs pending vs refunded per day, plus top 5 services',
  })
  revenue(@Query() query: AdminReportRangeDto) {
    return this.reportsService.revenue(query);
  }

  @Get('agents')
  @ApiOperation({
    summary: 'Per-agent jobs, hours, revenue, rating, attendance',
  })
  agents(@Query() query: AdminReportRangeDto) {
    return this.reportsService.agents(query);
  }

  @Get('customers')
  @ApiOperation({
    summary: 'New customers per day, repeat customers, top 10 by spend',
  })
  customers(@Query() query: AdminReportRangeDto) {
    return this.reportsService.customers(query);
  }
}
