import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Agent,
  AgentAvailability,
  AgentBankAccount,
  AgentDocument,
  AgentEarning,
  AgentLocation,
  Booking,
  Rating,
} from 'src/database/entities';
import { AdminAgentsController } from './agents.controller';
import { AdminAgentsService } from './agents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      AgentDocument,
      AgentBankAccount,
      AgentAvailability,
      AgentEarning,
      AgentLocation,
      Booking,
      Rating,
    ]),
  ],
  controllers: [AdminAgentsController],
  providers: [AdminAgentsService],
})
export class AdminAgentsModule {}
