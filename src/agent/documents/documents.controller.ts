import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AgentDocumentsService } from './documents.service';
import { UploadAgentDocumentDto } from './dto/upload-document.dto';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.DOCUMENTS)
export class AgentDocumentsController {
  constructor(private readonly documentsService: AgentDocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a KYC document URL for verification' })
  upload(
    @CurrentUser('sub') userId: string,
    @Body() dto: UploadAgentDocumentDto,
  ) {
    return this.documentsService.upload(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the agent KYC documents' })
  list(@CurrentUser('sub') userId: string) {
    return this.documentsService.list(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pending or rejected document' })
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.documentsService.remove(userId, id);
  }
}
