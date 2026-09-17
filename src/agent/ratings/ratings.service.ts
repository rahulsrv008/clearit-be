import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/database/entities';
import {
  PaginationQueryDto,
  paginated,
  skipTake,
} from 'src/common/dto/pagination.dto';
import { AgentContextService } from '../shared/agent-context.service';

type Breakdown = Record<'1' | '2' | '3' | '4' | '5', number>;

@Injectable()
export class AgentRatingsService {
  constructor(
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    private readonly context: AgentContextService,
  ) {}

  async summary(userId: string, query: PaginationQueryDto) {
    const agent = await this.context.requireAgent(userId);

    const [rows, total] = await this.ratingRepo.findAndCount({
      where: { agentId: agent.id },
      relations: ['booking', 'customer', 'reviews'],
      order: { createdAt: 'DESC' },
      ...skipTake(query),
    });

    const [stats, breakdown] = await Promise.all([
      this.ratingRepo
        .createQueryBuilder('rating')
        .select('AVG(rating.rating)', 'average')
        .addSelect('COUNT(rating.id)', 'total')
        .where('rating.agent_id = :agentId', { agentId: agent.id })
        .getRawOne<{ average: string | null; total: string }>(),
      this.breakdown(agent.id),
    ]);

    return {
      averageRating: Number(Number(stats?.average ?? 0).toFixed(2)),
      totalRatings: Number(stats?.total ?? 0),
      breakdown,
      ...paginated(
        rows.map((row) => ({
          id: row.id,
          rating: Number(row.rating),
          reviewText: row.reviews?.[0]?.reviewText ?? null,
          bookingNumber: row.booking?.bookingNumber ?? null,
          customerFirstName: row.customer?.firstName ?? null,
          createdAt: row.createdAt,
        })),
        total,
        query,
      ),
    };
  }

  /** Stars are stored with one decimal, so bucket them to whole stars. */
  private async breakdown(agentId: string) {
    const rows = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('ROUND(rating.rating)', 'star')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.agent_id = :agentId', { agentId })
      .groupBy('ROUND(rating.rating)')
      .getRawMany<{ star: string; count: string }>();

    const breakdown: Breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const row of rows) {
      const star = String(Number(row.star)) as keyof Breakdown;
      if (star in breakdown) breakdown[star] = Number(row.count);
    }
    return breakdown;
  }
}
