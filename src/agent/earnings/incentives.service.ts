import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEarning, AgentIncentive } from 'src/database/entities';
import {
  SETTING_KEYS,
  SettingsService,
} from 'src/common/services/settings.service';
import { AgentContextService } from '../shared/agent-context.service';
import { monthRange } from '../shared/date.util';

const DEFAULT_INCENTIVE_THRESHOLD = 15000;
const DEFAULT_INCENTIVE_PERCENT = 10;

/**
 * Read-only for the agent app: admin generates the real `agent_incentives`
 * rows at month end. `currentMonth` is a live projection so the agent can see
 * how far they are from the bonus.
 */
@Injectable()
export class AgentIncentivesService {
  constructor(
    @InjectRepository(AgentIncentive)
    private readonly incentiveRepo: Repository<AgentIncentive>,
    @InjectRepository(AgentEarning)
    private readonly earningRepo: Repository<AgentEarning>,
    private readonly context: AgentContextService,
    private readonly settings: SettingsService,
  ) {}

  async list(userId: string) {
    const agent = await this.context.requireApprovedAgent(userId);

    const [rows, currentMonth] = await Promise.all([
      this.incentiveRepo.find({
        where: { agentId: agent.id },
        order: { year: 'DESC', month: 'DESC' },
      }),
      this.currentMonthProgress(agent.id),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        month: row.month,
        year: row.year,
        revenueGenerated: Number(row.revenueGenerated),
        thresholdAmount: Number(row.thresholdAmount),
        incentiveAmount: Number(row.incentiveAmount),
        status: row.status,
        createdAt: row.createdAt,
      })),
      currentMonth,
    };
  }

  private async currentMonthProgress(agentId: string) {
    const now = new Date();
    const { from, to } = monthRange(now);

    const [threshold, percent, raw] = await Promise.all([
      this.settings.getNumber(
        SETTING_KEYS.AGENT_INCENTIVE_THRESHOLD,
        DEFAULT_INCENTIVE_THRESHOLD,
      ),
      this.settings.getNumber(
        SETTING_KEYS.AGENT_INCENTIVE_PERCENT,
        DEFAULT_INCENTIVE_PERCENT,
      ),
      this.earningRepo
        .createQueryBuilder('earning')
        .select('COALESCE(SUM(earning.revenue_generated), 0)', 'total')
        .where('earning.agent_id = :agentId', { agentId })
        .andWhere('earning.earning_date BETWEEN :from AND :to', { from, to })
        .getRawOne<{ total: string }>(),
    ]);

    const revenueGenerated = Number(Number(raw?.total ?? 0).toFixed(2));
    // Nothing is paid out until the month's revenue clears the threshold.
    const projectedIncentive =
      revenueGenerated >= threshold ? (revenueGenerated * percent) / 100 : 0;

    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      revenueGenerated,
      threshold,
      incentivePercent: percent,
      amountToThreshold: Number(
        Math.max(threshold - revenueGenerated, 0).toFixed(2),
      ),
      projectedIncentive: Number(projectedIncentive.toFixed(2)),
    };
  }
}
