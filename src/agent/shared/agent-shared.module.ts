import { Module } from '@nestjs/common';
import { AgentContextService } from './agent-context.service';

/** Imported by every agent feature module that needs the approval gate. */
@Module({
  providers: [AgentContextService],
  exports: [AgentContextService],
})
export class AgentSharedModule {}
