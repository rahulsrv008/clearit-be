import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, ServiceArea, ServicePricing, ServiceZoneArea } from 'src/database/entities';
import { AdminServiceAreasController } from './service-areas.controller';
import { AdminServiceAreasService } from './service-areas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceArea,
      ServiceZoneArea,
      ServicePricing,
      Booking,
    ]),
  ],
  controllers: [AdminServiceAreasController],
  providers: [AdminServiceAreasService],
})
export class AdminServiceAreasModule {}
