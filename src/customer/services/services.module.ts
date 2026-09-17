import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Service,
  ServiceCategory,
  ServicePricing,
} from 'src/database/entities';
import { CustomerServicesController } from './services.controller';
import { CustomerServicesService } from './services.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceCategory, ServicePricing]),
  ],
  controllers: [CustomerServicesController],
  providers: [CustomerServicesService],
})
export class CustomerServicesModule {}
