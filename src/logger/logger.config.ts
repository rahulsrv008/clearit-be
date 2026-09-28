import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { LOG_DIR, LOG_DATE_PATTERN, LOG_MAX_SIZE, ensureLogDir } from './log-paths';

function dailyRotateFileOptions(
  filenameBase: string,
): DailyRotateFile.DailyRotateFileTransportOptions {
  return {
    dirname: LOG_DIR,
    filename: `${filenameBase}-%DATE%.log`,
    datePattern: LOG_DATE_PATTERN,
    maxSize: LOG_MAX_SIZE,
    maxFiles: '30d',
  };
}

export function createWinstonLoggerOptions() {
  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike('clearit-be', {
        prettyPrint: true,
      }),
    ),
  });

  // Vercel’s filesystem is read-only except /tmp. File rotation crashes the function.
  if (process.env.VERCEL) {
    return {
      level: process.env.LOG_LEVEL || 'info',
      transports: [consoleTransport],
    };
  }

  ensureLogDir();

  return {
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      consoleTransport,
      new DailyRotateFile({
        ...dailyRotateFileOptions('error'),
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new DailyRotateFile({
        ...dailyRotateFileOptions('warn'),
        level: 'warn',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new DailyRotateFile({
        ...dailyRotateFileOptions('info'),
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new DailyRotateFile({
        ...dailyRotateFileOptions('http'),
        level: 'http',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  };
}
