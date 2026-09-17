import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, AgentBankAccount, AgentDocument } from 'src/database/entities';
import { AgentContextService } from '../shared/agent-context.service';
import { CreateAgentRegistrationDto } from './dto/create-registration.dto';
import { UpdateAgentPersonalDetailsDto } from './dto/update-personal-details.dto';
import {
  isRegistrationComplete,
  missingSteps,
  REQUIRED_DOCUMENT_TYPES,
  RegistrationSteps,
  resolveNextStep,
} from './registration.constants';

@Injectable()
export class AgentRegistrationService {
  constructor(
    @InjectRepository(Agent) private readonly agentRepo: Repository<Agent>,
    @InjectRepository(AgentDocument)
    private readonly documentRepo: Repository<AgentDocument>,
    @InjectRepository(AgentBankAccount)
    private readonly bankRepo: Repository<AgentBankAccount>,
    private readonly context: AgentContextService,
  ) {}

  async register(userId: string, dto: CreateAgentRegistrationDto) {
    const agent = await this.context.requireAgent(userId);
    this.assertEditable(agent);

    agent.firstName = dto.firstName;
    if (dto.lastName !== undefined) agent.lastName = dto.lastName;
    if (dto.gender !== undefined) agent.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) agent.dateOfBirth = dto.dateOfBirth;
    if (dto.profileImage !== undefined) agent.profileImage = dto.profileImage;

    await this.agentRepo.save(agent);
    return this.status(userId);
  }

  async updatePersonalDetails(
    userId: string,
    dto: UpdateAgentPersonalDetailsDto,
  ) {
    const agent = await this.context.requireAgent(userId);
    this.assertEditable(agent);

    if (dto.firstName !== undefined) agent.firstName = dto.firstName;
    if (dto.lastName !== undefined) agent.lastName = dto.lastName;
    if (dto.gender !== undefined) agent.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) agent.dateOfBirth = dto.dateOfBirth;
    if (dto.profileImage !== undefined) agent.profileImage = dto.profileImage;

    await this.agentRepo.save(agent);
    return this.status(userId);
  }

  async status(userId: string) {
    const agent = await this.context.requireAgent(userId);

    const [documents, bankAccount] = await Promise.all([
      this.documentRepo.find({
        where: { agentId: agent.id },
        order: { createdAt: 'DESC' },
      }),
      this.bankRepo.findOne({ where: { agentId: agent.id }, select: ['id'] }),
    ]);

    const uploaded = new Set(documents.map((row) => row.documentType));
    const steps: RegistrationSteps = {
      personalDetails: !!agent.firstName,
      documents: REQUIRED_DOCUMENT_TYPES.every((type) => uploaded.has(type)),
      bankDetails: !!bankAccount,
    };

    return {
      status: agent.status,
      approvalStatus: agent.approvalStatus,
      joiningDate: agent.joiningDate,
      steps,
      missing: missingSteps(steps),
      nextStep: resolveNextStep(steps, agent.approvalStatus),
      isRegistrationComplete: isRegistrationComplete(steps),
      requiredDocumentTypes: [...REQUIRED_DOCUMENT_TYPES],
      documents: documents.map((document) => ({
        documentType: document.documentType,
        verificationStatus: document.verificationStatus,
      })),
    };
  }

  /** Once admin has approved the agent, onboarding data is frozen. */
  private assertEditable(agent: Agent) {
    if (agent.approvalStatus === 'APPROVED') {
      throw new ConflictException(
        'Registration is already approved — use the profile screen to make changes',
      );
    }
  }
}
