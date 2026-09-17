import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AgentAvailability, Booking } from 'src/database/entities';
import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';
import { AgentContextService } from '../shared/agent-context.service';
import { resolveDateRange, todayString } from '../shared/date.util';
import { UpdateAgentAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AgentAvailabilityService {
  constructor(
    @InjectRepository(AgentAvailability)
    private readonly availabilityRepo: Repository<AgentAvailability>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly context: AgentContextService,
  ) {}

  async update(userId: string, dto: UpdateAgentAvailabilityDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const availabilityDate = dto.availabilityDate ?? todayString();

    if (!dto.isAvailable) {
      const ongoing = await this.bookingRepo.count({
        where: { agentId: agent.id, status: 'ongoing' },
      });
      if (ongoing > 0) {
        throw new BadRequestException(
          'Finish your ongoing job before going offline',
        );
      }
    }

    // No unique index on (agent_id, availability_date), so upsert by hand.
    const existing = await this.availabilityRepo.findOne({
      where: { agentId: agent.id, availabilityDate },
    });
    const row =
      existing ??
      this.availabilityRepo.create({ agentId: agent.id, availabilityDate });

    row.isAvailable = dto.isAvailable;
    if (dto.startTime !== undefined) row.startTime = dto.startTime;
    if (dto.endTime !== undefined) row.endTime = dto.endTime;

    return this.toResponse(await this.availabilityRepo.save(row));
  }

  async list(userId: string, query: DateRangeQueryDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const { from, to } = resolveDateRange(query);
    const today = todayString();

    const rows = await this.availabilityRepo.find({
      where: { agentId: agent.id, availabilityDate: Between(from, to) },
      order: { availabilityDate: 'ASC' },
    });

    const todayRow = await this.availabilityRepo.findOne({
      where: { agentId: agent.id, availabilityDate: today },
    });

    return {
      from,
      to,
      isOnlineToday: todayRow?.isAvailable ?? false,
      items: rows.map((row) => this.toResponse(row)),
    };
  }

  private toResponse(row: AgentAvailability) {
    return {
      id: row.id,
      availabilityDate: row.availabilityDate,
      startTime: row.startTime,
      endTime: row.endTime,
      isAvailable: row.isAvailable,
    };
  }
}
