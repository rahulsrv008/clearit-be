import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentSupportService } from './support.service';
import { CreateAgentSupportTicketDto } from './dto/create-ticket.dto';
import { ListAgentSupportTicketsDto } from './dto/list-tickets.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.SUPPORT)
export class AgentSupportController {
  constructor(private readonly supportService: AgentSupportService) {}

  @Post()
  @ApiOperation({ summary: 'Raise a support ticket' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAgentSupportTicketDto,
  ) {
    return this.supportService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the agent support tickets' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListAgentSupportTicketsDto,
  ) {
    return this.supportService.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Support ticket detail' })
  detail(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.supportService.detail(userId, id);
  }
}
