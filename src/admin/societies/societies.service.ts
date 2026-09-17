import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Society } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListAdminSocietiesDto } from './dto/list-societies.dto';
import { CreateAdminSocietyDto } from './dto/create-society.dto';
import { UpdateAdminSocietyDto } from './dto/update-society.dto';

@Injectable()
export class AdminSocietiesService {
  constructor(
    @InjectRepository(Society)
    private readonly societyRepo: Repository<Society>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminSocietiesDto) {
    const { skip, take } = skipTake(query);

    const [rows, total] = await Promise.all([
      this.applyFilters(this.societyRepo.createQueryBuilder('society'), query)
        .orderBy('society.name', 'ASC')
        .offset(skip)
        .limit(take)
        .getMany(),
      this.applyFilters(
        this.societyRepo.createQueryBuilder('society'),
        query,
      ).getCount(),
    ]);

    return paginated(
      rows.map((row) => this.toResponse(row)),
      total,
      query,
    );
  }

  async create(adminId: string, dto: CreateAdminSocietyDto) {
    const society = await this.societyRepo.save(
      this.societyRepo.create({
        name: dto.name.trim(),
        address: dto.address ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
        latitude: dto.latitude === undefined ? null : dto.latitude.toFixed(7),
        longitude:
          dto.longitude === undefined ? null : dto.longitude.toFixed(7),
        totalUnits: dto.totalUnits ?? null,
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'SOCIETY_CREATED',
      entityType: 'societies',
      entityId: society.id,
      oldData: null,
      newData: this.snapshot(society),
    });

    return this.toResponse(society);
  }

  async update(adminId: string, id: string, dto: UpdateAdminSocietyDto) {
    const society = await this.requireSociety(id);
    const oldData = this.snapshot(society);

    if (dto.name !== undefined) society.name = dto.name.trim();
    if (dto.address !== undefined) society.address = dto.address;
    if (dto.city !== undefined) society.city = dto.city;
    if (dto.state !== undefined) society.state = dto.state;
    if (dto.pincode !== undefined) society.pincode = dto.pincode;
    if (dto.latitude !== undefined) {
      society.latitude = dto.latitude.toFixed(7);
    }
    if (dto.longitude !== undefined) {
      society.longitude = dto.longitude.toFixed(7);
    }
    if (dto.totalUnits !== undefined) society.totalUnits = dto.totalUnits;
    if (dto.isActive !== undefined) society.isActive = dto.isActive;

    await this.societyRepo.save(society);

    await this.audit.record({
      userId: adminId,
      action: 'SOCIETY_UPDATED',
      entityType: 'societies',
      entityId: society.id,
      oldData,
      newData: this.snapshot(society),
    });

    return this.toResponse(society);
  }

  /** Nothing references societies, so this is a real delete. */
  async remove(adminId: string, id: string) {
    const society = await this.requireSociety(id);
    const oldData = this.snapshot(society);

    await this.societyRepo.delete({ id });

    await this.audit.record({
      userId: adminId,
      action: 'SOCIETY_DELETED',
      entityType: 'societies',
      entityId: id,
      oldData,
      newData: null,
    });

    return { deleted: true, deactivated: false, reason: null };
  }

  private applyFilters(
    qb: SelectQueryBuilder<Society>,
    query: ListAdminSocietiesDto,
  ) {
    if (query.search) {
      qb.andWhere(
        `(society.name ILIKE :search OR society.city ILIKE :search
          OR society.pincode ILIKE :search)`,
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('society.isActive = :isActive', { isActive: query.isActive });
    }
    return qb;
  }

  private async requireSociety(id: string) {
    const society = await this.societyRepo.findOne({ where: { id } });
    if (!society) throw new NotFoundException('Society not found');
    return society;
  }

  private snapshot(society: Society) {
    return {
      name: society.name,
      address: society.address,
      city: society.city,
      state: society.state,
      pincode: society.pincode,
      latitude: society.latitude,
      longitude: society.longitude,
      totalUnits: society.totalUnits,
      isActive: society.isActive,
    };
  }

  private toResponse(society: Society) {
    return {
      id: society.id,
      name: society.name,
      address: society.address,
      city: society.city,
      state: society.state,
      pincode: society.pincode,
      latitude: society.latitude === null ? null : Number(society.latitude),
      longitude: society.longitude === null ? null : Number(society.longitude),
      totalUnits: society.totalUnits,
      isActive: society.isActive,
      createdAt: society.createdAt,
    };
  }
}
