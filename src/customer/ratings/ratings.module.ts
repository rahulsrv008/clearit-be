import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Rating, Review } from 'src/database/entities';
import { CustomerRatingsController } from './ratings.controller';
import { CustomerRatingsService } from './ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Review, Booking])],
  controllers: [CustomerRatingsController],
  providers: [CustomerRatingsService],
})
export class CustomerRatingsModule {}
