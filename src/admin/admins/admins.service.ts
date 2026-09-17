import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from 'src/database/entities';
import { AuditService } from 'src/common/services/audit.service';
import { TokenService } from 'src/common/auth/token.service';
import { paginated, skipTake } from 'src/common/dto/pagination.dto';
import {
  CreateAdminDto,
  ListAdminsDto,
  UpdateAdminDto,
} from './dto/admins.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AdminAdminsService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private readonly audit: AuditService,
    private readonly tokens: TokenService,
  ) {}

  async list(query: ListAdminsDto) {
    const { skip, take } = skipTake(query);
    const qb = this.adminRepo.createQueryBuilder('admin');

    if (query.search) {
      qb.andWhere(
        `(admin.email ILIKE :search OR admin.firstName ILIKE :search
          OR admin.lastName ILIKE :search)`,
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('admin.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.role) {
      qb.andWhere('admin.role = :role', { role: query.role });
    }

    const [rows, total] = await qb
      .orderBy('admin.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginated(
      rows.map((admin) => this.toProfile(admin)),
      total,
      query,
    );
  }

  async create(actorId: string, dto: CreateAdminDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.adminRepo
      .createQueryBuilder('admin')
      .where('LOWER(admin.email) = :email', { email })
      .getOne();
    if (existing) throw new ConflictException('An admin with that email exists');

    const admin = await this.adminRepo.save(
      this.adminRepo.create({
        email,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        role: dto.role ?? 'ADMIN',
        isActive: true,
      }),
    );

    await this.audit.record({
      userId: actorId,
      action: 'ADMIN_CREATED',
      entityType: 'admins',
      entityId: admin.id,
      oldData: null,
      newData: this.toProfile(admin),
    });

    return this.toProfile(admin);
  }

  async update(actorId: string, id: string, dto: UpdateAdminDto) {
    const admin = await this.requireAdmin(id);
    const oldData = this.toProfile(admin);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const clash = await this.adminRepo
        .createQueryBuilder('admin')
        .where('LOWER(admin.email) = :email', { email })
        .andWhere('admin.id != :id', { id })
        .getOne();
      if (clash) throw new ConflictException('An admin with that email exists');
      admin.email = email;
    }
    if (dto.firstName !== undefined) admin.firstName = dto.firstName.trim() || null;
    if (dto.lastName !== undefined) admin.lastName = dto.lastName.trim() || null;
    if (dto.role !== undefined) admin.role = dto.role;

    let passwordReset = false;
    if (dto.password) {
      admin.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      passwordReset = true;
    }

    await this.adminRepo.save(admin);

    if (passwordReset) {
      await this.tokens.revokeAllForSubject({ sub: admin.id, role: 'admin' });
    }

    await this.audit.record({
      userId: actorId,
      action: passwordReset ? 'ADMIN_UPDATED_WITH_PASSWORD' : 'ADMIN_UPDATED',
      entityType: 'admins',
      entityId: admin.id,
      oldData,
      newData: this.toProfile(admin),
    });

    return {
      ...this.toProfile(admin),
      passwordReset,
      message: passwordReset
        ? 'Admin updated. Their other sessions were signed out.'
        : 'Admin updated',
    };
  }

  async activate(actorId: string, id: string) {
    const admin = await this.requireAdmin(id);
    if (admin.isActive) {
      throw new BadRequestException('Admin is already active');
    }

    admin.isActive = true;
    await this.adminRepo.save(admin);

    await this.audit.record({
      userId: actorId,
      action: 'ADMIN_ACTIVATED',
      entityType: 'admins',
      entityId: admin.id,
      oldData: { isActive: false },
      newData: { isActive: true },
    });

    return { ...this.toProfile(admin), message: 'Admin activated' };
  }

  async deactivate(actorId: string, id: string) {
    if (actorId === id) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const admin = await this.requireAdmin(id);
    if (!admin.isActive) {
      throw new BadRequestException('Admin is already inactive');
    }

    admin.isActive = false;
    await this.adminRepo.save(admin);
    await this.tokens.revokeAllForSubject({ sub: admin.id, role: 'admin' });

    await this.audit.record({
      userId: actorId,
      action: 'ADMIN_DEACTIVATED',
      entityType: 'admins',
      entityId: admin.id,
      oldData: { isActive: true },
      newData: { isActive: false },
    });

    return {
      ...this.toProfile(admin),
      message: 'Admin deactivated and sessions revoked',
    };
  }

  private async requireAdmin(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  private toProfile(admin: Admin) {
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };
  }
}
