import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, SupportTicket } from 'src/database/entities';
import { CustomerSupportController } from './support.controller';
import { CustomerSupportService } from './support.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, Booking])],
  controllers: [CustomerSupportController],
  providers: [CustomerSupportService],
})
export class CustomerSupportModule {}
