import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEarning, AgentIncentive, Booking } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentEarningsController } from './earnings.controller';
import { AgentEarningsService } from './earnings.service';
import { AgentIncentivesController } from './incentives.controller';
import { AgentIncentivesService } from './incentives.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEarning, AgentIncentive, Booking]),
    AgentSharedModule,
  ],
  controllers: [AgentEarningsController, AgentIncentivesController],
  providers: [AgentEarningsService, AgentIncentivesService],
})
export class AgentEarningsModule {}
