import { ForbiddenException, Injectable } from '@nestjs/common';
import { Agent } from 'src/database/entities';
import { IdentityService } from 'src/common/auth/identity.service';

/**
 * Resolves the caller's `agents` row and enforces the approval gate.
 * Onboarding endpoints (registration, documents, profile, support) use
 * `requireAgent`; anything that touches real work uses `requireApprovedAgent`.
 */
@Injectable()
export class AgentContextService {
  constructor(private readonly identity: IdentityService) {}

  requireAgent(userId: string): Promise<Agent> {
    return this.identity.requireAgent(userId);
  }

  async requireApprovedAgent(userId: string): Promise<Agent> {
    const agent = await this.identity.requireAgent(userId);
    if (agent.approvalStatus !== 'APPROVED' || agent.status === 'SUSPENDED') {
      throw new ForbiddenException('Your account is pending approval');
    }
    return agent;
  }

  /** Same gate as above when only the id is needed downstream. */
  async requireApprovedAgentId(userId: string): Promise<string> {
    const agent = await this.requireApprovedAgent(userId);
    return agent.id;
  }
}
