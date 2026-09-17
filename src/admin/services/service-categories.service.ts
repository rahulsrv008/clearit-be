import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Service, ServiceCategory } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListAdminServiceCategoriesDto } from './dto/list-service-categories.dto';
import { CreateAdminServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateAdminServiceCategoryDto } from './dto/update-service-category.dto';

interface CategoryListRow {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  serviceCount: number;
  activeServiceCount: number;
  createdAt: Date;
}

@Injectable()
export class AdminServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminServiceCategoriesDto) {
    const { skip, take } = skipTake(query);

    const rowsQb = this.applyFilters(
      this.categoryRepo.createQueryBuilder('category'),
      query,
    )
      .select('category.id', 'id')
      .addSelect('category.name', 'name')
      .addSelect('category.description', 'description')
      .addSelect('category.imageUrl', 'imageUrl')
      .addSelect('category.isActive', 'isActive')
      .addSelect('category.createdAt', 'createdAt')
      .addSelect(
        `(SELECT COUNT(*)::int FROM services svc
           WHERE svc.category_id = category.id)`,
        'serviceCount',
      )
      .addSelect(
        `(SELECT COUNT(*)::int FROM services svc
           WHERE svc.category_id = category.id AND svc.is_active = true)`,
        'activeServiceCount',
      )
      .orderBy('category.name', 'ASC')
      .offset(skip)
      .limit(take);

    const countQb = this.applyFilters(
      this.categoryRepo.createQueryBuilder('category'),
      query,
    );

    const [rows, total] = await Promise.all([
      rowsQb.getRawMany<CategoryListRow>(),
      countQb.getCount(),
    ]);

    return paginated(
      rows.map((row) => ({
        ...row,
        serviceCount: Number(row.serviceCount),
        activeServiceCount: Number(row.activeServiceCount),
      })),
      total,
      query,
    );
  }

  async create(adminId: string, dto: CreateAdminServiceCategoryDto) {
    const category = await this.categoryRepo.save(
      this.categoryRepo.create({
        name: dto.name.trim(),
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        isActive: dto.isActive ?? true,
      }),
    );

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_CATEGORY_CREATED',
      entityType: 'service_categories',
      entityId: category.id,
      oldData: null,
      newData: this.snapshot(category),
    });

    return category;
  }

  async update(
    adminId: string,
    id: string,
    dto: UpdateAdminServiceCategoryDto,
  ) {
    const category = await this.requireCategory(id);
    const oldData = this.snapshot(category);

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.imageUrl !== undefined) category.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    await this.categoryRepo.save(category);

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_CATEGORY_UPDATED',
      entityType: 'service_categories',
      entityId: category.id,
      oldData,
      newData: this.snapshot(category),
    });

    return category;
  }

  /** Categories that still group services are deactivated, not deleted. */
  async remove(adminId: string, id: string) {
    const category = await this.requireCategory(id);
    const oldData = this.snapshot(category);

    const serviceCount = await this.serviceRepo.count({
      where: { categoryId: id },
    });

    if (serviceCount) {
      if (!category.isActive) {
        throw new BadRequestException('Category is already deactivated');
      }
      category.isActive = false;
      await this.categoryRepo.save(category);

      await this.audit.record({
        userId: adminId,
        action: 'SERVICE_CATEGORY_DEACTIVATED',
        entityType: 'service_categories',
        entityId: category.id,
        oldData,
        newData: this.snapshot(category),
      });

      return {
        deleted: false,
        deactivated: true,
        reason: `Category still has ${serviceCount} service(s), so it was deactivated instead of deleted`,
      };
    }

    await this.categoryRepo.delete({ id });

    await this.audit.record({
      userId: adminId,
      action: 'SERVICE_CATEGORY_DELETED',
      entityType: 'service_categories',
      entityId: id,
      oldData,
      newData: null,
    });

    return { deleted: true, deactivated: false, reason: null };
  }

  private applyFilters(
    qb: SelectQueryBuilder<ServiceCategory>,
    query: ListAdminServiceCategoriesDto,
  ) {
    if (query.search) {
      qb.andWhere('category.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('category.isActive = :isActive', {
        isActive: query.isActive,
      });
    }
    return qb;
  }

  private async requireCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Service category not found');
    return category;
  }

  private snapshot(category: ServiceCategory) {
    return {
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
    };
  }
}
