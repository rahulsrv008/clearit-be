import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/database/entities';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
