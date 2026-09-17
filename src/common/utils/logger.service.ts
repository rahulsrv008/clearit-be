import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: { error?: unknown; [key: string]: unknown },
  ): void {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  http(message: string, context?: string): void {
    this.logger.info(message, { context });
  }
}
