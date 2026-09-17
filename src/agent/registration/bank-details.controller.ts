import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentBankDetailsService } from './bank-details.service';
import { SaveAgentBankDetailsDto } from './dto/save-bank-details.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.BANK_DETAILS)
export class AgentBankDetailsController {
  constructor(private readonly bankDetailsService: AgentBankDetailsService) {}

  @Post()
  @ApiOperation({ summary: 'Add or replace the agent payout bank account' })
  save(
    @CurrentUser('sub') userId: string,
    @Body() dto: SaveAgentBankDetailsDto,
  ) {
    return this.bankDetailsService.save(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get the payout bank account (number masked)' })
  get(@CurrentUser('sub') userId: string) {
    return this.bankDetailsService.get(userId);
  }
}
