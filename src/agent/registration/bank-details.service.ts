import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentBankAccount } from 'src/database/entities';
import { AgentContextService } from '../shared/agent-context.service';
import { SaveAgentBankDetailsDto } from './dto/save-bank-details.dto';

/** Agents keep exactly one payout account; saving again replaces it. */
@Injectable()
export class AgentBankDetailsService {
  constructor(
    @InjectRepository(AgentBankAccount)
    private readonly bankRepo: Repository<AgentBankAccount>,
    private readonly context: AgentContextService,
  ) {}

  async save(userId: string, dto: SaveAgentBankDetailsDto) {
    const agent = await this.context.requireAgent(userId);

    const existing = await this.bankRepo.findOne({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
    });
    const account =
      existing ??
      this.bankRepo.create({ agentId: agent.id, isVerified: false });

    const changed =
      account.accountNumber !== dto.accountNumber ||
      account.ifscCode !== dto.ifscCode ||
      account.accountHolderName !== dto.accountHolderName ||
      account.bankName !== dto.bankName;

    account.accountHolderName = dto.accountHolderName;
    account.accountNumber = dto.accountNumber;
    account.ifscCode = dto.ifscCode;
    account.bankName = dto.bankName;
    // Any edit sends the account back through admin verification.
    if (changed) account.isVerified = false;

    return this.toResponse(await this.bankRepo.save(account));
  }

  async get(userId: string) {
    const agent = await this.context.requireAgent(userId);
    const account = await this.bankRepo.findOne({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
    });
    if (!account) throw new NotFoundException('Bank details not added yet');
    return this.toResponse(account);
  }

  private toResponse(account: AgentBankAccount) {
    return {
      id: account.id,
      accountHolderName: account.accountHolderName,
      accountNumber: maskAccountNumber(account.accountNumber),
      ifscCode: account.ifscCode,
      bankName: account.bankName,
      isVerified: account.isVerified,
      createdAt: account.createdAt,
    };
  }
}

/** Only the last four digits ever leave the server. */
function maskAccountNumber(accountNumber: string | null) {
  if (!accountNumber) return null;
  if (accountNumber.length <= 4) return accountNumber;
  return `${'X'.repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`;
}
