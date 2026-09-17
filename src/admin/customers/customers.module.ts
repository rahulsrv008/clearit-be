import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Booking,
  Customer,
  CustomerAddress,
  Payment,
  User,
} from 'src/database/entities';
import { AdminCustomersController } from './customers.controller';
import { AdminCustomersService } from './customers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      CustomerAddress,
      Booking,
      Payment,
    ]),
  ],
  controllers: [AdminCustomersController],
  providers: [AdminCustomersService],
})
export class AdminCustomersModule {}
