import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from 'src/common/utils/logger.service';

/**
 * Provider-agnostic SMS sender. With OTP_DEMO_MODE=true (local/STG) the code is
 * only logged; wire MSG91/Twilio credentials to switch to real delivery.
 */
@Injectable()
export class SmsService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  async sendOtp(mobile: string, code: string) {
    const template =
      this.config.get<string>('SMS_OTP_TEMPLATE') ||
      'Your ClearIt verification code is {{code}}. It expires shortly.';
    return this.send(mobile, template.replace('{{code}}', code));
  }

  async send(mobile: string, message: string) {
    const provider = (this.config.get<string>('SMS_PROVIDER') || '').toLowerCase();
    const apiKey = this.config.get<string>('SMS_API_KEY');

    if (!provider || !apiKey) {
      this.logger.log(
        `[sms:stub] to=${mobile} message="${message}"`,
        'SmsService',
      );
      return { delivered: false, provider: 'stub' };
    }

    // Providers are intentionally not wired yet — one place to add MSG91/Twilio.
    this.logger.warn(
      `SMS provider "${provider}" is configured but not implemented; message to ${mobile} was not sent`,
      'SmsService',
    );
    return { delivered: false, provider };
  }
}
