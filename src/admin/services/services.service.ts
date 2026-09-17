import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  BookingItem,
  Service,
  ServiceCategory,
  ServicePricing,
} from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListAdminServicesDto } from './dto/list-services.dto';
import { CreateAdminServiceDto } from './dto/create-service.dto';
import { UpdateAdminServiceDto } from './dto/update-service.dto';

interface ServiceListRow {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  activePricingCount: number;
  createdAt: Date;
}

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
    @InjectRepository(BookingItem)
    private readonly bookingItemRepo: Repository<BookingItem>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminServicesDto) {
    const { skip, take } = skipTake(query);

    const rowsQb = this.applyFilters(
      this.serviceRepo
        .createQueryBuilder('service')
        .leftJoin('service.category', 'category'),
      query,
    )
      .select('service.id', 'id')
      .addSelect('service.name', 'name')
      .addSelect('service.description', 'description')
      .addSelect('service.durationMinutes', 'durationMinutes')
      .addSelect('service.isActive', 'isActive')
      .addSelect('service.categoryId', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('service.createdAt', 'createdAt')
      .addSelect(
        `(SELECT COUNT(*)::int FROM service_pricing sp
           WHERE sp.service_id = service.id AND sp.is_active = true)`,
        'activePricingCount',
      )
      .orderBy('service.name', 'ASC')
      .offset(skip)
      .limit(take);

    const countQb = this.applyFilters(
      this.serviceRepo
        .createQueryBuilder('service')
        .leftJoin('service.category', 'category'),
      query,
    );

    const [rows, total] = await Promise.all([
      rowsQb.getRawMany<ServiceListRow>(),
      countQb.getCount(),
    ]);

    return paginated(
      rows.map((row) => ({
        ...row,
        durationMinutes: Number(row.durationMinutes),
        activePricingCount: Number(row.activePricingCount),
      })),
      total,
      query,
    );
  }

  async create(adminId: string, dto: CreateAdminServiceDto) {
    if (dto.categoryId) await this.requireCategory(dto.categoryId);

    const service = await this.serviceRepo.save(
      this.serviceRepo.create({
        name: dto.name.trim(),
        categoryId: dto.categoryId ?? null,
        description: dto.description ?? null,
        durationMinutes: dto.durationMinutes ?? 60,
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_CREATED',
      entityType: 'services',
      entityId: service.id,
      oldData: null,
      newData: this.snapshot(service),
    });

    return service;
  }

  async update(adminId: string, id: string, dto: UpdateAdminServiceDto) {
    const service = await this.requireService(id);
    const oldData = this.snapshot(service);

    if (dto.categoryId !== undefined) {
      if (dto.categoryId) await this.requireCategory(dto.categoryId);
      service.categoryId = dto.categoryId ?? null;
    }
    if (dto.name !== undefined) service.name = dto.name.trim();
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.durationMinutes !== undefined) {
      service.durationMinutes = dto.durationMinutes;
    }
    if (dto.isActive !== undefined) service.isActive = dto.isActive;

    await this.serviceRepo.save(service);

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_UPDATED',
      entityType: 'services',
      entityId: service.id,
      oldData,
      newData: this.snapshot(service),
    });

    return service;
  }

  /**
   * Services referenced by a booking item are historical records, so those are
   * deactivated instead of deleted. Unused services go away with their pricing.
   */
  async remove(adminId: string, id: string) {
    const service = await this.requireService(id);
    const oldData = this.snapshot(service);

    const bookedCount = await this.bookingItemRepo.count({
      where: { serviceId: id },
    });

    if (bookedCount) {
      if (!service.isActive) {
        throw new BadRequestException('Service is already deactivated');
      }
      service.isActive = false;
      await this.serviceRepo.save(service);

      await this.audit.record({
        userId: adminId,
        action: 'SERVICE_DEACTIVATED',
        entityType: 'services',
        entityId: service.id,
        oldData,
        newData: this.snapshot(service),
      });

      return {
        deleted: false,
        deactivated: true,
        reason: `Service is used by ${bookedCount} booking item(s), so it was deactivated instead of deleted`,
      };
    }

    await this.pricingRepo.delete({ serviceId: id });
    await this.serviceRepo.delete({ id });

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_DELETED',
      entityType: 'services',
      entityId: id,
      oldData,
      newData: null,
    });

    return { deleted: true, deactivated: false, reason: null };
  }

  private applyFilters(
    qb: SelectQueryBuilder<Service>,
    query: ListAdminServicesDto,
  ) {
    if (query.search) {
      qb.andWhere('service.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.categoryId) {
      qb.andWhere('service.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', { isActive: query.isActive });
    }
    return qb;
  }

  private async requireService(id: string) {
    const service = await this.serviceRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private async requireCategory(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      select: ['id'],
    });
    if (!category) throw new NotFoundException('Service category not found');
    return category;
  }

  private snapshot(service: Service) {
    return {
      name: service.name,
      categoryId: service.categoryId,
      description: service.description,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
    };
  }
}
