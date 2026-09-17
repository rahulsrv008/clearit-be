import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/database/entities';
import { CustomerAuthController } from './auth.controller';
import { CustomerAuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService],
})
export class CustomerAuthModule {}
