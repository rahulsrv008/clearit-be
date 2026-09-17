import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';
import { AgentAttendanceService } from './attendance.service';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.ATTENDANCE)
export class AgentAttendanceController {
  constructor(private readonly attendanceService: AgentAttendanceService) {}

  @Get()
  @ApiOperation({
    summary: 'Attendance rows and summary (defaults to this month)',
  })
  list(@CurrentUser('sub') userId: string, @Query() query: DateRangeQueryDto) {
    return this.attendanceService.list(userId, query);
  }

  @Post('check-in')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark attendance for today' })
  checkIn(@CurrentUser('sub') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Post('check-out')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Close out today attendance and return hours worked',
  })
  checkOut(@CurrentUser('sub') userId: string) {
    return this.attendanceService.checkOut(userId);
  }
}
