import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service, ServiceArea, ServicePricing } from 'src/database/entities';
import { AdminPricingController } from './pricing.controller';
import { AdminPricingService } from './pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePricing, Service, ServiceArea])],
  controllers: [AdminPricingController],
  providers: [AdminPricingService],
})
export class AdminPricingModule {}
