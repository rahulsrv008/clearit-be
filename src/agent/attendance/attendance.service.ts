import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AgentAttendance } from 'src/database/entities';
import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';
import { AgentContextService } from '../shared/agent-context.service';
import { resolveDateRange, todayString } from '../shared/date.util';

type TodayStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';

@Injectable()
export class AgentAttendanceService {
  constructor(
    @InjectRepository(AgentAttendance)
    private readonly attendanceRepo: Repository<AgentAttendance>,
    private readonly context: AgentContextService,
  ) {}

  async list(userId: string, query: DateRangeQueryDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const { from, to } = resolveDateRange(query);
    const today = todayString();

    const rows = await this.attendanceRepo.find({
      where: { agentId: agent.id, attendanceDate: Between(from, to) },
      order: { attendanceDate: 'DESC' },
    });

    const todayRow =
      rows.find((row) => row.attendanceDate === today) ??
      (await this.attendanceRepo.findOne({
        where: { agentId: agent.id, attendanceDate: today },
      }));

    const totalHours = rows.reduce(
      (sum, row) => sum + hoursBetween(row.checkIn, row.checkOut),
      0,
    );

    return {
      from,
      to,
      items: rows.map((row) => this.toResponse(row)),
      summary: {
        presentDays: rows.filter((row) => row.status === 'PRESENT').length,
        totalHours: Number(totalHours.toFixed(2)),
        todayStatus: resolveTodayStatus(todayRow),
      },
    };
  }

  async checkIn(userId: string) {
    const agent = await this.context.requireApprovedAgent(userId);
    const attendanceDate = todayString();

    const existing = await this.attendanceRepo.findOne({
      where: { agentId: agent.id, attendanceDate },
    });
    if (existing?.checkIn) {
      throw new ConflictException('Already checked in today');
    }

    const row =
      existing ??
      this.attendanceRepo.create({ agentId: agent.id, attendanceDate });
    row.checkIn = new Date();
    row.status = 'PRESENT';

    return this.toResponse(await this.attendanceRepo.save(row));
  }

  async checkOut(userId: string) {
    const agent = await this.context.requireApprovedAgent(userId);
    const attendanceDate = todayString();

    const row = await this.attendanceRepo.findOne({
      where: { agentId: agent.id, attendanceDate },
    });
    if (!row?.checkIn) {
      throw new BadRequestException('You have not checked in today');
    }
    if (row.checkOut) {
      throw new BadRequestException('Already checked out today');
    }

    row.checkOut = new Date();
    const saved = await this.attendanceRepo.save(row);

    return {
      ...this.toResponse(saved),
      hoursWorked: Number(
        hoursBetween(saved.checkIn, saved.checkOut).toFixed(2),
      ),
    };
  }

  private toResponse(row: AgentAttendance) {
    return {
      id: row.id,
      attendanceDate: row.attendanceDate,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
      hoursWorked: Number(hoursBetween(row.checkIn, row.checkOut).toFixed(2)),
    };
  }
}

function hoursBetween(checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut) return 0;
  return (checkOut.getTime() - checkIn.getTime()) / 3_600_000;
}

function resolveTodayStatus(row?: AgentAttendance | null): TodayStatus {
  if (!row?.checkIn) return 'NOT_CHECKED_IN';
  return row.checkOut ? 'CHECKED_OUT' : 'CHECKED_IN';
}
