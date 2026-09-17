import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentDocument } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentDocumentsController } from './documents.controller';
import { AgentDocumentsService } from './documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentDocument]), AgentSharedModule],
  controllers: [AgentDocumentsController],
  providers: [AgentDocumentsService],
})
export class AgentDocumentsModule {}
