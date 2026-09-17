import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerOptions } from './logger.config';
import { CustomLoggerService } from 'src/common/utils/logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(createWinstonLoggerOptions())],
  providers: [CustomLoggerService],
  exports: [WinstonModule, CustomLoggerService],
})
export class LoggerModule {}
