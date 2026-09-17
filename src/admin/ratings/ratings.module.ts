import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating, Review } from 'src/database/entities';
import { AdminRatingsController } from './ratings.controller';
import { AdminRatingsService } from './ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Review])],
  controllers: [AdminRatingsController],
  providers: [AdminRatingsService],
})
export class AdminRatingsModule {}
