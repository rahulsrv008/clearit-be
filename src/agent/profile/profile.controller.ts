import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentProfileService } from './profile.service';
import { UpdateAgentProfileDto } from './dto/update-profile.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.PROFILE)
export class AgentProfileController {
  constructor(private readonly profileService: AgentProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get agent profile with rating and job totals' })
  get(@CurrentUser('sub') userId: string) {
    return this.profileService.get(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update agent profile' })
  update(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAgentProfileDto,
  ) {
    return this.profileService.update(userId, dto);
  }
}
