import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as os from 'os';
import { from, of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CustomLoggerService } from 'src/common/utils/logger.service';
import { appVersion } from 'src/common/utils/version';

@Injectable()
export class HealthService {
  started = new Date();

  constructor(
    private readonly customLoggerService: CustomLoggerService,
    private readonly dataSource: DataSource,
  ) {}

  private checkDbConnection(): Observable<{
    dbStatus: string;
    dbError?: string;
  }> {
    if (!this.dataSource.isInitialized) {
      return of({
        dbStatus: 'disconnected',
        dbError: 'DataSource not initialized',
      });
    }

    return from(this.dataSource.query('SELECT 1')).pipe(
      map(() => ({ dbStatus: 'connected' })),
      catchError((error: Error) =>
        of({ dbStatus: 'disconnected', dbError: error.message }),
      ),
    );
  }

  getHealthStatus(): Observable<unknown> {
    const timestamp = new Date();
    this.customLoggerService.log(
      `Health check at ${timestamp.toISOString()}`,
      'HealthService',
    );

    return this.checkDbConnection().pipe(
      map((dbInfo) => ({
        status: dbInfo.dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp,
        appVersion,
        startedAt: this.started,
        osUpTime: os.uptime(),
        appUpTime: (Date.now() - Number(this.started)) / 1000,
        database: dbInfo,
      })),
    );
  }
}
