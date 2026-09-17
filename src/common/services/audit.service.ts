import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from 'src/database/entities';

export interface AuditInput {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  record(input: AuditInput) {
    return this.auditRepo.save(
      this.auditRepo.create({
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        oldData: input.oldData ?? null,
        newData: input.newData ?? null,
        ipAddress: input.ipAddress ?? null,
      }),
    );
  }
}
