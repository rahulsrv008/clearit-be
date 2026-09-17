import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Payment, PaymentTransaction } from 'src/database/entities';
import { CustomerPaymentsController } from './payments.controller';
import { CustomerPaymentsWebhookController } from './payments-webhook.controller';
import { CustomerPaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Payment, PaymentTransaction])],
  controllers: [CustomerPaymentsController, CustomerPaymentsWebhookController],
  providers: [CustomerPaymentsService],
})
export class CustomerPaymentsModule {}
