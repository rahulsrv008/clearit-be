import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Booking,
  BookingItem,
  Coupon,
  CouponUsage,
  CustomerAddress,
  Payment,
  Rating,
  Service,
  ServiceArea,
  ServicePricing,
} from 'src/database/entities';
import { CustomerBookingsController } from './bookings.controller';
import { CustomerBookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingItem,
      CustomerAddress,
      Service,
      ServicePricing,
      ServiceArea,
      Payment,
      Coupon,
      CouponUsage,
      Rating,
    ]),
  ],
  controllers: [CustomerBookingsController],
  providers: [CustomerBookingsService],
})
export class CustomerBookingsModule {}
