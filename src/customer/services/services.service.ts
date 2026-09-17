import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import {
  Service,
  ServiceCategory,
  ServicePricing,
} from 'src/database/entities';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import { ListCustomerServicesQueryDto } from './dto/list-services.dto';

@Injectable()
export class CustomerServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepo: Repository<ServicePricing>,
  ) {}

  async categories() {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
    }));
  }

  async list(query: ListCustomerServicesQueryDto) {
    const [services, total] = await this.serviceRepo.findAndCount({
      where: {
        isActive: true,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.search ? { name: ILike(`%${query.search}%`) } : {}),
      },
      relations: ['category'],
      order: { name: 'ASC' },
      ...skipTake(query),
    });

    const pricing = services.length
      ? await this.pricingRepo.find({
          where: {
            serviceId: In(services.map((service) => service.id)),
            isActive: true,
          },
        })
      : [];

    const items = services.map((service) => {
      const price = this.pickPrice(pricing, service.id, query.serviceAreaId);
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        categoryId: service.categoryId,
        categoryName: service.category?.name ?? null,
        pricePerHour: price === null ? null : Number(price.pricePerHour),
        serviceAreaId: price?.serviceAreaId ?? null,
      };
    });

    return paginated(items, total, query);
  }

  async detail(id: string) {
    const service = await this.serviceRepo.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });
    if (!service) throw new NotFoundException('Service not found');

    const pricing = await this.pricingRepo.find({
      where: { serviceId: service.id, isActive: true },
      relations: ['serviceArea'],
    });

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      category: service.category
        ? {
            id: service.category.id,
            name: service.category.name,
            imageUrl: service.category.imageUrl,
          }
        : null,
      pricing: pricing.map((row) => ({
        serviceAreaId: row.serviceAreaId,
        serviceAreaName: row.serviceArea?.name ?? null,
        pricePerHour: Number(row.pricePerHour),
      })),
    };
  }

  /** Area-specific price wins, then the area-agnostic row, then nothing. */
  private pickPrice(
    pricing: ServicePricing[],
    serviceId: string,
    serviceAreaId?: string,
  ) {
    const rows = pricing.filter((row) => row.serviceId === serviceId);
    const forArea = serviceAreaId
      ? rows.find((row) => row.serviceAreaId === serviceAreaId)
      : undefined;
    return forArea ?? rows.find((row) => row.serviceAreaId === null) ?? null;
  }
}
