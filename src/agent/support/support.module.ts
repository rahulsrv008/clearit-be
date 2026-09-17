import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, SupportTicket } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentSupportController } from './support.controller';
import { AgentSupportService } from './support.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, Booking]),
    AgentSharedModule,
  ],
  controllers: [AgentSupportController],
  providers: [AgentSupportService],
})
export class AgentSupportModule {}
