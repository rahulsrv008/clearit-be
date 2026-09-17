import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Coupon, CouponUsage } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import {
  PaginationQueryDto,
  paginated,
  skipTake,
} from 'src/common/dto/pagination.dto';
import { ListAdminCouponsDto } from './dto/list-coupons.dto';
import { CreateAdminCouponDto } from './dto/create-coupon.dto';
import { UpdateAdminCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class AdminCouponsService {
  constructor(
    @InjectRepository(Coupon) private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly usageRepo: Repository<CouponUsage>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminCouponsDto) {
    const { skip, take } = skipTake(query);

    const [rows, total] = await Promise.all([
      this.applyFilters(this.couponRepo.createQueryBuilder('coupon'), query)
        .orderBy('coupon.createdAt', 'DESC')
        .offset(skip)
        .limit(take)
        .getMany(),
      this.applyFilters(
        this.couponRepo.createQueryBuilder('coupon'),
        query,
      ).getCount(),
    ]);

    return paginated(
      rows.map((row) => this.toResponse(row)),
      total,
      query,
    );
  }

  async create(adminId: string, dto: CreateAdminCouponDto) {
    const code = dto.code.trim().toUpperCase();
    this.assertDiscountRules(dto.discountType, dto.discountValue);
    this.assertValidityWindow(dto.validFrom, dto.validUntil);

    const existing = await this.couponRepo.findOne({
      where: { code },
      select: ['id'],
    });
    if (existing) throw new ConflictException('Coupon code already exists');

    const coupon = await this.couponRepo.save(
      this.couponRepo.create({
        code,
        discountType: dto.discountType,
        discountValue: dto.discountValue.toFixed(2),
        maxDiscount:
          dto.maxDiscount === undefined ? null : dto.maxDiscount.toFixed(2),
        minOrderAmount:
          dto.minOrderAmount === undefined
            ? null
            : dto.minOrderAmount.toFixed(2),
        usageLimit: dto.usageLimit ?? null,
        usedCount: 0,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'COUPON_CREATED',
      entityType: 'coupons',
      entityId: coupon.id,
      oldData: null,
      newData: this.snapshot(coupon),
    });

    return this.toResponse(coupon);
  }

  async update(adminId: string, id: string, dto: UpdateAdminCouponDto) {
    const coupon = await this.requireCoupon(id);
    const oldData = this.snapshot(coupon);

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      if (code !== coupon.code) {
        const taken = await this.couponRepo.findOne({
          where: { code, id: Not(coupon.id) },
          select: ['id'],
        });
        if (taken) throw new ConflictException('Coupon code already exists');
      }
      coupon.code = code;
    }
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.discountValue !== undefined) {
      coupon.discountValue = dto.discountValue.toFixed(2);
    }
    if (dto.maxDiscount !== undefined) {
      coupon.maxDiscount = dto.maxDiscount.toFixed(2);
    }
    if (dto.minOrderAmount !== undefined) {
      coupon.minOrderAmount = dto.minOrderAmount.toFixed(2);
    }
    if (dto.usageLimit !== undefined) coupon.usageLimit = dto.usageLimit;
    if (dto.validFrom !== undefined) {
      coupon.validFrom = new Date(dto.validFrom);
    }
    if (dto.validUntil !== undefined) {
      coupon.validUntil = new Date(dto.validUntil);
    }
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;

    this.assertDiscountRules(coupon.discountType, Number(coupon.discountValue));
    this.assertValidityWindow(coupon.validFrom, coupon.validUntil);

    await this.couponRepo.save(coupon);

    await this.audit.record({
      userId: adminId,
      action: 'COUPON_UPDATED',
      entityType: 'coupons',
      entityId: coupon.id,
      oldData,
      newData: this.snapshot(coupon),
    });

    return this.toResponse(coupon);
  }

  /** Redeemed coupons are kept for reporting, so they are only deactivated. */
  async remove(adminId: string, id: string) {
    const coupon = await this.requireCoupon(id);
    const oldData = this.snapshot(coupon);

    const usageCount = await this.usageRepo.count({ where: { couponId: id } });

    if (usageCount) {
      if (!coupon.isActive) {
        throw new BadRequestException('Coupon is already deactivated');
      }
      coupon.isActive = false;
      await this.couponRepo.save(coupon);

      await this.audit.record({
        userId: adminId,
        action: 'COUPON_DEACTIVATED',
        entityType: 'coupons',
        entityId: coupon.id,
        oldData,
        newData: this.snapshot(coupon),
      });

      return {
        deleted: false,
        deactivated: true,
        reason: `Coupon was redeemed ${usageCount} time(s), so it was deactivated instead of deleted`,
      };
    }

    await this.couponRepo.delete({ id });

    await this.audit.record({
      userId: adminId,
      action: 'COUPON_DELETED',
      entityType: 'coupons',
      entityId: id,
      oldData,
      newData: null,
    });

    return { deleted: true, deactivated: false, reason: null };
  }

  async usage(id: string, query: PaginationQueryDto) {
    await this.requireCoupon(id);
    const { skip, take } = skipTake(query);

    const base = () =>
      this.usageRepo
        .createQueryBuilder('usage')
        .innerJoin('usage.customer', 'customer')
        .leftJoin('usage.booking', 'booking')
        .where('usage.couponId = :id', { id });

    const [rows, total] = await Promise.all([
      base()
        .select('usage.id', 'id')
        .addSelect('usage.customerId', 'customerId')
        .addSelect('customer.firstName', 'firstName')
        .addSelect('customer.lastName', 'lastName')
        .addSelect('usage.bookingId', 'bookingId')
        .addSelect('booking.bookingNumber', 'bookingNumber')
        .addSelect('usage.discountAmount', 'discountAmount')
        .addSelect('usage.createdAt', 'createdAt')
        .orderBy('usage.createdAt', 'DESC')
        .offset(skip)
        .limit(take)
        .getRawMany<{
          id: string;
          customerId: string;
          firstName: string | null;
          lastName: string | null;
          bookingId: string | null;
          bookingNumber: string | null;
          discountAmount: string | null;
          createdAt: Date;
        }>(),
      base().getCount(),
    ]);

    return paginated(
      rows.map((row) => ({
        id: row.id,
        customerId: row.customerId,
        customerName:
          [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
          null,
        bookingId: row.bookingId,
        bookingNumber: row.bookingNumber,
        discountAmount:
          row.discountAmount === null ? null : Number(row.discountAmount),
        createdAt: row.createdAt,
      })),
      total,
      query,
    );
  }

  private assertDiscountRules(discountType: string, discountValue: number) {
    if (
      discountType === 'PERCENT' &&
      (discountValue < 1 || discountValue > 100)
    ) {
      throw new BadRequestException(
        'A PERCENT discount must be between 1 and 100',
      );
    }
    if (discountType === 'FLAT' && discountValue <= 0) {
      throw new BadRequestException('A FLAT discount must be greater than 0');
    }
  }

  private assertValidityWindow(
    validFrom?: string | Date | null,
    validUntil?: string | Date | null,
  ) {
    if (!validFrom || !validUntil) return;
    if (new Date(validUntil).getTime() <= new Date(validFrom).getTime()) {
      throw new BadRequestException('validUntil must be after validFrom');
    }
  }

  private applyFilters(
    qb: SelectQueryBuilder<Coupon>,
    query: ListAdminCouponsDto,
  ) {
    if (query.search) {
      qb.andWhere('coupon.code ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('coupon.isActive = :isActive', { isActive: query.isActive });
    }
    return qb;
  }

  private async requireCoupon(id: string) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  private snapshot(coupon: Coupon) {
    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
    };
  }

  private toResponse(coupon: Coupon) {
    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      maxDiscount:
        coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
      minOrderAmount:
        coupon.minOrderAmount === null ? null : Number(coupon.minOrderAmount),
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt,
    };
  }
}
