import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AdminAgentsService } from './agents.service';
import { ListAdminAgentsDto } from './dto/list-agents.dto';
import { ApproveAdminAgentDto } from './dto/approve-agent.dto';
import { RejectAdminAgentDto } from './dto/reject-agent.dto';
import { SuspendAdminAgentDto } from './dto/suspend-agent.dto';
import { VerifyAdminAgentDocumentDto } from './dto/verify-document.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.AGENTS)
export class AdminAgentsController {
  constructor(private readonly agentsService: AdminAgentsService) {}

  @Get()
  @ApiOperation({ summary: 'List agents with KYC and performance columns' })
  list(@Query() query: ListAdminAgentsDto) {
    return this.agentsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Agent profile, KYC, bank, ratings and earnings' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.detail(id);
  }

  @Get(':id/location')
  @ApiOperation({ summary: 'Latest GPS ping and recent location history' })
  location(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.location(id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve an agent onboarding application' })
  approve(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveAdminAgentDto,
  ) {
    return this.agentsService.approve(adminId, id, dto);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reject an agent onboarding application' })
  reject(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectAdminAgentDto,
  ) {
    return this.agentsService.reject(adminId, id, dto);
  }

  @Post(':id/suspend')
  @HttpCode(200)
  @ApiOperation({ summary: 'Suspend an active agent' })
  suspend(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendAdminAgentDto,
  ) {
    return this.agentsService.suspend(adminId, id, dto);
  }

  @Post(':id/activate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reactivate a suspended agent' })
  activate(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentsService.activate(adminId, id);
  }

  @Patch(':id/documents/:documentId')
  @ApiOperation({ summary: 'KYC: verify or reject an agent document' })
  verifyDocument(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: VerifyAdminAgentDocumentDto,
  ) {
    return this.agentsService.verifyDocument(adminId, id, documentId, dto);
  }
}
