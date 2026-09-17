import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  Booking,
  BookingItem,
  Coupon,
  CouponUsage,
  CustomerAddress,
  Payment,
  Rating,
  Service,
  ServiceArea,
  ServicePricing,
} from 'src/database/entities';
import { IdentityService } from 'src/common/auth/identity.service';
import { BookingHistoryService } from 'src/common/booking/booking-history.service';
import {
  RESCHEDULABLE,
  assertTransition,
} from 'src/common/booking/booking-status';
import { NotificationDispatchService } from 'src/common/services/notification-dispatch.service';
import {
  SETTING_KEYS,
  SettingsService,
} from 'src/common/services/settings.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { CreateCustomerBookingDto } from './dto/create-booking.dto';
import { CancelCustomerBookingDto } from './dto/cancel-booking.dto';
import { ListCustomerBookingsQueryDto } from './dto/list-bookings.dto';
import { RescheduleCustomerBookingDto } from './dto/reschedule-booking.dto';

const DETAIL_RELATIONS = [
  'items',
  'items.service',
  'address',
  'payment',
  'agent',
  'agent.user',
  'ratings',
  'ratings.reviews',
];

/** Priced line as it is computed before the booking row exists. */
interface PricedItem {
  service: Service;
  quantity: number;
  durationMinutes: number;
  pricePerHour: number;
  amount: number;
}

@Injectable()
export class CustomerBookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingItem)
    private readonly bookingItemRepo: Repository<BookingItem>,
    @InjectRepository(CustomerAddress)
    private readonly addressRepo: Repository<CustomerAddress>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
    @InjectRepository(ServiceArea)
    private readonly serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepo: Repository<CouponUsage>,
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    private readonly identity: IdentityService,
    private readonly history: BookingHistoryService,
    private readonly notifications: NotificationDispatchService,
    private readonly settings: SettingsService,
  ) {}

  async create(userId: string, dto: CreateCustomerBookingDto) {
    const customerId = await this.identity.requireCustomerId(userId);
    const address = await this.addressRepo.findOne({
      where: { id: dto.addressId, customerId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.bookingDate < toDateString(new Date())) {
      throw new BadRequestException('bookingDate cannot be in the past');
    }
    const startTime = toTimeString(dto.startTime);

    const serviceArea = address.pincode
      ? await this.serviceAreaRepo.findOne({
          where: { pincode: address.pincode, isActive: true },
        })
      : null;

    const priced = await this.priceItems(dto, serviceArea?.id ?? null);
    const subtotal = round2(
      priced.reduce((total, item) => total + item.amount, 0),
    );

    const coupon = dto.couponCode
      ? await this.resolveCoupon(dto.couponCode, subtotal)
      : null;
    const discount = coupon?.discount ?? 0;

    const taxPercent = await this.settings.getNumber(
      SETTING_KEYS.BOOKING_TAX_PERCENT,
      0,
    );
    const tax = round2(((subtotal - discount) * taxPercent) / 100);
    const totalAmount = round2(subtotal - discount + tax);

    const booking = await this.bookingRepo.save(
      this.bookingRepo.create({
        bookingNumber: await this.generateBookingNumber(),
        customerId,
        addressId: address.id,
        serviceAreaId: serviceArea?.id ?? null,
        bookingDate: dto.bookingDate,
        startTime,
        durationMinutes: priced.reduce(
          (total, item) => total + item.durationMinutes * item.quantity,
          0,
        ),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paymentStatus: 'PENDING',
        status: 'finding',
        startOtp: String(randomInt(1000, 10000)),
        notes: dto.notes ?? null,
      }),
    );

    await this.bookingItemRepo.save(
      priced.map((item) =>
        this.bookingItemRepo.create({
          bookingId: booking.id,
          serviceId: item.service.id,
          quantity: item.quantity,
          durationMinutes: item.durationMinutes,
          pricePerHour: item.pricePerHour.toFixed(2),
          amount: item.amount.toFixed(2),
        }),
      ),
    );

    await this.paymentRepo.save(
      this.paymentRepo.create({
        bookingId: booking.id,
        customerId,
        amount: totalAmount.toFixed(2),
        paymentStatus: 'PENDING',
      }),
    );

    if (coupon) {
      await this.couponUsageRepo.save(
        this.couponUsageRepo.create({
          couponId: coupon.coupon.id,
          customerId,
          bookingId: booking.id,
          discountAmount: coupon.discount.toFixed(2),
        }),
      );
      await this.couponRepo.increment({ id: coupon.coupon.id }, 'usedCount', 1);
    }

    await this.history.record(
      booking.id,
      booking.status,
      userId,
      'Booking created by customer',
    );

    await this.notifications.toUser(userId, {
      title: 'Booking placed',
      message: `Booking ${booking.bookingNumber} is placed for ${booking.bookingDate} at ${booking.startTime}. Complete the payment so we can find an agent.`,
      type: 'booking',
      data: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
    });

    return this.detail(userId, booking.id);
  }

  async list(userId: string, query: ListCustomerBookingsQueryDto) {
    const customerId = await this.identity.requireCustomerId(userId);

    const [bookings, total] = await this.bookingRepo.findAndCount({
      where: {
        customerId,
        ...(query.status ? { status: query.status } : {}),
        ...dateRangeWhere(query.from, query.to),
      },
      relations: ['items', 'items.service', 'agent'],
      order: { bookingDate: 'DESC', startTime: 'DESC', createdAt: 'DESC' },
      ...skipTake(query),
    });

    const items = bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      totalAmount: Number(booking.totalAmount),
      services: (booking.items ?? []).map((item) => item.service?.name ?? ''),
      agent: booking.agent
        ? {
            agentId: booking.agent.id,
            name: agentName(booking.agent.firstName, booking.agent.lastName),
            profileImage: booking.agent.profileImage,
          }
        : null,
    }));

    return paginated(items, total, query);
  }

  async detail(userId: string, id: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const booking = await this.findOwn(customerId, id, DETAIL_RELATIONS);
    const statusHistory = await this.history.history(booking.id);
    const rating = (booking.ratings ?? [])[0] ?? null;

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      subtotal: Number(booking.subtotal),
      discount: Number(booking.discount),
      tax: Number(booking.tax),
      totalAmount: Number(booking.totalAmount),
      notes: booking.notes,
      // Handed to the agent on arrival to start the job.
      startOtp: booking.startOtp,
      serviceAreaId: booking.serviceAreaId,
      items: (booking.items ?? []).map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.service?.name ?? null,
        quantity: item.quantity,
        durationMinutes: item.durationMinutes,
        pricePerHour:
          item.pricePerHour === null ? null : Number(item.pricePerHour),
        amount: item.amount === null ? null : Number(item.amount),
      })),
      address: booking.address
        ? {
            id: booking.address.id,
            addressLine1: booking.address.addressLine1,
            addressLine2: booking.address.addressLine2,
            landmark: booking.address.landmark,
            city: booking.address.city,
            state: booking.address.state,
            pincode: booking.address.pincode,
            latitude: toNumberOrNull(booking.address.latitude),
            longitude: toNumberOrNull(booking.address.longitude),
            addressType: booking.address.addressType,
          }
        : null,
      payment: booking.payment
        ? {
            id: booking.payment.id,
            amount: Number(booking.payment.amount),
            paymentStatus: booking.payment.paymentStatus,
            paymentMethod: booking.payment.paymentMethod,
            paidAt: booking.payment.paidAt,
          }
        : null,
      agent: booking.agent
        ? {
            agentId: booking.agent.id,
            name: agentName(booking.agent.firstName, booking.agent.lastName),
            profileImage: booking.agent.profileImage,
            mobile: booking.agent.user?.mobile ?? null,
          }
        : null,
      statusHistory: statusHistory.map((row) => ({
        status: row.status,
        remarks: row.remarks,
        createdAt: row.createdAt,
      })),
      rating: rating
        ? {
            id: rating.id,
            rating: Number(rating.rating),
            review: (rating.reviews ?? [])[0]?.reviewText ?? null,
            createdAt: rating.createdAt,
          }
        : null,
      createdAt: booking.createdAt,
    };
  }

  async cancel(userId: string, id: string, dto: CancelCustomerBookingDto) {
    const customerId = await this.identity.requireCustomerId(userId);
    const booking = await this.findOwn(customerId, id, ['payment', 'agent']);
    // Checked up front so a rejected cancellation leaves the payment untouched.
    assertTransition(booking.status, 'cancelled');

    // A captured payment is refunded, an unpaid one is simply voided.
    const nextPaymentStatus =
      booking.payment?.paymentStatus === 'PAID' ? 'REFUNDED' : 'VOIDED';
    if (booking.payment) {
      booking.payment.paymentStatus = nextPaymentStatus;
      await this.paymentRepo.save(booking.payment);
    }
    booking.paymentStatus = nextPaymentStatus;

    const remarks = dto.reason
      ? `Cancelled by customer: ${dto.reason}`
      : 'Cancelled by customer';
    await this.history.transition(booking, 'cancelled', userId, remarks);

    if (booking.agent) {
      await this.notifications.toUser(booking.agent.userId, {
        title: 'Booking cancelled',
        message: `Booking ${booking.bookingNumber} was cancelled by the customer.`,
        type: 'booking',
        data: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
      });
    }

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      cancelledReason: dto.reason ?? null,
    };
  }

  async reschedule(
    userId: string,
    id: string,
    dto: RescheduleCustomerBookingDto,
  ) {
    const customerId = await this.identity.requireCustomerId(userId);
    const booking = await this.findOwn(customerId, id, ['agent']);

    if (!RESCHEDULABLE.includes(booking.status)) {
      throw new BadRequestException(
        `A ${booking.status} booking cannot be rescheduled`,
      );
    }

    const startTime = toTimeString(dto.startTime);
    if (new Date(`${dto.bookingDate}T${startTime}`).getTime() <= Date.now()) {
      throw new BadRequestException('The new slot must be in the future');
    }

    const previous = `${booking.bookingDate} ${booking.startTime}`;
    booking.bookingDate = dto.bookingDate;
    booking.startTime = startTime;
    await this.bookingRepo.save(booking);

    const remarks = `Rescheduled from ${previous} to ${dto.bookingDate} ${startTime}${
      dto.reason ? ` (${dto.reason})` : ''
    }`;
    await this.history.record(booking.id, booking.status, userId, remarks);

    if (booking.agent) {
      await this.notifications.toUser(booking.agent.userId, {
        title: 'Booking rescheduled',
        message: `Booking ${booking.bookingNumber} moved to ${dto.bookingDate} at ${startTime}.`,
        type: 'booking',
        data: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
      });
    }

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
    };
  }

  async agent(userId: string, id: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const booking = await this.findOwn(customerId, id, ['agent', 'agent.user']);
    if (!booking.agent) throw new NotFoundException('No agent assigned yet');

    const stats = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.agent_id = :agentId', { agentId: booking.agent.id })
      .getRawOne<{ average: string | null; count: string }>();

    const average = stats?.average ? Number(stats.average) : null;

    return {
      bookingId: booking.id,
      agentId: booking.agent.id,
      name: agentName(booking.agent.firstName, booking.agent.lastName),
      profileImage: booking.agent.profileImage,
      mobile: booking.agent.user?.mobile ?? null,
      averageRating: average === null ? null : round2(average),
      ratingCount: Number(stats?.count ?? 0),
    };
  }

  private async findOwn(
    customerId: string,
    id: string,
    relations: string[] = [],
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id, customerId },
      relations,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /** Resolves every line to an active service and a usable price. */
  private async priceItems(
    dto: CreateCustomerBookingDto,
    serviceAreaId: string | null,
  ): Promise<PricedItem[]> {
    const serviceIds = [...new Set(dto.items.map((item) => item.serviceId))];
    const services = await this.serviceRepo.find({
      where: { id: In(serviceIds), isActive: true },
    });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        'One or more of the selected services is unavailable',
      );
    }
    const byId = new Map(services.map((service) => [service.id, service]));

    const pricing = await this.pricingRepo.find({
      where: { serviceId: In(serviceIds), isActive: true },
    });

    return dto.items.map((item) => {
      const service = byId.get(item.serviceId) as Service;
      const rows = pricing.filter((row) => row.serviceId === service.id);
      const price =
        (serviceAreaId
          ? rows.find((row) => row.serviceAreaId === serviceAreaId)
          : undefined) ?? rows.find((row) => row.serviceAreaId === null);
      if (!price) {
        throw new BadRequestException(
          `No price is configured for ${service.name}`,
        );
      }

      const quantity = item.quantity ?? 1;
      const durationMinutes = item.durationMinutes ?? service.durationMinutes;
      const pricePerHour = Number(price.pricePerHour);

      return {
        service,
        quantity,
        durationMinutes,
        pricePerHour,
        amount: round2((pricePerHour * durationMinutes * quantity) / 60),
      };
    });
  }

  /** Validates a coupon against the subtotal and returns the discount. */
  private async resolveCoupon(code: string, subtotal: number) {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.trim().toUpperCase() },
    });
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('This coupon code is not valid');
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    const minOrderAmount = Number(coupon.minOrderAmount ?? 0);
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(
        `This coupon needs a minimum order of ${minOrderAmount.toFixed(2)}`,
      );
    }

    const value = Number(coupon.discountValue);
    let discount =
      coupon.discountType.toUpperCase() === 'PERCENT'
        ? (subtotal * value) / 100
        : value;
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    return { coupon, discount: round2(Math.min(discount, subtotal)) };
  }

  /** `CL` + yymmdd + 5 random digits, retried until it is unique. */
  private async generateBookingNumber() {
    const now = new Date();
    const stamp = toDateString(now).slice(2).replace(/-/g, '');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const bookingNumber = `CL${stamp}${String(randomInt(0, 100000)).padStart(5, '0')}`;
      const taken = await this.bookingRepo.findOne({
        where: { bookingNumber },
        select: ['id'],
      });
      if (!taken) return bookingNumber;
    }

    throw new ConflictException(
      'Could not allocate a booking number, please retry',
    );
  }
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function toNumberOrNull(value: string | null) {
  return value === null ? null : Number(value);
}

function toDateString(date: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `time` columns are stored as 'HH:MM:SS'. */
function toTimeString(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

function agentName(firstName: string, lastName: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function dateRangeWhere(from?: string, to?: string) {
  if (from && to) return { bookingDate: Between(from, to) };
  if (from) return { bookingDate: MoreThanOrEqual(from) };
  if (to) return { bookingDate: LessThanOrEqual(to) };
  return {};
}
