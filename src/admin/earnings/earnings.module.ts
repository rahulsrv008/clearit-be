import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Agent,
  AgentEarning,
  AgentIncentive,
  SalaryRecord,
} from 'src/database/entities';
import { AdminEarningsController } from './earnings.controller';
import { AdminEarningsService } from './earnings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentEarning,
      AgentIncentive,
      SalaryRecord,
      Agent,
    ]),
  ],
  controllers: [AdminEarningsController],
  providers: [AdminEarningsService],
})
export class AdminEarningsModule {}
