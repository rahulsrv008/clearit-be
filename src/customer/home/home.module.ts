import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HomeCategory,
  HomeCategoryOption,
  HomePopularItem,
} from 'src/database/entities';
import { CustomerHomeController } from './home.controller';
import { CustomerHomeService } from './home.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeCategory, HomeCategoryOption, HomePopularItem]),
  ],
  controllers: [CustomerHomeController],
  providers: [CustomerHomeService],
})
export class CustomerHomeModule {}
