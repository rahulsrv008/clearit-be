import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Booking, ServiceArea, ServicePricing } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListAdminServiceAreasDto } from './dto/list-service-areas.dto';
import { CreateAdminServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateAdminServiceAreaDto } from './dto/update-service-area.dto';

@Injectable()
export class AdminServiceAreasService {
  constructor(
    @InjectRepository(ServiceArea)
    private readonly areaRepo: Repository<ServiceArea>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminServiceAreasDto) {
    const { skip, take } = skipTake(query);

    const [rows, total] = await Promise.all([
      this.applyFilters(this.areaRepo.createQueryBuilder('area'), query)
        .orderBy('area.name', 'ASC')
        .offset(skip)
        .limit(take)
        .getMany(),
      this.applyFilters(
        this.areaRepo.createQueryBuilder('area'),
        query,
      ).getCount(),
    ]);

    return paginated(rows, total, query);
  }

  async create(adminId: string, dto: CreateAdminServiceAreaDto) {
    const area = await this.areaRepo.save(
      this.areaRepo.create({
        name: dto.name.trim(),
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_AREA_CREATED',
      entityType: 'service_areas',
      entityId: area.id,
      oldData: null,
      newData: this.snapshot(area),
    });

    return area;
  }

  async update(adminId: string, id: string, dto: UpdateAdminServiceAreaDto) {
    const area = await this.requireArea(id);
    const oldData = this.snapshot(area);

    if (dto.name !== undefined) area.name = dto.name.trim();
    if (dto.city !== undefined) area.city = dto.city;
    if (dto.state !== undefined) area.state = dto.state;
    if (dto.pincode !== undefined) area.pincode = dto.pincode;
    if (dto.isActive !== undefined) area.isActive = dto.isActive;

    await this.areaRepo.save(area);

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_AREA_UPDATED',
      entityType: 'service_areas',
      entityId: area.id,
      oldData,
      newData: this.snapshot(area),
    });

    return area;
  }

  /** Areas referenced by bookings or pricing are deactivated, not deleted. */
  async remove(adminId: string, id: string) {
    const area = await this.requireArea(id);
    const oldData = this.snapshot(area);

    const [bookingCount, pricingCount] = await Promise.all([
      this.bookingRepo.count({ where: { serviceAreaId: id } }),
      this.pricingRepo.count({ where: { serviceAreaId: id } }),
    ]);

    if (bookingCount || pricingCount) {
      if (!area.isActive) {
        throw new BadRequestException('Service area is already deactivated');
      }
      area.isActive = false;
      await this.areaRepo.save(area);

      await this.audit.record({
        userId: adminId,
        action: 'SERVICE_AREA_DEACTIVATED',
        entityType: 'service_areas',
        entityId: area.id,
        oldData,
        newData: this.snapshot(area),
      });

      return {
        deleted: false,
        deactivated: true,
        reason: `Service area is referenced by ${bookingCount} booking(s) and ${pricingCount} price row(s), so it was deactivated instead of deleted`,
      };
    }

    await this.areaRepo.delete({ id });

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_AREA_DELETED',
      entityType: 'service_areas',
      entityId: id,
      oldData,
      newData: null,
    });

    return { deleted: true, deactivated: false, reason: null };
  }

  private applyFilters(
    qb: SelectQueryBuilder<ServiceArea>,
    query: ListAdminServiceAreasDto,
  ) {
    if (query.search) {
      qb.andWhere(
        `(area.name ILIKE :search OR area.city ILIKE :search
          OR area.pincode ILIKE :search)`,
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('area.isActive = :isActive', { isActive: query.isActive });
    }
    return qb;
  }

  private async requireArea(id: string) {
    const area = await this.areaRepo.findOne({ where: { id } });
    if (!area) throw new NotFoundException('Service area not found');
    return area;
  }

  private snapshot(area: ServiceArea) {
    return {
      name: area.name,
      city: area.city,
      state: area.state,
      pincode: area.pincode,
      isActive: area.isActive,
    };
  }
}
