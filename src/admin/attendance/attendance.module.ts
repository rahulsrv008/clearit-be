import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentAttendance } from 'src/database/entities';
import { AdminAttendanceController } from './attendance.controller';
import { AdminAttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentAttendance])],
  controllers: [AdminAttendanceController],
  providers: [AdminAttendanceService],
})
export class AdminAttendanceModule {}
