import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, PaymentTransaction } from 'src/database/entities';
import { AdminPaymentsController } from './payments.controller';
import { AdminPaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentTransaction])],
  controllers: [AdminPaymentsController],
  providers: [AdminPaymentsService],
})
export class AdminPaymentsModule {}
