import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Agent,
  AgentAttendance,
  AgentDocument,
  Booking,
  Customer,
  Payment,
  Rating,
  SupportTicket,
} from 'src/database/entities';
import { ACTIVE_STATUSES } from 'src/common/booking/booking-status';
import { AdminDashboardQueryDto } from './dto/dashboard-query.dto';

/** Priorities the dashboard counts as "needs attention now". */
const HIGH_PRIORITIES = ['HIGH', 'URGENT'];

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Agent) private readonly agentRepo: Repository<Agent>,
    @InjectRepository(AgentDocument)
    private readonly documentRepo: Repository<AgentDocument>,
    @InjectRepository(AgentAttendance)
    private readonly attendanceRepo: Repository<AgentAttendance>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
  ) {}

  async overview(query: AdminDashboardQueryDto) {
    const range = this.resolveRange(query);

    const [customers, agents, bookings, revenue, ratings, support, kyc] =
      await Promise.all([
        this.customerStats(range),
        this.agentStats(range),
        this.bookingStats(range),
        this.revenueStats(range),
        this.ratingStats(),
        this.supportStats(),
        this.kycStats(),
      ]);

    return {
      range: { from: range.from, to: range.to },
      customers,
      agents,
      bookings,
      revenue,
      ratings,
      support,
      kyc,
    };
  }

  private async customerStats(range: ResolvedRange) {
    const [total, newInRange, blocked] = await Promise.all([
      this.customerRepo.count(),
      this.customerRepo
        .createQueryBuilder('customer')
        .where('customer.createdAt BETWEEN :start AND :end', {
          start: range.start,
          end: range.end,
        })
        .getCount(),
      this.customerRepo
        .createQueryBuilder('customer')
        .innerJoin('customer.user', 'user')
        .where('user.isActive = false')
        .getCount(),
    ]);

    return { total, newInRange, blocked };
  }

  private async agentStats(range: ResolvedRange) {
    const statusRows = await this.agentRepo
      .createQueryBuilder('agent')
      .select('agent.approvalStatus', 'approvalStatus')
      .addSelect('agent.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('agent.approvalStatus')
      .addGroupBy('agent.status')
      .getRawMany<{
        approvalStatus: string;
        status: string;
        count: number;
      }>();

    const sumWhere = (
      predicate: (row: { approvalStatus: string; status: string }) => boolean,
    ) =>
      statusRows
        .filter(predicate)
        .reduce((total, row) => total + Number(row.count), 0);

    const onlineToday = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .select('COUNT(DISTINCT attendance.agentId)::int', 'count')
      .where('attendance.attendanceDate = :today', { today: range.today })
      .andWhere('attendance.checkIn IS NOT NULL')
      .getRawOne<{ count: number }>();

    return {
      total: sumWhere(() => true),
      approved: sumWhere((row) => row.approvalStatus === 'APPROVED'),
      pendingApproval: sumWhere((row) => row.approvalStatus === 'PENDING'),
      suspended: sumWhere((row) => row.status === 'SUSPENDED'),
      onlineToday: Number(onlineToday?.count ?? 0),
    };
  }

  private async bookingStats(range: ResolvedRange) {
    const statusRows = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('booking.status')
      .getRawMany<{ status: string; count: number }>();

    const byStatus = statusRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {});

    const [inRange, activeNow] = await Promise.all([
      this.bookingRepo
        .createQueryBuilder('booking')
        .where('booking.bookingDate BETWEEN :from AND :to', {
          from: range.from,
          to: range.to,
        })
        .getCount(),
      this.bookingRepo
        .createQueryBuilder('booking')
        .where('booking.status IN (:...statuses)', {
          statuses: ACTIVE_STATUSES,
        })
        .getCount(),
    ]);

    return {
      total: statusRows.reduce((total, row) => total + Number(row.count), 0),
      byStatus,
      inRange,
      activeNow,
    };
  }

  private async revenueStats(range: ResolvedRange) {
    const collected = (from?: Date) => {
      const qb = this.paymentRepo
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentStatus = :status', { status: 'PAID' });
      if (from) {
        qb.andWhere('payment.paidAt >= :from', { from });
      }
      return qb.getRawOne<{ total: string }>();
    };

    const [today, inRange, thisMonth, lifetime, pending] = await Promise.all([
      collected(range.startOfToday),
      this.paymentRepo
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentStatus = :status', { status: 'PAID' })
        .andWhere('payment.paidAt BETWEEN :start AND :end', {
          start: range.start,
          end: range.end,
        })
        .getRawOne<{ total: string }>(),
      collected(range.startOfMonth),
      collected(),
      this.paymentRepo
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentStatus = :status', { status: 'PENDING' })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      today: Number(today?.total ?? 0),
      inRange: Number(inRange?.total ?? 0),
      thisMonth: Number(thisMonth?.total ?? 0),
      lifetime: Number(lifetime?.total ?? 0),
      pendingCollection: Number(pending?.total ?? 0),
    };
  }

  private async ratingStats() {
    const row = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('COALESCE(AVG(rating.rating), 0)', 'average')
      .addSelect('COUNT(*)::int', 'count')
      .getRawOne<{ average: string; count: number }>();

    return {
      average: Number(Number(row?.average ?? 0).toFixed(2)),
      count: Number(row?.count ?? 0),
    };
  }

  private async supportStats() {
    const rows = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('ticket.priority', 'priority')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('ticket.status')
      .addGroupBy('ticket.priority')
      .getRawMany<{ status: string; priority: string; count: number }>();

    const sumWhere = (
      predicate: (row: { status: string; priority: string }) => boolean,
    ) =>
      rows
        .filter(predicate)
        .reduce((total, row) => total + Number(row.count), 0);

    return {
      open: sumWhere((row) => row.status === 'OPEN'),
      inProgress: sumWhere((row) => row.status === 'IN_PROGRESS'),
      highPriority: sumWhere(
        (row) =>
          HIGH_PRIORITIES.includes(row.priority) &&
          row.status !== 'RESOLVED' &&
          row.status !== 'CLOSED',
      ),
    };
  }

  private async kycStats() {
    const pendingDocuments = await this.documentRepo
      .createQueryBuilder('document')
      .where('document.verificationStatus = :status', { status: 'PENDING' })
      .getCount();

    return { pendingDocuments };
  }

  /** Defaults to the current calendar month when the caller sends nothing. */
  private resolveRange(query: AdminDashboardQueryDto): ResolvedRange {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const from = query.from ?? isoDate(startOfMonth);
    const to = query.to ?? isoDate(endOfMonth);

    return {
      from,
      to,
      start: new Date(`${from}T00:00:00.000Z`),
      end: new Date(`${to}T23:59:59.999Z`),
      today: isoDate(now),
      startOfToday: new Date(`${isoDate(now)}T00:00:00.000Z`),
      startOfMonth: new Date(`${isoDate(startOfMonth)}T00:00:00.000Z`),
    };
  }
}

interface ResolvedRange {
  from: string;
  to: string;
  start: Date;
  end: Date;
  today: string;
  startOfToday: Date;
  startOfMonth: Date;
}
