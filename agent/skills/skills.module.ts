import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, AgentSkill, Skill } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import {
  AgentBoostController,
  AgentSkillsController,
} from './skills.controller';
import { AgentSkillsService } from './skills.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, AgentSkill, Agent]),
    AgentSharedModule,
  ],
  controllers: [AgentSkillsController, AgentBoostController],
  providers: [AgentSkillsService],
  exports: [AgentSkillsService],
})
export class AgentSkillsModule {}
