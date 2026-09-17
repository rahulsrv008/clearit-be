import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Service, ServiceArea, ServicePricing } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListAdminPricingDto } from './dto/list-pricing.dto';
import { CreateAdminPricingDto } from './dto/create-pricing.dto';
import { UpdateAdminPricingDto } from './dto/update-pricing.dto';

interface PricingListRow {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceAreaId: string | null;
  serviceAreaName: string | null;
  pricePerHour: string;
  agentPayoutPerHour: string | null;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class AdminPricingService {
  constructor(
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServiceArea)
    private readonly areaRepo: Repository<ServiceArea>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminPricingDto) {
    const { skip, take } = skipTake(query);

    const rowsQb = this.applyFilters(
      this.pricingRepo
        .createQueryBuilder('pricing')
        .innerJoin('pricing.service', 'service')
        .leftJoin('pricing.serviceArea', 'area'),
      query,
    )
      .select('pricing.id', 'id')
      .addSelect('pricing.serviceId', 'serviceId')
      .addSelect('service.name', 'serviceName')
      .addSelect('pricing.serviceAreaId', 'serviceAreaId')
      .addSelect('area.name', 'serviceAreaName')
      .addSelect('pricing.pricePerHour', 'pricePerHour')
      .addSelect('pricing.agentPayoutPerHour', 'agentPayoutPerHour')
      .addSelect('pricing.isActive', 'isActive')
      .addSelect('pricing.createdAt', 'createdAt')
      .orderBy('service.name', 'ASC')
      .addOrderBy('area.name', 'ASC')
      .offset(skip)
      .limit(take);

    const countQb = this.applyFilters(
      this.pricingRepo
        .createQueryBuilder('pricing')
        .innerJoin('pricing.service', 'service')
        .leftJoin('pricing.serviceArea', 'area'),
      query,
    );

    const [rows, total] = await Promise.all([
      rowsQb.getRawMany<PricingListRow>(),
      countQb.getCount(),
    ]);

    return paginated(
      rows.map((row) => ({
        ...row,
        pricePerHour: Number(row.pricePerHour),
        agentPayoutPerHour:
          row.agentPayoutPerHour === null
            ? null
            : Number(row.agentPayoutPerHour),
      })),
      total,
      query,
    );
  }

  async create(adminId: string, dto: CreateAdminPricingDto) {
    await this.requireService(dto.serviceId);
    if (dto.serviceAreaId) await this.requireArea(dto.serviceAreaId);

    await this.assertNoActiveClash(dto.serviceId, dto.serviceAreaId ?? null);

    const pricing = await this.pricingRepo.save(
      this.pricingRepo.create({
        serviceId: dto.serviceId,
        serviceAreaId: dto.serviceAreaId ?? null,
        pricePerHour: dto.pricePerHour.toFixed(2),
        agentPayoutPerHour:
          dto.agentPayoutPerHour === undefined
            ? null
            : dto.agentPayoutPerHour.toFixed(2),
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'PRICING_CREATED',
      entityType: 'service_pricing',
      entityId: pricing.id,
      oldData: null,
      newData: this.snapshot(pricing),
    });

    return this.toResponse(pricing);
  }

  async update(adminId: string, id: string, dto: UpdateAdminPricingDto) {
    const pricing = await this.requirePricing(id);
    const oldData = this.snapshot(pricing);

    if (dto.serviceId !== undefined) {
      await this.requireService(dto.serviceId);
      pricing.serviceId = dto.serviceId;
    }
    if (dto.serviceAreaId !== undefined) {
      if (dto.serviceAreaId) await this.requireArea(dto.serviceAreaId);
      pricing.serviceAreaId = dto.serviceAreaId ?? null;
    }
    if (dto.pricePerHour !== undefined) {
      pricing.pricePerHour = dto.pricePerHour.toFixed(2);
    }
    if (dto.agentPayoutPerHour !== undefined) {
      pricing.agentPayoutPerHour = dto.agentPayoutPerHour.toFixed(2);
    }
    if (dto.isActive !== undefined) pricing.isActive = dto.isActive;

    // Moving or re-activating a row must not create a second active price for
    // the same service + area pair.
    if (pricing.isActive) {
      await this.assertNoActiveClash(
        pricing.serviceId,
        pricing.serviceAreaId,
        pricing.id,
      );
    }

    await this.pricingRepo.save(pricing);

    await this.audit.record({
      userId: adminId,
      action: 'PRICING_UPDATED',
      entityType: 'service_pricing',
      entityId: pricing.id,
      oldData,
      newData: this.snapshot(pricing),
    });

    return this.toResponse(pricing);
  }

  /** Never hard deleted — bookings quote historical prices from these rows. */
  async deactivate(adminId: string, id: string) {
    const pricing = await this.requirePricing(id);
    if (!pricing.isActive) {
      throw new BadRequestException('Pricing row is already inactive');
    }

    const oldData = this.snapshot(pricing);
    pricing.isActive = false;
    await this.pricingRepo.save(pricing);

    await this.audit.record({
      userId: adminId,
      action: 'PRICING_DEACTIVATED',
      entityType: 'service_pricing',
      entityId: pricing.id,
      oldData,
      newData: this.snapshot(pricing),
    });

    return {
      deleted: false,
      deactivated: true,
      reason:
        'Pricing rows are kept for historical bookings, so this price was deactivated instead of deleted',
    };
  }

  private async assertNoActiveClash(
    serviceId: string,
    serviceAreaId: string | null,
    ignoreId?: string,
  ) {
    const clash = await this.pricingRepo.findOne({
      where: {
        serviceId,
        serviceAreaId: serviceAreaId === null ? IsNull() : serviceAreaId,
        isActive: true,
        ...(ignoreId ? { id: Not(ignoreId) } : {}),
      },
      select: ['id'],
    });
    if (clash) {
      throw new ConflictException(
        serviceAreaId
          ? 'An active price already exists for this service and area'
          : 'An active default price already exists for this service',
      );
    }
  }

  private applyFilters(
    qb: SelectQueryBuilder<ServicePricing>,
    query: ListAdminPricingDto,
  ) {
    if (query.search) {
      qb.andWhere('service.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.serviceId) {
      qb.andWhere('pricing.serviceId = :serviceId', {
        serviceId: query.serviceId,
      });
    }
    if (query.serviceAreaId) {
      qb.andWhere('pricing.serviceAreaId = :serviceAreaId', {
        serviceAreaId: query.serviceAreaId,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('pricing.isActive = :isActive', { isActive: query.isActive });
    }
    return qb;
  }

  private async requirePricing(id: string) {
    const pricing = await this.pricingRepo.findOne({ where: { id } });
    if (!pricing) throw new NotFoundException('Pricing row not found');
    return pricing;
  }

  private async requireService(id: string) {
    const service = await this.serviceRepo.findOne({
      where: { id },
      select: ['id'],
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private async requireArea(id: string) {
    const area = await this.areaRepo.findOne({
      where: { id },
      select: ['id'],
    });
    if (!area) throw new NotFoundException('Service area not found');
    return area;
  }

  private snapshot(pricing: ServicePricing) {
    return {
      serviceId: pricing.serviceId,
      serviceAreaId: pricing.serviceAreaId,
      pricePerHour: pricing.pricePerHour,
      agentPayoutPerHour: pricing.agentPayoutPerHour,
      isActive: pricing.isActive,
    };
  }

  private toResponse(pricing: ServicePricing) {
    return {
      id: pricing.id,
      serviceId: pricing.serviceId,
      serviceAreaId: pricing.serviceAreaId,
      pricePerHour: Number(pricing.pricePerHour),
      agentPayoutPerHour:
        pricing.agentPayoutPerHour === null
          ? null
          : Number(pricing.agentPayoutPerHour),
      isActive: pricing.isActive,
      createdAt: pricing.createdAt,
    };
  }
}
