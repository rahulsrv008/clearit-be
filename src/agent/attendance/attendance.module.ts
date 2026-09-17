import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAttendance } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentAttendanceController } from './attendance.controller';
import { AgentAttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentAttendance]), AgentSharedModule],
  controllers: [AgentAttendanceController],
  providers: [AgentAttendanceService],
})
export class AgentAttendanceModule {}
