import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AgentEarning, Booking } from 'src/database/entities';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { AgentContextService } from '../shared/agent-context.service';
import {
  monthRange,
  resolveDateRange,
  todayString,
  weekStartString,
} from '../shared/date.util';
import { ListAgentEarningsDto } from './dto/list-earnings.dto';

@Injectable()
export class AgentEarningsService {
  constructor(
    @InjectRepository(AgentEarning)
    private readonly earningRepo: Repository<AgentEarning>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly context: AgentContextService,
  ) {}

  async list(userId: string, query: ListAgentEarningsDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const { from, to } = resolveDateRange(query);

    const [rows, total] = await this.earningRepo.findAndCount({
      where: { agentId: agent.id, earningDate: Between(from, to) },
      relations: ['booking'],
      order: { earningDate: 'DESC', createdAt: 'DESC' },
      ...skipTake(query),
    });

    const [totals, completedJobs] = await Promise.all([
      this.totals(agent.id),
      this.bookingRepo.count({
        where: { agentId: agent.id, status: 'completed' },
      }),
    ]);

    return {
      ...paginated(
        rows.map((row) => ({
          id: row.id,
          bookingId: row.bookingId,
          bookingNumber: row.booking?.bookingNumber ?? null,
          earningDate: row.earningDate,
          serviceHours: Number(row.serviceHours),
          earningAmount: Number(row.earningAmount),
        })),
        total,
        query,
      ),
      from,
      to,
      totals,
      completedJobs,
    };
  }

  /** Running totals are always lifetime-to-date, not scoped to the query range. */
  private async totals(agentId: string) {
    const today = todayString();
    const month = monthRange();

    const [todayTotal, weekTotal, monthTotal, lifetime] = await Promise.all([
      this.sum(agentId, today, today),
      this.sum(agentId, weekStartString(), today),
      this.sum(agentId, month.from, month.to),
      this.sum(agentId),
    ]);

    return {
      today: todayTotal,
      thisWeek: weekTotal,
      thisMonth: monthTotal,
      lifetime,
    };
  }

  private async sum(agentId: string, from?: string, to?: string) {
    const query = this.earningRepo
      .createQueryBuilder('earning')
      .select('COALESCE(SUM(earning.earning_amount), 0)', 'total')
      .where('earning.agent_id = :agentId', { agentId });

    if (from && to) {
      query.andWhere('earning.earning_date BETWEEN :from AND :to', {
        from,
        to,
      });
    }

    const raw = await query.getRawOne<{ total: string }>();
    return Number(Number(raw?.total ?? 0).toFixed(2));
  }
}
