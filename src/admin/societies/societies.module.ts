import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Society } from 'src/database/entities';
import { AdminSocietiesController } from './societies.controller';
import { AdminSocietiesService } from './societies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Society])],
  controllers: [AdminSocietiesController],
  providers: [AdminSocietiesService],
})
export class AdminSocietiesModule {}
