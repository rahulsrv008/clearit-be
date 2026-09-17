import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, AgentBankAccount, AgentDocument } from 'src/database/entities';
import { AgentSharedModule } from '../shared/agent-shared.module';
import { AgentRegistrationController } from './registration.controller';
import { AgentRegistrationService } from './registration.service';
import { AgentBankDetailsController } from './bank-details.controller';
import { AgentBankDetailsService } from './bank-details.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, AgentDocument, AgentBankAccount]),
    AgentSharedModule,
  ],
  controllers: [AgentRegistrationController, AgentBankDetailsController],
  providers: [AgentRegistrationService, AgentBankDetailsService],
})
export class AgentRegistrationModule {}
