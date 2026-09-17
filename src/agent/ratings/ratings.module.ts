import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentRatingsController } from './ratings.controller';
import { AgentRatingsService } from './ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating]), AgentSharedModule],
  controllers: [AgentRatingsController],
  providers: [AgentRatingsService],
})
export class AgentRatingsModule {}
