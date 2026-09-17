import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { CustomerModule } from './customer/customer.module';
import { AgentModule } from './agent/agent.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    IntegrationsModule,
    CommonModule,
    HealthModule,
    // One app per client: /api/v1/customer/*, /api/v1/agent/*, /api/v1/admin/*
    CustomerModule,
    AgentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
