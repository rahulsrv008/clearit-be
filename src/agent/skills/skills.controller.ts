import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentSkillsService } from './skills.service';
import { SaveAgentSkillsDto, UpdateAgentBoostDto } from './dto/skills.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.SKILLS)
export class AgentSkillsController {
  constructor(private readonly skillsService: AgentSkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Skill catalog plus this agent selections' })
  list(@CurrentUser('sub') userId: string) {
    return this.skillsService.list(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Save selected skills and training status' })
  save(@CurrentUser('sub') userId: string, @Body() dto: SaveAgentSkillsDto) {
    return this.skillsService.save(userId, dto);
  }
}

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.BOOST)
export class AgentBoostController {
  constructor(private readonly skillsService: AgentSkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Current booking-boost radius' })
  async get(@CurrentUser('sub') userId: string) {
    const data = await this.skillsService.list(userId);
    return {
      boostEnabled: data.boostEnabled,
      serviceRadiusKm: data.serviceRadiusKm,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Expand or reset the job-offer radius (3 km → 5 km)' })
  set(@CurrentUser('sub') userId: string, @Body() dto: UpdateAgentBoostDto) {
    return this.skillsService.setBoost(userId, dto);
  }
}
