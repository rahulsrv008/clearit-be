import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AgentAttendance,
  AgentEarning,
  Booking,
  BookingItem,
  Customer,
  Payment,
  Rating,
} from 'src/database/entities';
import { AdminReportsController } from './reports.controller';
import { AdminReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingItem,
      Payment,
      Customer,
      AgentEarning,
      AgentAttendance,
      Rating,
    ]),
  ],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
})
export class AdminReportsModule {}
