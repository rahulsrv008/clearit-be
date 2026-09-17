import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, AgentBankAccount, AgentDocument } from 'src/database/entities';
import { AgentAuthController } from './auth.controller';
import { AgentAuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, AgentDocument, AgentBankAccount])],
  controllers: [AgentAuthController],
  providers: [AgentAuthService],
})
export class AgentAuthModule {}
