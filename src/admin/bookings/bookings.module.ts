import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, AgentLocation, Booking, Payment } from 'src/database/entities';
import { AdminBookingsController } from './bookings.controller';
import { AdminBookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Agent, Payment, AgentLocation])],
  controllers: [AdminBookingsController],
  providers: [AdminBookingsService],
})
export class AdminBookingsModule {}
