import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAvailability, Booking } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentAvailabilityController } from './availability.controller';
import { AgentAvailabilityService } from './availability.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentAvailability, Booking]),
    AgentSharedModule,
  ],
  controllers: [AgentAvailabilityController],
  providers: [AgentAvailabilityService],
})
export class AgentAvailabilityModule {}
