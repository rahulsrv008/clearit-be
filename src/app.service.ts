import { Injectable } from '@nestjs/common';
import { appVersion } from './common/utils/version';
import { resolveAppEnv } from './config/env';

@Injectable()
export class AppService {
  getHello() {
    return {
      service: 'clearit-be',
      env: resolveAppEnv(),
      version: appVersion,
      docs: '/api',
      health: '/health',
      ready: '/api/v1/health',
    };
  }

  getLiveness() {
    return {
      status: 'ok',
      service: 'clearit-be',
      env: resolveAppEnv(),
      version: appVersion,
    };
  }
}
