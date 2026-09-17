import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms/sms.service';
import { RazorpayService } from './payments/razorpay.service';
import { PushService } from './push/push.service';

/** Third-party edges (SMS, payment gateway, push) available app-wide. */
@Global()
@Module({
  providers: [SmsService, RazorpayService, PushService],
  exports: [SmsService, RazorpayService, PushService],
})
export class IntegrationsModule {}
