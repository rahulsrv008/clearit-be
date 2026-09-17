import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';
import { AgentAvailabilityService } from './availability.service';
import { UpdateAgentAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.AVAILABILITY)
export class AgentAvailabilityController {
  constructor(private readonly availabilityService: AgentAvailabilityService) {}

  @Patch()
  @ApiOperation({ summary: 'Go online or offline for a given day' })
  update(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAgentAvailabilityDto,
  ) {
    return this.availabilityService.update(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Availability rows for a date range (defaults to this month)',
  })
  list(@CurrentUser('sub') userId: string, @Query() query: DateRangeQueryDto) {
    return this.availabilityService.list(userId, query);
  }
}
