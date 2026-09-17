import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, Booking, Rating, User } from 'src/database/entities';
import { AgentProfileController } from './profile.controller';
import { AgentProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, User, Rating, Booking])],
  controllers: [AgentProfileController],
  providers: [AgentProfileService],
})
export class AgentProfileModule {}
