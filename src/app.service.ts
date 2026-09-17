import { Injectable } from '@nestjs/common';
import { appVersion } from './common/utils/version';

@Injectable()
export class AppService {
  getHello() {
    return {
      service: 'clearit-be',
      version: appVersion,
      docs: '/api',
      health: '/health',
    };
  }
}
