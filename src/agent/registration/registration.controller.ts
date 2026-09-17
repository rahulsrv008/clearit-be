import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentRegistrationService } from './registration.service';
import { CreateAgentRegistrationDto } from './dto/create-registration.dto';
import { UpdateAgentPersonalDetailsDto } from './dto/update-personal-details.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.REGISTRATION)
export class AgentRegistrationController {
  constructor(private readonly registrationService: AgentRegistrationService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit agent personal details to start onboarding',
  })
  register(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAgentRegistrationDto,
  ) {
    return this.registrationService.register(userId, dto);
  }

  @Patch('personal-details')
  @ApiOperation({ summary: 'Update onboarding personal details' })
  updatePersonalDetails(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAgentPersonalDetailsDto,
  ) {
    return this.registrationService.updatePersonalDetails(userId, dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Onboarding progress and the next step to complete',
  })
  status(@CurrentUser('sub') userId: string) {
    return this.registrationService.status(userId);
  }
}
