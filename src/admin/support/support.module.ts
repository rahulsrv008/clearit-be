import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from 'src/database/entities';
import { AdminSupportController } from './support.controller';
import { AdminSupportService } from './support.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket])],
  controllers: [AdminSupportController],
  providers: [AdminSupportService],
})
export class AdminSupportModule {}
