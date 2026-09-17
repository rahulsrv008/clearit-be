import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentEarningsService } from './earnings.service';
import { ListAgentEarningsDto } from './dto/list-earnings.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.EARNINGS)
export class AgentEarningsController {
  constructor(private readonly earningsService: AgentEarningsService) {}

  @Get()
  @ApiOperation({
    summary: 'Earnings rows with today/week/month/lifetime totals',
  })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListAgentEarningsDto,
  ) {
    return this.earningsService.list(userId, query);
  }
}
