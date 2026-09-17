import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Agent, Booking, Rating, User } from 'src/database/entities';
import { UpdateAgentProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AgentProfileService {
  constructor(
    @InjectRepository(Agent) private readonly agentRepo: Repository<Agent>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async get(userId: string) {
    const agent = await this.requireAgentWithUser(userId);
    return this.toResponse(agent);
  }

  async update(userId: string, dto: UpdateAgentProfileDto) {
    const agent = await this.requireAgentWithUser(userId);

    if (dto.email !== undefined && dto.email !== agent.user.email) {
      const taken = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(userId) },
        select: ['id'],
      });
      if (taken) throw new ConflictException('Email already in use');
      agent.user.email = dto.email;
      await this.userRepo.save(agent.user);
    }

    if (dto.firstName !== undefined) agent.firstName = dto.firstName;
    if (dto.lastName !== undefined) agent.lastName = dto.lastName;
    if (dto.gender !== undefined) agent.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) agent.dateOfBirth = dto.dateOfBirth;
    if (dto.profileImage !== undefined) agent.profileImage = dto.profileImage;

    await this.agentRepo.save(agent);
    return this.toResponse(agent);
  }

  private async requireAgentWithUser(userId: string) {
    const agent = await this.agentRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!agent) throw new NotFoundException('Agent profile not found');
    return agent;
  }

  private async toResponse(agent: Agent) {
    const [stats, completedBookings] = await Promise.all([
      this.ratingRepo
        .createQueryBuilder('rating')
        .select('AVG(rating.rating)', 'average')
        .addSelect('COUNT(rating.id)', 'total')
        .where('rating.agent_id = :agentId', { agentId: agent.id })
        .getRawOne<{ average: string | null; total: string }>(),
      this.bookingRepo.count({
        where: { agentId: agent.id, status: 'completed' },
      }),
    ]);

    return {
      agentId: agent.id,
      userId: agent.userId,
      mobile: agent.user.mobile,
      email: agent.user.email,
      firstName: agent.firstName,
      lastName: agent.lastName,
      profileImage: agent.profileImage,
      gender: agent.gender,
      dateOfBirth: agent.dateOfBirth,
      status: agent.status,
      approvalStatus: agent.approvalStatus,
      joiningDate: agent.joiningDate,
      averageRating: Number(Number(stats?.average ?? 0).toFixed(2)),
      totalRatings: Number(stats?.total ?? 0),
      totalCompletedBookings: completedBookings,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
}
