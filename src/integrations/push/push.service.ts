import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from 'src/common/utils/logger.service';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * FCM delivery. Without FCM_SERVER_KEY this logs instead of sending, so the
 * in-app notification row is still the source of truth for the mobile apps.
 */
@Injectable()
export class PushService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  async sendToTokens(tokens: string[], payload: PushPayload) {
    if (!tokens.length) return { sent: 0, provider: 'none' };

    const serverKey = this.config.get<string>('FCM_SERVER_KEY');
    if (!serverKey) {
      this.logger.log(
        `[push:stub] tokens=${tokens.length} title="${payload.title}"`,
        'PushService',
      );
      return { sent: 0, provider: 'stub' };
    }

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
      }),
    });

    if (!response.ok) {
      this.logger.warn(
        `FCM responded ${response.status} for ${tokens.length} token(s)`,
        'PushService',
      );
      return { sent: 0, provider: 'fcm' };
    }
    return { sent: tokens.length, provider: 'fcm' };
  }
}
