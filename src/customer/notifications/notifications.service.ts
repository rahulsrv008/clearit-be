import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/database/entities';
import { NotificationDispatchService } from 'src/common/services/notification-dispatch.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListCustomerNotificationsQueryDto } from './dto/list-notifications.dto';
import { RegisterCustomerDeviceTokenDto } from './dto/register-device-token.dto';
import { RemoveCustomerDeviceTokenDto } from './dto/remove-device-token.dto';

@Injectable()
export class CustomerNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly dispatch: NotificationDispatchService,
  ) {}

  async list(userId: string, query: ListCustomerNotificationsQueryDto) {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { userId, ...(query.unreadOnly ? { isRead: false } : {}) },
      order: { createdAt: 'DESC' },
      ...skipTake(query),
    });
    const unreadCount = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });

    const items = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.notificationType,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));

    return { ...paginated(items, total, query), unreadCount };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepo.save(notification);
    }
    return { id: notification.id, isRead: true };
  }

  async markAllRead(userId: string) {
    const result = await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async registerDevice(userId: string, dto: RegisterCustomerDeviceTokenDto) {
    const device = await this.dispatch.registerDevice(
      userId,
      dto.token,
      dto.platform,
    );
    return { id: device.id, platform: device.platform, isActive: true };
  }

  removeDevice(userId: string, dto: RemoveCustomerDeviceTokenDto) {
    return this.dispatch.deactivateDevice(userId, dto.token);
  }
}
