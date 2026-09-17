import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentLocation, Booking } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentLocationController } from './location.controller';
import { AgentLocationService } from './location.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentLocation, Booking]),
    AgentSharedModule,
  ],
  controllers: [AgentLocationController],
  providers: [AgentLocationService],
})
export class AgentLocationModule {}
