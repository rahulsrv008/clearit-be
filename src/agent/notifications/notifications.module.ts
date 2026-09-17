import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/database/entities';
import { AgentNotificationsController } from './notifications.controller';
import { AgentNotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [AgentNotificationsController],
  providers: [AgentNotificationsService],
})
export class AgentNotificationsModule {}
