import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEarning, Booking, ServicePricing } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentBookingsController } from './bookings.controller';
import { AgentBookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, AgentEarning, ServicePricing]),
    AgentSharedModule,
  ],
  controllers: [AgentBookingsController],
  providers: [AgentBookingsService],
})
export class AgentBookingsModule {}
