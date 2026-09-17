import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { CustomLoggerService } from 'src/common/utils/logger.service';

export interface GatewayOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  /** `razorpay` once keys are present, `stub` for local development. */
  mode: 'razorpay' | 'stub';
}

@Injectable()
export class RazorpayService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  get keyId() {
    return this.config.get<string>('RAZORPAY_KEY_ID') || null;
  }

  createOrder(amountPaise: number, receipt: string): GatewayOrder {
    const keyId = this.keyId;
    if (!keyId) {
      this.logger.warn(
        'RAZORPAY_KEY_ID missing — issuing a stub order id',
        'RazorpayService',
      );
      return {
        orderId: `stub_order_${receipt}`,
        amountPaise,
        currency: 'INR',
        keyId: null,
        mode: 'stub',
      };
    }

    return {
      orderId: `order_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
      amountPaise,
      currency: 'INR',
      keyId,
      mode: 'razorpay',
    };
  }

  /** Checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret). */
  verifyPaymentSignature(orderId: string, paymentId: string, signature?: string) {
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) return { verified: false, skipped: true };
    if (!signature) return { verified: false, skipped: false };

    const expected = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return { verified: this.safeEqual(expected, signature), skipped: false };
  }

  /** Webhook signature: HMAC_SHA256(rawBody, webhook_secret). */
  verifyWebhookSignature(rawBody: string, signature?: string) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return { verified: false, skipped: true };
    if (!signature) return { verified: false, skipped: false };

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return { verified: this.safeEqual(expected, signature), skipped: false };
  }

  private safeEqual(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  }
}
