import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HomeCategory,
  HomeCategoryOption,
  HomePopularItem,
} from 'src/database/entities';
import { AdminHomeContentController } from './home-content.controller';
import { AdminHomeContentService } from './home-content.service';

/** What the customer app home screen shows: category tiles, their options, most popular. */
@Module({
  imports: [
    TypeOrmModule.forFeature([HomeCategory, HomeCategoryOption, HomePopularItem]),
  ],
  controllers: [AdminHomeContentController],
  providers: [AdminHomeContentService],
})
export class AdminHomeContentModule {}
