import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  AgentEarning,
  Booking,
  BookingItem,
  CustomerAddress,
  ServicePricing,
} from 'src/database/entities';
import { BookingHistoryService } from 'src/common/booking/booking-history.service';
import { NotificationDispatchService } from 'src/common/services/notification-dispatch.service';
import {
  SETTING_KEYS,
  SettingsService,
} from 'src/common/services/settings.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { AgentContextService } from '../shared/agent-context.service';
import { todayString, toTimeString } from '../shared/date.util';
import { ListAgentBookingsDto } from './dto/list-bookings.dto';
import { RejectAgentBookingDto } from './dto/reject-booking.dto';
import { StartAgentBookingDto } from './dto/start-booking.dto';
import { CompleteAgentBookingDto } from './dto/complete-booking.dto';

const LIST_RELATIONS = ['items', 'items.service', 'address', 'customer'];
const DETAIL_RELATIONS = [...LIST_RELATIONS, 'customer.user', 'serviceArea'];

/** Default share of booking revenue paid to the agent when no payout is configured. */
const DEFAULT_PAYOUT_PERCENT = 60;

@Injectable()
export class AgentBookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(AgentEarning)
    private readonly earningRepo: Repository<AgentEarning>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
    private readonly context: AgentContextService,
    private readonly history: BookingHistoryService,
    private readonly notifications: NotificationDispatchService,
    private readonly settings: SettingsService,
  ) {}

  async list(userId: string, query: ListAgentBookingsDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const scope = query.scope ?? 'assigned';

    const dateFilter = buildDateFilter(query.from, query.to);
    const shared: FindOptionsWhere<Booking> = {
      ...(dateFilter ? { bookingDate: dateFilter } : {}),
    };

    // The open pool is always unassigned + paid, whatever status filter came in.
    const availableWhere: FindOptionsWhere<Booking> = {
      ...shared,
      agentId: IsNull(),
      status: 'paid',
    };
    const assignedWhere: FindOptionsWhere<Booking> = {
      ...shared,
      agentId: agent.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const where =
      scope === 'available'
        ? [availableWhere]
        : scope === 'assigned'
          ? [assignedWhere]
          : [assignedWhere, availableWhere];

    // Available jobs read as a queue (soonest first); own jobs as a feed.
    const order =
      scope === 'available'
        ? ({ bookingDate: 'ASC', startTime: 'ASC' } as const)
        : ({ bookingDate: 'DESC', startTime: 'DESC' } as const);

    const [rows, total] = await this.bookingRepo.findAndCount({
      where,
      relations: LIST_RELATIONS,
      order,
      ...skipTake(query),
    });

    return paginated(
      rows.map((booking) => this.toListItem(booking, agent.id)),
      total,
      query,
    );
  }

  async detail(userId: string, bookingId: string) {
    const agent = await this.context.requireApprovedAgent(userId);
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: DETAIL_RELATIONS,
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const isMine = booking.agentId === agent.id;
    const isOpenJob = !booking.agentId && booking.status === 'paid';
    if (!isMine && !isOpenJob) {
      throw new NotFoundException('Booking not found');
    }

    return {
      ...this.toListItem(booking, agent.id),
      notes: booking.notes,
      subtotal: Number(booking.subtotal),
      discount: Number(booking.discount),
      tax: Number(booking.tax),
      paymentStatus: booking.paymentStatus,
      endTime: booking.endTime,
      serviceAreaName: booking.serviceArea?.name ?? null,
      // Only an assigned agent gets a way to contact the customer.
      customerMobile: isMine ? (booking.customer?.user?.mobile ?? null) : null,
      address: this.toAddress(booking.address, isMine),
      items: (booking.items ?? []).map((item) => ({
        serviceId: item.serviceId,
        serviceName: item.service?.name ?? null,
        quantity: item.quantity,
        durationMinutes: item.durationMinutes,
        amount: item.amount === null ? null : Number(item.amount),
      })),
    };
  }

  async accept(userId: string, bookingId: string) {
    const agent = await this.context.requireApprovedAgent(userId);

    // Claim the job with a conditional update so two agents can't both win it.
    const claimed = await this.bookingRepo.update(
      { id: bookingId, status: 'paid', agentId: IsNull() },
      { agentId: agent.id },
    );
    if (!claimed.affected) {
      const exists = await this.bookingRepo.count({ where: { id: bookingId } });
      if (!exists) throw new NotFoundException('Booking not found');
      throw new ConflictException('Job already taken');
    }

    const booking = await this.requireBooking(bookingId);
    await this.history.transition(booking, 'accepted', userId);

    await this.notifyCustomer(booking, {
      title: 'Agent assigned',
      message: `${agent.firstName || 'Your agent'} has accepted booking ${booking.bookingNumber}.`,
      type: 'booking_accepted',
    });

    return this.toStatusResponse(booking);
  }

  async reject(userId: string, bookingId: string, dto: RejectAgentBookingDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const booking = await this.requireBooking(bookingId);

    const isMine = booking.agentId === agent.id;
    if (
      isMine &&
      ['ongoing', 'completed', 'cancelled'].includes(booking.status)
    ) {
      throw new BadRequestException('This job can no longer be rejected');
    }

    if (isMine) {
      // Back into the open pool: 'paid' is the pre-assignment state, and the
      // status machine has no accepted → paid edge, so this is written directly.
      booking.agentId = null;
      booking.status = 'paid';
      await this.bookingRepo.save(booking);
    }

    await this.history.record(
      booking.id,
      booking.status,
      userId,
      dto.reason ? `Rejected by agent: ${dto.reason}` : 'Rejected by agent',
    );

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      released: isMine,
    };
  }

  async arrived(userId: string, bookingId: string) {
    const agent = await this.context.requireApprovedAgent(userId);
    const booking = await this.requireAssignedBooking(bookingId, agent.id);

    await this.history.transition(booking, 'arriving', userId);

    await this.notifyCustomer(booking, {
      title: 'Agent on the way',
      message: `${agent.firstName || 'Your agent'} is arriving for booking ${booking.bookingNumber}.`,
      type: 'booking_arriving',
    });

    return this.toStatusResponse(booking);
  }

  async start(userId: string, bookingId: string, dto: StartAgentBookingDto) {
    const agent = await this.context.requireApprovedAgent(userId);
    const booking = await this.requireAssignedBooking(bookingId, agent.id);

    if (!['arriving', 'accepted'].includes(booking.status)) {
      throw new BadRequestException('Booking is not ready to start');
    }
    if (!booking.startOtp || booking.startOtp !== dto.otp) {
      throw new BadRequestException('Incorrect start OTP');
    }

    await this.history.transition(booking, 'ongoing', userId);

    await this.notifyCustomer(booking, {
      title: 'Service started',
      message: `Work has started on booking ${booking.bookingNumber}.`,
      type: 'booking_started',
    });

    return this.toStatusResponse(booking);
  }

  async complete(
    userId: string,
    bookingId: string,
    dto: CompleteAgentBookingDto,
  ) {
    const agent = await this.context.requireApprovedAgent(userId);
    const booking = await this.requireAssignedBooking(bookingId, agent.id);

    booking.endTime = toTimeString(new Date());
    if (dto.notes !== undefined) booking.notes = dto.notes;
    await this.history.transition(booking, 'completed', userId, dto.notes);

    const earning = await this.recordEarning(agent.id, booking);

    await this.notifyCustomer(booking, {
      title: 'Service completed',
      message: `Booking ${booking.bookingNumber} is done — rate your experience.`,
      type: 'booking_completed',
    });

    return {
      ...this.toStatusResponse(booking),
      endTime: booking.endTime,
      earning: {
        serviceHours: Number(earning.serviceHours),
        revenueGenerated: Number(earning.revenueGenerated),
        earningAmount: Number(earning.earningAmount),
        earningDate: earning.earningDate,
      },
    };
  }

  /**
   * Agent payout: per-hour rates from `service_pricing` when every booked
   * service has one, otherwise a flat percentage of the booking revenue.
   */
  private async recordEarning(agentId: string, booking: Booking) {
    const existing = await this.earningRepo.findOne({
      where: { bookingId: booking.id },
    });
    if (existing) return existing;

    const serviceHours = booking.durationMinutes / 60;
    const revenueGenerated = Number(booking.totalAmount);
    const fromPricing = await this.payoutFromPricing(booking);

    const payoutPercent = await this.settings.getNumber(
      SETTING_KEYS.AGENT_PAYOUT_PERCENT,
      DEFAULT_PAYOUT_PERCENT,
    );
    const earningAmount =
      fromPricing ?? (revenueGenerated * payoutPercent) / 100;

    return this.earningRepo.save(
      this.earningRepo.create({
        agentId,
        bookingId: booking.id,
        serviceHours: serviceHours.toFixed(2),
        revenueGenerated: revenueGenerated.toFixed(2),
        earningAmount: earningAmount.toFixed(2),
        earningDate: todayString(),
      }),
    );
  }

  /** Returns null unless every booked service has a configured hourly payout. */
  private async payoutFromPricing(booking: Booking) {
    const items = booking.items ?? [];
    if (!items.length) return null;

    let total = 0;
    for (const item of items) {
      const payout = await this.hourlyPayout(item, booking.serviceAreaId);
      if (payout === null) return null;
      const minutes = item.durationMinutes ?? booking.durationMinutes;
      total += payout * (minutes / 60) * (item.quantity || 1);
    }
    return total;
  }

  private async hourlyPayout(item: BookingItem, serviceAreaId: string | null) {
    const rows = await this.pricingRepo.find({
      where: { serviceId: item.serviceId, isActive: true },
    });
    // Area-specific pricing wins over the national default.
    const pricing =
      rows.find((row) => row.serviceAreaId === serviceAreaId) ??
      rows.find((row) => row.serviceAreaId === null);
    return pricing?.agentPayoutPerHour
      ? Number(pricing.agentPayoutPerHour)
      : null;
  }

  private async requireBooking(bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: DETAIL_RELATIONS,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private async requireAssignedBooking(bookingId: string, agentId: string) {
    const booking = await this.requireBooking(bookingId);
    if (booking.agentId !== agentId) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  private notifyCustomer(
    booking: Booking,
    input: { title: string; message: string; type: string },
  ) {
    const customerUserId = booking.customer?.userId;
    if (!customerUserId) return Promise.resolve(undefined);
    return this.notifications.toUser(customerUserId, {
      ...input,
      data: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
    });
  }

  private toListItem(booking: Booking, agentId: string) {
    const isMine = booking.agentId === agentId;
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: Number(booking.totalAmount),
      services: (booking.items ?? [])
        .map((item) => item.service?.name)
        .filter((name): name is string => !!name),
      address: this.toAddress(booking.address, isMine),
      customerFirstName: booking.customer?.firstName ?? null,
      isAssignedToMe: isMine,
    };
  }

  /** Street-level detail is withheld until the agent owns the job. */
  private toAddress(address: CustomerAddress | null, isMine: boolean) {
    if (!address) return null;
    return {
      locality: address.addressLine2 ?? address.landmark,
      city: address.city,
      pincode: address.pincode,
      latitude: address.latitude === null ? null : Number(address.latitude),
      longitude: address.longitude === null ? null : Number(address.longitude),
      ...(isMine
        ? {
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            state: address.state,
          }
        : {}),
    };
  }

  private toStatusResponse(booking: Booking) {
    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
    };
  }
}

function buildDateFilter(from?: string, to?: string) {
  if (from && to) return Between(from, to);
  if (from) return MoreThanOrEqual(from);
  if (to) return LessThanOrEqual(to);
  return undefined;
}
