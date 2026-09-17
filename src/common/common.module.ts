import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Admin,
  Agent,
  AuditLog,
  Booking,
  BookingStatusHistory,
  Customer,
  DeviceToken,
  Notification,
  OtpVerification,
  RefreshToken,
  SystemSetting,
  User,
} from 'src/database/entities';
import { IdentityService } from './auth/identity.service';
import { TokenService } from './auth/token.service';
import { OtpService } from './auth/otp.service';
import { AuditService } from './services/audit.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { BookingHistoryService } from './booking/booking-history.service';
import { SettingsService } from './services/settings.service';

/**
 * Cross-app building blocks (identity, tokens, OTP, audit, notifications).
 * Global so the customer/agent/admin feature modules can inject them without
 * re-importing plumbing everywhere.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Customer,
      Agent,
      Admin,
      OtpVerification,
      RefreshToken,
      Notification,
      DeviceToken,
      AuditLog,
      Booking,
      BookingStatusHistory,
      SystemSetting,
    ]),
  ],
  providers: [
    IdentityService,
    TokenService,
    OtpService,
    AuditService,
    NotificationDispatchService,
    BookingHistoryService,
    SettingsService,
  ],
  exports: [
    IdentityService,
    TokenService,
    OtpService,
    AuditService,
    NotificationDispatchService,
    BookingHistoryService,
    SettingsService,
  ],
})
export class CommonModule {}
