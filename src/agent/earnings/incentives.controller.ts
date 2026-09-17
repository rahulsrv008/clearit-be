import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentIncentivesService } from './incentives.service';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.INCENTIVES)
export class AgentIncentivesController {
  constructor(private readonly incentivesService: AgentIncentivesService) {}

  @Get()
  @ApiOperation({ summary: 'Past incentives plus this month progress' })
  list(@CurrentUser('sub') userId: string) {
    return this.incentivesService.list(userId);
  }
}
