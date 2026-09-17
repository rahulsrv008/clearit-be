import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/database/entities';
import { CustomerNotificationsController } from './notifications.controller';
import { CustomerNotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [CustomerNotificationsController],
  providers: [CustomerNotificationsService],
})
export class CustomerNotificationsModule {}
