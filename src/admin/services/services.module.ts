import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingItem,
  Service,
  ServiceCategory,
  ServicePricing,
} from 'src/database/entities';
import { AdminServicesController } from './services.controller';
import { AdminServicesService } from './services.service';
import { AdminServiceCategoriesController } from './service-categories.controller';
import { AdminServiceCategoriesService } from './service-categories.service';

/** Services catalogue and the categories that group it. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceCategory,
      ServicePricing,
      BookingItem,
    ]),
  ],
  controllers: [AdminServicesController, AdminServiceCategoriesController],
  providers: [AdminServicesService, AdminServiceCategoriesService],
})
export class AdminServicesModule {}
