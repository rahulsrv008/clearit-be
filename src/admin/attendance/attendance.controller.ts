import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { AdminAttendanceService } from './attendance.service';
import { ListAdminAttendanceDto } from './dto/list-attendance.dto';
import { AdminAttendanceReportDto } from './dto/attendance-report.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.ATTENDANCE)
export class AdminAttendanceController {
  constructor(private readonly attendanceService: AdminAttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Agent attendance records with period totals' })
  list(@Query() query: ListAdminAttendanceDto) {
    return this.attendanceService.list(query);
  }

  @Get('report')
  @ApiOperation({ summary: 'Attendance aggregated per agent for a period' })
  report(@Query() query: AdminAttendanceReportDto) {
    return this.attendanceService.report(query);
  }
}
