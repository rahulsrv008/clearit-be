import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Customer, CustomerAddress } from 'src/database/entities';
import { CustomerAddressesController } from './addresses.controller';
import { CustomerAddressesService } from './addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerAddress, Booking, Customer])],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
})
export class CustomerAddressesModule {}
